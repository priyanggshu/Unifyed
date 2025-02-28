import mongoose from "mongoose";
import Message from "../db/Message.js";
import Chat from "../db/Chat.js";

export const getMessagesForChat = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.chatId)) {
      return res.status(400).json({ message: "Invalid chat ID" });
    }

    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id.toString())) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ chatId: req.params.chatId })
      .populate("sender", "username email avatar")
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map((msg) => ({
      ...msg,
      timestamp: msg.createdAt.toISOString(),
    }))
      
    res.status(200).json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { content, isEncrypted } = req.body;

  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.participants.includes(req.user._id.toString())) {
      return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    const message = await Message.create({
      sender: req.user._id,
      chatId: req.params.chatId,
      content,
      isEncrypted,
    });

    chat.updatedAt = new Date();
    await chat.save();

    const newMessage = await message.populate("sender", "username email avatar");

    res.status(201).json({
      _id: newMessage._id,
      chatId: newMessage.chatId,
      sender: newMessage.sender,
      content: newMessage.content,
      isEncrypted: newMessage.isEncrypted,
      timestamp: newMessage.createdAt.toISOString(),
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};
