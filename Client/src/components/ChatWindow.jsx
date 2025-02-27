import { useState, useRef, useContext, useEffect } from "react";
import { FaVideo } from "react-icons/fa6";
import { IoMdCall, IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions, MdKeyboardVoice } from "react-icons/md";
import { AuthContext } from "../context/Auth_Context";
import { ChatContext } from "../context/Chat_Context";
import EmojiPicker from "emoji-picker-react";

const ChatWindow = ({ startVideoCall }) => {
  const { selectedChat, messages, sendMessageHandler } =
    useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // Send a new message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageHandler(newMessage);
    setNewMessage("");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Check if a chat is selected
  if (!selectedChat) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-gray-600 text-lg">
        Select a chat to start messaging
      </div>
    );
  }

  // Get the other participant (excluding current user)
  const otherParticipant =
    selectedChat.participants?.find((p) => p._id !== user._id) || null;

  return (
    <div className="flex flex-col h-screen bg-transparent py-4 shadow-lg">
      {/* Chat Header */}
      <div className="px-4 pt-4 pb-0 bg-[#EFEEF4] shadow-xl flex justify-between items-center rounded-t-2xl text-gray-900 h-[5rem]">
        {/* Left Side - User Info */}
        <div className="flex items-center gap-3 h-full">
          <img
            src={otherParticipant?.avatar || "https://via.placeholder.com/40"}
            alt="User Avatar"
            className="w-13 h-13 rounded-full border border-yellow-200"
          />
          <div className="flex flex-col justify-center">
            <h2 className="text-base font-semibold">
              {otherParticipant?.username || "Unknown User"}
            </h2>
            <p className="text-sm text-gray-500">
              {otherParticipant?.lastActive ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Right Side - Call Buttons */}
        <div className="flex space-x-3 gap-2">
          <button
            onClick={() => startVideoCall(otherParticipant)}
            className="px-4 py-0 bg-zinc-300 scale-85 rounded-xl transition hover:text-blue-600"
            title="Start video call"
          >
            <FaVideo className="scale-125 hover:scale-150" />
          </button>
          <button
            className="p-4 bg-zinc-300 scale-85 rounded-xl transition hover:text-green-600"
            title="Start voice call"
          >
            <IoMdCall className="scale-125 hover:scale-150" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto h-[calc(100vh-12rem)] custom-scrollbar bg-[#f7f7f7]">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.sender === user._id;

            return (
              <div
                key={msg._id}
                className={`flex items-end ${
                  isSent ? "justify-end" : "justify-start"
                } mb-4 px-2`}
              >
                {!isSent && (
                  <img
                  src={msg.senderAvatar && msg.senderAvatar.startsWith("http") ? msg.senderAvatar : "https://via.placeholder.com/40"}
                  alt="Sender Avatar"
                  className="w-8 h-8 rounded-full mr-2 object-cover bg-gray-300"
                />
                
                )}

                <div
                  className={`relative px-4 py-2 rounded-lg shadow-md max-w-[75%] ${
                    isSent
                      ? "bg-blue-500 text-white rounded-br-xl"
                      : "bg-gray-200 text-gray-900 rounded-bl-xl"
                  }`}
                >
                  {selectedChat.isGroupChat && !isSent && (
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <span className="text-[10px] text-gray-400 absolute bottom-1 right-2">
                    {msg.timestamp && !isNaN(new Date(msg.timestamp).getTime())
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "⏳"}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 bg-white flex items-center border-t border-gray-300 shadow-md">
        <div className="flex w-full bg-gray-100 rounded-full px-4 py-2 items-center">
          <input
            type="text"
            className="flex-grow bg-transparent p-2 outline-none"
            placeholder="Write your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onClick={handleKeyPress}
          />

          {/* Emoji Picker Toggle */}
          <div className="relative">
            <MdOutlineEmojiEmotions
              className="text-gray-800 text-2xl mx-2 cursor-pointer"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 bg-white shadow-lg rounded-lg">
                <EmojiPicker
                  onEmojiClick={(emojiObject) => handleEmojiClick(emojiObject)}
                />
              </div>
            )}
          </div>

          <button
            className="p-2 rounded-full bg-[#BBE8E3] text-[#03A184] ml-2 hover:bg-[#03A184] hover:text-white transition-colors"
            onClick={sendMessage}
          >
            <IoIosSend className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
