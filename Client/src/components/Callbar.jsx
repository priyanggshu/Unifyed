import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import VideoCall from "./VideoCall";

const socket = io("http://localhost:3000");

const Callbar = ({ isVideoCallActive, setIsVideoCallActive, currentUser }) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null); // Store other user's stream preview
  const [callStarted, setCallStarted] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const peerRef = useRef(null);
  const myVideo = useRef();
  const userVideo = useRef();

  // Function to start video preview
  const startVideoPreview = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(userStream);
      if (myVideo.current) {
        myVideo.current.srcObject = userStream;
      }

      // Emit preview stream event
      socket.emit("previewStream", {
        userId: currentUser._id,
        streamId: userStream.id,
      });
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
      alert("Please allow camera & microphone access in your browser.");
    }
  };

  useEffect(() => {
    socket.on("incomingCall", ({ from, signal }) => {
      setReceivingCall(true);
      setCaller(from);
      setCallerSignal(signal);
    });

    // ✅ Listen for video preview from other user
    socket.on("userPreview", ({ streamId }) => {
      if (userVideo.current) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((remote) => {
          setRemoteStream(remote);
          userVideo.current.srcObject = remote;
        });
      }
    });

    return () => {
      socket.off("incomingCall");
      socket.off("userPreview");
    };
  }, []);

  const answerCall = () => {
    if (!stream) {
      alert("⚠️ You must start the call first.");
      return;
    }

    setCallAccepted(true);
    setReceivingCall(false);

    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", (peerId) => {
      socket.emit("answerCall", { signal: peerId, to: caller });
    });

    peer.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userStream) => {
        if (userVideo.current) {
          userVideo.current.srcObject = userStream;
        }
      });
    });
  };

  return (
    <div className="flex flex-col h-full w-full p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold text-gray-700 text-center mb-2">Video Call</h2>

      <div className="flex flex-col h-full space-y-4">
        {/* 🔹 Current User Video Section (Top) */}
        <div className="flex-1 flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden">
          {stream ? (
            <video ref={myVideo} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-500">Your preview will appear here</div>
          )}
        </div>

        {/* 🔹 Selected User Video Section (Bottom) */}
        <div className="flex-1 flex items-center justify-center bg-gray-300 rounded-lg overflow-hidden">
          {remoteStream ? (
            <video ref={userVideo} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-500">Waiting for user preview...</div>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div className="mt-4 flex justify-center space-x-4">
        {!callStarted && (
          <button
            onClick={startVideoPreview}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Start Video Preview
          </button>
        )}
        {receivingCall && !callAccepted && (
          <button
            onClick={answerCall}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
          >
            Answer Call
          </button>
        )}
      </div>
    </div>
  );
};

export default Callbar;
