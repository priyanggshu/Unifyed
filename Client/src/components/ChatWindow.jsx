import { useState, useRef, useContext, useEffect } from "react";
import { FaVideo } from "react-icons/fa6";
import { IoMdCall, IoIosSend } from "react-icons/io";
import { MdOutlineEmojiEmotions, MdKeyboardVoice } from "react-icons/md";
import { AuthContext } from "../context/Auth_Context";
import { ChatContext } from "../context/Chat_Context";
import EmojiPicker from "emoji-picker-react";
import Message from "./Message";

const ChatWindow = ({ startVideoCall, darkMode, setView }) => {
  const { selectedChat, messages, sendMessageHandler } = useContext(ChatContext);
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
      <div className={`flex flex-col h-screen items-center justify-center ${darkMode ? "bg-[#090112] text-gray-300" : "bg-[#f7f7f7] text-gray-600"} text-md`}>
        Select a chat to start messaging
      </div>
    );
  }

  // Get the other participant (excluding current user)
  const otherParticipant =
    selectedChat.participants?.find((p) => p._id !== user._id) || null;

  return (
    <div className={`flex flex-col h-full ${darkMode ? "bg-[#090112]" : "bg-[#f7f7f7]"} shadow-2xl md:rounded-xl overflow-hidden`}>
      {/* Chat Header */}
      <div className={`px-4 py-5 ${darkMode ? "bg-[#421b6b] text-white" : "bg-[#ddd4ec] text-gray-900"} shadow-md flex justify-between items-center h-[4rem]`}>
        {/* Left Side - User Info */}
        <div className="flex items-center gap-4">
          <button onClick={() => setView("sidebar")} className={`md:hidden scale-125 py-2 ${darkMode ? "text-white" : "text-black"} `}>
            ←
          </button>
          <img
            src={otherParticipant?.avatar || "https://via.placeholder.com/40"}
            alt="User Avatar"
            className="w-12 h-12 rounded-full border border-yellow-200"
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold">
              {otherParticipant?.username || "Unknown User"}
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-200" : "text-gray-600"} `}>
              {otherParticipant?.lastActive ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Right Side - Call Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => startVideoCall(otherParticipant)}
            className={`p-2 ${darkMode ? "bg-[#B9B1C0]" : "bg-white hover:text-blue-600"} rounded-xl hover:scale-110 transition-all  shadow-md`}
            title="Start video call"
          >
            <FaVideo className={`text-xl ${darkMode ? "text-indigo-700 hover:text-emerald-700" : "text-blue-950 hover:text-sky-500"} hover:scale-110 `}/>
          </button>
          <button
            className={`p-2 ${darkMode ? "bg-[#B9B1C0]" : "bg-white"} hover:scale-110 transition-all rounded-xl shadow-md`}
            title="Start voice call"
          >
            <IoMdCall className={`text-xl ${darkMode ? "text-indigo-700 hover:text-emerald-600" : "text-blue-950 hover:text-green-500"} hover:scale-110 `}/>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={`flex-grow p-4 overflow-auto scrollbar scrollbar-thin scrollbar-thumb-blue-500 ${darkMode ? "scrollbar-track-gray-700 bg-[#090112]" : "scrollbar-track-gray-200 bg-[#f7f7f7]"} custom-scrollbar`}>
        {messages.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message darkMode={darkMode} key={msg._id || index} message={msg} currentUser={user} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`pb-4 px-2 flex items-center rounded-full ${darkMode ? "bg-[#427a73]" : "bg-[#BBE8E3]"} shadow-2xl sticky bottom-0 w-full`}>
        <div className={`flex w-full ${darkMode ? "bg-[#4C257E]" : "bg-gray-100"} rounded-full px-2 py-2 items-center shadow-sm`}>
          {/* Text Input */}
          <input
            type="text"
            className={`flex-grow bg-transparent p-2 outline-none ${darkMode ? " text-white placeholder-gray-200" : "text-gray-800 placeholder-gray-500"}`}
            placeholder="Write your message.."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          {/* Emoji Picker Toggle */}
          <div className="relative">
            <MdOutlineEmojiEmotions
              className={`${darkMode ? "text-gray-300" : "text-gray-600"} text-2xl mx-3 cursor-pointer hover:text-yellow-500 transition`}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-3 scale-90 md:bottom-5 right-[-2rem] md:right-0 shadow-xl rounded-2xl">
                   

                <EmojiPicker onEmojiClick={handleEmojiClick} theme={darkMode ? "dark" : "light"}/>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            className="p-2 rounded-full bg-blue-500 text-white ml-2 hover:bg-blue-600 transition-all transform active:scale-95 shadow-md"
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
