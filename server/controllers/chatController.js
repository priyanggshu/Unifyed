import Chat from "../db/Chat.js";

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id }).populate("participants", "-password");
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createChat = async (req, res) => {
  const { participants, isGroupChat, chatName } = req.body;

  if (!participants || participants.length < 2) {
    return res.status(400).json({ message: "At least two participants are required" });
  }

  try {
    const chat = await Chat.create({
      participants,
      isGroupChat,
      chatName: isGroupChat ? chatName : undefined,
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
