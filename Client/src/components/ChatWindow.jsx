import { useState, useRef, useContext, useEffect } from "react";
import { FaVideo } from "react-icons/fa6";
import { IoMdCall, IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions, MdKeyboardVoice } from "react-icons/md";
import { AuthContext } from "../context/Auth_Context";
import { ChatContext } from "../context/Chat_Context";

const ChatWindow = ({ startVideoCall }) => {
  const { selectedChat, messages, sendMessageHandler } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send a new message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageHandler(newMessage);
    setNewMessage("");
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      <div className="px-4 pt-2 pb-0 bg-[#EFEEF4] shadow-2xl flex justify-between items-center rounded-t-2xl text-gray-900 h-[6.5rem]">
        {/* Left Side - User Info */}
        <div className="flex items-center gap-3 h-full">
          <img
            src={otherParticipant?.avatar || "https://via.placeholder.com/40"}
            alt="User Avatar"
            className="w-14 h-14 rounded-full border border-yellow-200"
          />
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-semibold">
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
            <FaVideo className="scale-125 hover:scale-150"/>
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
      <div className="flex-grow p-4 h-64 overflow-auto scrollbar scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start"} mb-3`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg shadow-md ${
                  msg.sender === user._id ? "bg-blue-500 text-white" : "bg-white text-gray-700"
                }`}
              >
                {selectedChat.isGroupChat && msg.sender !== user._id && (
                  <p className="text-sm font-bold">{msg.senderName}</p>
                )}
                <p>{msg.content}</p>
                <span className="text-xs text-gray-400 block text-right">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white flex items-center">
        <div className="flex w-full bg-gray-100 rounded-full px-4 py-2 items-center">
          <input
            type="text"
            className="flex-grow bg-transparent p-2 outline-none"
            placeholder="Write your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onClick={handleKeyPress}
          />
          <MdOutlineEmojiEmotions className="text-gray-800 text-2xl mx-2 cursor-pointer" />
          <MdKeyboardVoice className="text-gray-800 text-2xl mx-2 cursor-pointer" />
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