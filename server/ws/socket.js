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
        console.log(`✅ User ${userId} registered with:`)
        console.log(`   - SocketID: ${socket.id}`)
        console.log(`   - PeerID: ${peerId}`)
        console.log(`📊 Active users: ${activeUsers.size}`)

        // Broadcast user status to all connected clients
        io.emit("userStatus", { userId, online: true, peerId })
      }
    })

    // Call User
    socket.on("callUser", ({ userToCall, signalData, from, peerId }) => {
      const receiver = activeUsers.get(userToCall)
      console.log(`\n📞 Call Request:`)
      console.log(`   From: ${from} (PeerID: ${peerId})`)
      console.log(`   To: ${userToCall}`)

      if (receiver) {
        console.log(`✅ Receiver found:`)
        console.log(`   Socket: ${receiver.socketId}`)
        console.log(`   PeerID: ${receiver.peerId}`)

        io.to(receiver.socketId).emit("incomingCall", {
          signal: signalData,
          from,
          peerId: peerId || activeUsers.get(from)?.peerId,
        })
      } else {
        console.log(`❌ Call failed: Receiver ${userToCall} not found in active users`)
        console.log(`📊 Current active users:`, Array.from(activeUsers.keys()))
        socket.emit("callFailed", { reason: "user_unavailable", userToCall })
      }
    })

    // Answer Call
    socket.on("answerCall", ({ to, signal, peerId }) => {
      const caller = activeUsers.get(to)
      console.log(`\n📞 Call Answer:`)
      console.log(`   From: ${socket.id} (PeerID: ${peerId})`)
      console.log(`   To: ${to}`)

      if (caller) {
        console.log(`✅ Sending callAccepted to ${to}:`)
        console.log(`   Socket: ${caller.socketId}`)
        console.log(`   Signal data:`, signal)
        io.to(caller.socketId).emit("callAccepted", { signal, peerId })
      } else {
        console.log(`❌ Answer failed: Caller ${to} not found in active users`)
        console.log(`📊 Current active users:`, Array.from(activeUsers.keys()))
      }
    })

    // End Call
    socket.on("endCall", ({ to }) => {
      const receiver = activeUsers.get(to)
      console.log(`\n📞 Call End:`)
      console.log(`   From: ${socket.id}`)
      console.log(`   To: ${to}`)

      if (receiver) {
        console.log(`✅ Sending callEnded to ${to} (Socket: ${receiver.socketId})`)
        io.to(receiver.socketId).emit("callEnded")
      } else {
        console.log(`❌ End call failed: User ${to} not found in active users`)
      }
    })

    // Handle Disconnection
    socket.on("disconnect", () => {
      const userEntry = [...activeUsers.entries()].find(([, data]) => data.socketId === socket.id)
      if (userEntry) {
        const userId = userEntry[0]
        activeUsers.delete(userId)
        console.log(`\n❌ User disconnected:`)
        console.log(`   User ID: ${userId}`)
        console.log(`   Socket: ${socket.id}`)
        console.log(`📊 Remaining active users: ${activeUsers.size}`)

        // Broadcast user status to all connected clients
        io.emit("userStatus", { userId, online: false })
      }
      console.log(`🔴 Client disconnected: ${socket.id}`)
    })

    // Join Chat Room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId)
      console.log(`\n👥 User joined chat:`)
      console.log(`   User: ${socket.id}`)
      console.log(`   Chat: ${chatId}`)
    })

    // Send Message
    socket.on("sendMessage", (newMessage) => {
      if (newMessage.chatId) {
        console.log(`\n💬 New message in chat ${newMessage.chatId}:`)
        console.log(`   From: ${socket.id}`)
        console.log(`   Content length: ${newMessage.content?.length || 0} chars`)
        socket.to(newMessage.chatId).emit("messageReceived", newMessage)
      }
    })
  })

  return io
}

export default setupSocketServer

