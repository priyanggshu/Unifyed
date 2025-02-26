import { Server } from "socket.io";
import CallLog from "../db/CallLog.js";

const activeUsers = new Map(); // Store users as { userId: { socketId, peerId } }

const setupSocketServer = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);
    
    socket.on("callUser", async ({ userToCall, from, peerId }) => {
      const receiver = activeUsers.get(userToCall);
      if (receiver) {
        io.to(receiver.socketId).emit("incomingCall", { from, peerId });
  
        // Log call attempt
        await CallLog.create({
          callerId: from,
          receiverId: userToCall,
          callType: "video",
          status: "missed",
        });
      }
    });

    socket.on("callAccepted", async ({ peerId, from }) => {
      await CallLog.findOneAndUpdate(
        { callerId: from, receiverId: socket.id },
        { status: "completed" }
      );
    });

    const iceServers = [
      { urls: "stun:stun.l.google.com:19302" }, // Public STUN server
      {
        urls: "turn:your-turn-server.com",
        username: "your-turn-username",
        credential: "your-turn-password",
      }, // Replace with actual TURN credentials
    ];

    // Send ICE server config to clients
    socket.emit("iceServers", iceServers);

    // Register user with both Socket.io and PeerJS ID
    socket.on("registerUser", ({ userId, peerId }) => {
      if (userId && peerId) {
        // Store both the socket ID and peer ID for this user
        activeUsers.set(userId, { socketId: socket.id, peerId });
        socket.join(userId); // Join a room with the user's ID

        console.log(`✅ User ${userId} registered with:`);
        console.log(`   - SocketID: ${socket.id}`);
        console.log(`   - PeerID: ${peerId}`);
        console.log(`📊 Active users: ${activeUsers.size}`);
        console.log(
          `   Active user IDs: ${Array.from(activeUsers.keys()).join(", ")}`
        );

        // Broadcast user status to all connected clients
        io.emit("userStatus", { userId, online: true, peerId });
      } else {
        console.log(`❌ Registration failed - missing userId or peerId`);
      }
    });

    socket.on("sendIceCandidate", ({ to, candidate }) => {
      const receiver = activeUsers.get(to);
      if (receiver) {
        io.to(receiver.socketId).emit("receiveIceCandidate", { from: socket.id, candidate });
      }
    });

    // Handle WebRTC SDP Offers
    socket.on("sendOffer", ({ to, offer }) => {
      const receiver = activeUsers.get(to);
      if (receiver) {
        io.to(receiver.socketId).emit("receiveOffer", { from: socket.id, offer });
      }
    });

    // Handle WebRTC SDP Answers
    socket.on("sendAnswer", ({ to, answer }) => {
      const receiver = activeUsers.get(to);
      if (receiver) {
        io.to(receiver.socketId).emit("receiveAnswer", { from: socket.id, answer });
      }
    });

    // Call User
    socket.on("callUser", ({ userToCall, from, peerId }) => {
      const receiver = activeUsers.get(userToCall);
      console.log(`\n📞 Call Request:`);
      console.log(`   From: ${from} (PeerID: ${peerId})`);
      console.log(`   To: ${userToCall}`);
      console.log(
        `   Active users: ${Array.from(activeUsers.keys()).join(", ")}`
      );

      if (receiver) {
        console.log(`✅ Receiver found:`);
        console.log(`   Socket: ${receiver.socketId}`);
        console.log(`   PeerID: ${receiver.peerId}`);

        io.to(receiver.socketId).emit("incomingCall", {
          from,
          peerId,
        });
      } else {
        console.log(
          `❌ Call failed: Receiver ${userToCall} not found in active users`
        );
        console.log(`📊 Current active users:`, Array.from(activeUsers.keys()));
        socket.emit("callFailed", { reason: "user_unavailable", userToCall });
      }
    });

    // Answer Call
    socket.on("answerCall", ({ to, peerId }) => {
      // Find the caller by user ID
      const caller = activeUsers.get(to);
      console.log(`\n📞 Call Answer:`);
      console.log(`   From: ${socket.id} (PeerID: ${peerId})`);
      console.log(`   To: ${to}`);
      console.log(`   Looking for user with ID: ${to}`);
      console.log(
        `   Active users: ${Array.from(activeUsers.keys()).join(", ")}`
      );

      if (caller) {
        console.log(`✅ Sending callAccepted to ${to}:`);
        console.log(`   Socket: ${caller.socketId}`);
        io.to(caller.socketId).emit("callAccepted", { peerId });
      } else {
        console.log(`❌ Answer failed: Caller ${to} not found in active users`);
        console.log(`📊 Current active users:`, Array.from(activeUsers.keys()));
        // Notify the answerer that the caller is no longer available
        socket.emit("callFailed", {
          reason: "caller_unavailable",
          userToCall: to,
        });
      }
    });

    // End Call
    socket.on("endCall", async ({ to }) => {

      await CallLog.findOneAndUpdate(
        { callerId: socket.id, receiverId: to },
        { status: "completed", duration: Math.floor(Date.now() / 1000) }
      );
      
      const receiver = activeUsers.get(to);
      console.log(`\n📞 Call End:`);
      console.log(`   From: ${socket.id}`);
      console.log(`   To: ${to}`);

      if (receiver) {
        console.log(
          `✅ Sending callEnded to ${to} (Socket: ${receiver.socketId})`
        );
        io.to(receiver.socketId).emit("callEnded");
      } else {
        console.log(`❌ End call failed: User ${to} not found in active users`);
      }
    });

    // Handle Disconnection
    socket.on("disconnect", () => {
      const userEntry = [...activeUsers.entries()].find(
        ([, data]) => data.socketId === socket.id
      );
      if (userEntry) {
        const userId = userEntry[0];
        activeUsers.delete(userId);
        console.log(`\n❌ User disconnected:`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Socket: ${socket.id}`);
        console.log(`📊 Remaining active users: ${activeUsers.size}`);
        console.log(
          `   Remaining user IDs: ${Array.from(activeUsers.keys()).join(", ")}`
        );

        // Broadcast user status to all connected clients
        io.emit("userStatus", { userId, online: false });
      }
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });

    // Join Chat Room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`\n👥 User joined chat:`);
      console.log(`   User: ${socket.id}`);
      console.log(`   Chat: ${chatId}`);
    });

    // Send Message
    socket.on("sendMessage", (newMessage) => {
      if (newMessage.chatId) {
        console.log(`\n💬 New message in chat ${newMessage.chatId}:`);
        console.log(`   From: ${socket.id}`);
        console.log(
          `   Content length: ${newMessage.content?.length || 0} chars`
        );
        socket.to(newMessage.chatId).emit("messageReceived", newMessage);
      }
    });
  });

  return io;
};

export default setupSocketServer;
