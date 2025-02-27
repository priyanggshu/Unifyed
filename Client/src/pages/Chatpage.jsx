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

  // Ensure we have the current user
  useEffect(() => {
    if (!user && localStorage.getItem("user")) {
      // If AuthContext doesn't have user but localStorage does, use that
      console.log("Using user from localStorage");
    }
  }, [user]);

  const startVideoCall = (participant) => {
    setUserToCall(participant);
    setIsVideoCallActive(true);
  };

  return (
    <div className="flex p-4 h-screen relative">
      {/* Sidebar */}
      <div className="w-[20%] rounded-l-2xl border-l border-gray-400 overflow-hidden">
        <Sidebar />
      </div>

      {/* Chat Window */}
      <div className="w-[60%] h-auto z-20 rounded-2xl border border-gray-300 overflow-hidden">
        {selectedChat ? (
          <ChatWindow startVideoCall={startVideoCall} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-xl">
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
        />
      </div>
    </div>
  );
};

export default ChatPage;