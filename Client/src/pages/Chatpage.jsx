import { useContext, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Callbar from "../components/Callbar";
import { ChatContext } from "../context/Chat_Context";
import { AuthContext } from "../context/Auth_Context";


const ChatPage = () => {
  const { selectedChat } = useContext(ChatContext);
  const { user } = useContext(AuthContext);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [userToCall, setUserToCall] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // ensuring current user exists
  useEffect(() => {
    if (!user && localStorage.getItem("user")) {
      console.log("Using user from localStorage");
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const startVideoCall = (participant) => {
    setUserToCall(participant);
    setIsVideoCallActive(true);
  };

  return (
    <div className={`flex p-4 h-screen relative ${darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"}`}>
      {/* Sidebar */}
      <div className="w-[20%] rounded-l-2xl border-l border-gray-400 overflow-hidden">
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode}/>
      </div>

      {/* Chat Window */}
      <div className={`w-[60%] h-auto z-20 rounded-2xl border ${darkMode ? "border-[#776b88]" : "border-gray-300"}  overflow-hidden`}>
        {selectedChat ? (
          <ChatWindow startVideoCall={startVideoCall} darkMode={darkMode} />
        ) : (
          <div className={`flex items-center justify-center h-full ${darkMode ? "bg-[#090112] text-gray-200" : "bg-white text-gray-500"} text-xl`}>
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Call Bar */}
      <div className="w-[20%] rounded-r-2xl border-r border-gray-400 overflow-hidden">
        <Callbar
          isVideoCallActive={isVideoCallActive}
          setIsVideoCallActive={setIsVideoCallActive}
          currentUser={user}
          userToCallId={userToCall?._id}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

export default ChatPage;