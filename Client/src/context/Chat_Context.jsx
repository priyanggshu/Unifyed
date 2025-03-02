import { createContext, useState, useEffect, useContext } from "react";
import {
  getChats,
  getMessages,
  sendMessage,
  createChat,
} from "../services/chatService";
import { AuthContext } from "./Auth_Context";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = user?.token || null;

  // ✅ Fetch chats when user logs in
  useEffect(() => {
    if (token) {
      (async () => {
        await fetchChats();
      })();
    }
  }, [token]);

  const fetchChats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getChats(token);
      setChats(data);
    } catch (error) {
      console.error("❌ Error fetching chats:", error.response?.data || error);
    }
    setLoading(false);
  };

  // ✅ Listen for new messages in real-time
  useEffect(() => {
    if (!selectedChat?._id) return;

    socket.emit("joinChat", selectedChat._id);

    const handleMessageReceived = (newMessage) => {
      if (newMessage.chatId === selectedChat._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.off("messageReceived"); // Prevent duplicate listeners
    socket.on("messageReceived", handleMessageReceived);

    return () => {
      socket.off("messageReceived", handleMessageReceived);
    };
  }, [selectedChat]);

  // ✅ Select a chat or create a new one
  const selectChat = async (otherUser) => {
    setLoading(true);

    try {
      let chat = chats.find(
        (c) => !c.isGroupChat && c.participants.some((p) => p._id === otherUser._id)
      );

      if (!chat) {
        console.log("🔄 Creating a new chat...");
        chat = await createChat(
          { participants: [user._id, otherUser._id] },
          token
        );

        if (!chats.some((c) => c._id === chat._id)) {
          setChats((prevChats) => [...prevChats, chat]);
        }
      }

      console.log("✅ Chat Selected:", chat);
      setSelectedChat(chat);

      const messages = await getMessages(chat._id, token);
      setMessages(messages);
    } catch (error) {
      console.error("❌ Error fetching messages:", error.response?.data || error);
    }
    setLoading(false);
  };

  // ✅ Send a message
  const sendMessageHandler = async (messageContent) => {
    if (!selectedChat || !token) return;
    try {
      const messageData = { senderId: user._id, content: messageContent };
      const newMessage = await sendMessage(
        selectedChat._id,
        messageData,
        token
      );

      socket.emit("sendMessage", newMessage);

      //  Update UI instantly
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("❌ Error sending message:", error.response?.data || error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        selectedChat,
        messages,
        loading,
        selectChat,
        sendMessageHandler,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
