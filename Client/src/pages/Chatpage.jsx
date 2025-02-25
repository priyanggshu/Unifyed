import { useContext, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import Callbar from "../components/Callbar";
import { ChatContext } from "../context/Chat_Context";

const ChatPage = () => {
  const { selectedChat } = useContext(ChatContext);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex p-4 h-screen relative">
      {/* Sidebar */}
      <div className="w-[25%] rounded-l-2xl border-l border-gray-400 overflow-hidden">
        <Sidebar />
      </div>

      {/* Chat Window */}
      <div className="w-[50%] h-auto z-20 rounded-2xl border border-gray-300 overflow-hidden">
        {selectedChat ? (
          <ChatWindow startVideoCall={() => setIsVideoCallActive(true)} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xl">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Call Bar */}
      <div className="w-[25%] rounded-r-2xl border-r border-gray-400 overflow-hidden">
        <Callbar
          isVideoCallActive={isVideoCallActive}
          setIsVideoCallActive={setIsVideoCallActive}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

export default ChatPage;
