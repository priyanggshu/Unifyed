import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

const socket = io("http://localhost:3000");

const VideoCall = ({ currentUser }) => {
  const [stream, setStream] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const peerRef = useRef(null);
  const myVideo = useRef();
  const userVideo = useRef();

  // Function to request media devices
  const startCall = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setStream(userStream);
      if (myVideo.current) {
        myVideo.current.srcObject = userStream;
      }
      setCallStarted(true);
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
    <div className="flex flex-col items-center mt-4 p-4 border rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold text-gray-700">Video Call</h2>
      <div className="flex space-x-4 mt-4">
        <video ref={myVideo} autoPlay playsInline className="w-1/2 border rounded-lg" />
        {callAccepted && (
          <video ref={userVideo} autoPlay playsInline className="w-1/2 border rounded-lg" />
        )}
      </div>

      {/* Call Controls */}
      <div className="mt-4 flex space-x-2">
        {!callStarted && (
          <button
            onClick={startCall}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
          >
            Start Call
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

export default VideoCall;
