import { useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import VideoCall from "../components/VideoCall";
import { ChatContext } from "../context/Chat_Context";

const ChatPage = () => {
  const { selectedChat } = useContext(ChatContext); // ✅ Use ChatContext
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex p-4  h-screen">
      <div className="w-[25%] rounded-l-2xl border border-gray-300 overflow-hidden">
        <Sidebar />
      </div>
      
      <div className="w-[75%] overflow-hidden">
        {isVideoCallActive ? (
          <VideoCall currentUser={currentUser} onEndCall={() => setIsVideoCallActive(false)} />
        ) : selectedChat ? (
          <ChatWindow startVideoCall={() => setIsVideoCallActive(true)} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xl">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
