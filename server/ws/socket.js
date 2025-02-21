import { Server } from "socket.io";

const activeUsers = new Map(); // connected users tracking

const setupSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("registerUser", (userId) => {   // store active users with socket ID
      if(userId) {
        activeUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} registered with socket Id ${socket.id}`);
      }
    })

    // message sending
    socket.on("sendMessage", ({senderId, receiverId, message}) => {
      if(!senderId || !receiverId || !message) return;
      console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

      const receiverSocketId = activeUsers.get(receiverId);
      if(receiverSocketId) {
        io.to(receiverSocketId).emit("message", { senderId, message });
      }
      });

    // WebRTC Call Handling
    socket.on("callUser", ({ userToCall, signalData, from }) => {
      const userSocketId = activeUsers.get(userToCall);

      if(userSocketId) {
        io.to(userSocketId).emit("incomingCall", { signal: signalData, from });
      }
    });

    socket.on("answerCall", ({ to, signal}) => {
      const userSocketId = activeUsers.get(to);
      
      if(userSocketId) {
        io.to(userSocketId).emit("callAccepted", signal);
      }
    });

    socket.on("disconnect", () => {
      const userId = [...activeUsers.entries()].find(([, id]) => id === socket.id)?.[0];

      if(userId) {
        activeUsers.delete(userId);
        console.log(`User ${userId} disconnected from active  users.`);
      }
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export default setupSocketServer;
