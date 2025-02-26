import { Server } from "socket.io"

const activeUsers = new Map() // Store users as { userId: { socketId, peerId } }

const setupSocketServer = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  })

  io.on("connection", (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`)

    // Register user with both Socket.io and PeerJS ID
    socket.on("registerUser", ({ userId, peerId }) => {
      if (userId && peerId) {
        activeUsers.set(userId, { socketId: socket.id, peerId })
        socket.join(userId)
        console.log(`✅ User ${userId} registered: SocketID: ${socket.id}, PeerID: ${peerId}`)

        // Broadcast user status to all connected clients
        io.emit("userStatus", { userId, online: true, peerId })
      }
    })

    // Call User
    socket.on("callUser", ({ userToCall, signalData, from, peerId }) => {
      const receiver = activeUsers.get(userToCall)
      console.log(`📞 Received callUser event. Caller: ${from}, Receiver: ${userToCall}`)

      if (receiver) {
        console.log(
          `📤 Sending call request to ${userToCall} (Socket: ${receiver.socketId}, PeerID: ${receiver.peerId})`,
        )
        io.to(receiver.socketId).emit("incomingCall", {
          signal: signalData,
          from,
          peerId: peerId || activeUsers.get(from)?.peerId,
        })
      } else {
        console.log(`❌ Call failed: User ${userToCall} not found in active users.`)
        // Notify caller that user is not available
        socket.emit("callFailed", { reason: "user_unavailable", userToCall })
      }
    })

    // Answer Call
    socket.on("answerCall", ({ to, signal, peerId }) => {
      const caller = activeUsers.get(to)
      console.log(`📞 answerCall event received. Call from ${to} answered by ${socket.id}`)

      if (caller) {
        console.log(`✅ Sending callAccepted event to ${to} (Socket: ${caller.socketId})`)
        io.to(caller.socketId).emit("callAccepted", { signal, peerId })
      } else {
        console.log(`❌ Answer failed: User ${to} not found in active users.`)
      }
    })

    // End Call
    socket.on("endCall", ({ to }) => {
      const receiver = activeUsers.get(to)
      if (receiver) {
        io.to(receiver.socketId).emit("callEnded")
      }
    })

    // Handle Disconnection
    socket.on("disconnect", () => {
      const userEntry = [...activeUsers.entries()].find(([, data]) => data.socketId === socket.id)
      if (userEntry) {
        const userId = userEntry[0]
        activeUsers.delete(userId)
        console.log(`❌ User ${userId} disconnected.`)

        // Broadcast user status to all connected clients
        io.emit("userStatus", { userId, online: false })
      }
      console.log("🔴 Client disconnected:", socket.id)
    })

    // Join Chat Room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId)
      console.log(`User joined chat room: ${chatId}`)
    })

    // Send Message
    socket.on("sendMessage", (newMessage) => {
      if (newMessage.chatId) {
        socket.to(newMessage.chatId).emit("messageReceived", newMessage)
      }
    })
  })

  return io
}

export default setupSocketServer

