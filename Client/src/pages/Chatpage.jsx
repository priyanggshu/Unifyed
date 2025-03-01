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
  const [darkMode, setDarkMode] = useState
  ( localStorage.getItem("darkMode") === "true" );

  const [view, setView] = useState("sidebar"); // "sidebar", "chat", "call"

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
    setView("call");
  };

  return (
    <div className={`flex md:p-3 h-screen relative ${darkMode ? "bg-zinc-900 text-white" : "bg-white text-black"}`}>
      {/* Sidebar */}
      <div className={`w-full md:w-[20%] md:block ${view === "sidebar" ? "block" : "hidden"}`}>
        <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} setView={setView}/>
      </div>

      {/* Chat Window */}
      <div className={`w-full md:w-[60%] md:block ${view === "chat" ? "block" : "hidden"} sm:w-full`}>
        {selectedChat ? (
          <ChatWindow startVideoCall={startVideoCall} darkMode={darkMode} setView={setView}/>
        ) : (
          <div className={`flex items-center justify-center h-full ${darkMode ? "bg-[#090112] text-gray-200" : "bg-white text-gray-500"} text-xl`}>
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Call Bar */}
      <div className={`w-full md:w-[20%] md:block ${view === "call" ? "block" : "hidden"} sm:w-full`}>
        <Callbar
          isVideoCallActive={isVideoCallActive}
          setIsVideoCallActive={setIsVideoCallActive}
          currentUser={user}
          userToCallId={userToCall?._id}
          darkMode={darkMode}
          setView={setView}
        />
      </div>
    </div>
  );
};

export default ChatPage;