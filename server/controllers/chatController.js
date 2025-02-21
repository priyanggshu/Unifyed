import Chat from "../db/Chat.js";

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch chats",error: error.message });
  }
};

export const createChat = async (req, res) => {
  const { participants, isGroupChat, chatName } = req.body;

  if (!participants || participants.length < 1) {
    return res.status(400).json({ message: "At least one participant is required" });
  }

  // ensures logged-in user is part of the chat
  if(!participants.includes(req.user._id.toString())) {
    participants.push(req.user._id.toString());
  }

  if(!isGroupChat) {
    const existingChat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: participants, $size: 2}
    })

    if(existingChat) {
      return res.status(400).json({ message: "Chat already exists" });
    }
  }

  if(isGroupChat && !chatName) {
    return res.status(400).json({ message: "Group chats require a chat name" });
  }

  try {
    const chat = await Chat.create({
      participants,
      isGroupChat,
      chatName: isGroupChat ? chatName : undefined,
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Failed to create chat", error: error.message });
  }
};
