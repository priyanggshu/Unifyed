import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import {  LuCamera, LuCameraOff } from "react-icons/lu"; // vc
import { FaMicrophoneAlt, FaMicrophoneAltSlash } from "react-icons/fa"; // mute
import { MdOutlineCallEnd } from "react-icons/md";


const socket = io("http://localhost:3000");

const Callbar = ({ isVideoCallActive, setIsVideoCallActive, currentUser }) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef(null);

  // Fetch Available Devices
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      const audioDevices = devices.filter((d) => d.kind === "audioinput");

      setAvailableCameras(videoDevices);
      setAvailableMicrophones(audioDevices);

      // Set default camera & mic only if not set
      if (!selectedCamera && videoDevices.length > 0) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      if (!selectedMicrophone && audioDevices.length > 0) {
        setSelectedMicrophone(audioDevices[0].deviceId);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedCamera && selectedMicrophone) {
      startVideoPreview();
    }
  }, [selectedCamera, selectedMicrophone]);

  const startVideoPreview = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMicrophone
          ? { deviceId: { exact: selectedMicrophone } }
          : true,
      });

      setStream(userStream);
      if (myVideo.current) myVideo.current.srcObject = userStream;

      socket.emit("previewStream", {
        userId: currentUser._id,
        streamId: userStream.id,
      });
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
    }
  };

  const toggleMute = () => {
    if (!stream) return;
    stream
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (!stream) return;
    stream
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setIsVideoOn(!isVideoOn);
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    setStream(null);
    setRemoteStream(null);
    setIsVideoCallActive(false);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 rounded-lg shadow-lg bg-gray-100">
      <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
        📞 Video Call
      </h2>

      {/* 🔹 Remote User Video Section (Top Half) */}
      <div className="flex-1 flex items-center justify-center bg-gray-300 rounded-lg overflow-hidden">
        {remoteStream ? (
          <video
            ref={userVideo}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-500">Waiting for user...</div>
        )}
      </div>

      {/* 🔹 Current User Video Section (Bottom Half) */}
      <div className="flex-1 flex flex-col items-center bg-gray-200 rounded-lg overflow-hidden mt-4 p-4">
        {stream ? (
          <video
            ref={myVideo}
            autoPlay
            playsInline
            className="w-full h-3/4 object-cover"
          />
        ) : (
          <div className="text-gray-500 h-3/4 flex items-center justify-center">
            Your preview will appear here
          </div>
        )}

        {/* 🎚️ Device Selection (Inside Bottom Section) */}
        <div className="w-full flex flex-col space-y-2 mt-4">
          {/* Camera Selection */}
          <label className="text-gray-600 font-medium">Select Camera:</label>
          <select
            onChange={(e) => setSelectedCamera(e.target.value)}
            value={selectedCamera}
            className="w-full p-2 border rounded-md"
          >
            {availableCameras.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>

          {/* Microphone Selection */}
          <label className="text-gray-600 font-medium">
            Select Microphone:
          </label>
          <select
            onChange={(e) => setSelectedMicrophone(e.target.value)}
            value={selectedMicrophone}
            className="w-full p-2 border rounded-md"
          >
            {availableMicrophones.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        {/* 🎛️ Call Controls */}
        <div className="mt-4 flex justify-center space-x-4">
          <button
            onClick={toggleMute}
            className="p-4 border border-blue-400 rounded-3xl"
          >
            {isMuted ? <FaMicrophoneAltSlash className="scale-150"/> : <FaMicrophoneAlt className="scale-150"/>}
          </button>
          <button
            onClick={toggleVideo}
            className=" p-4 border border-blue-300 rounded-3xl"
          >
            {isVideoOn ? <LuCameraOff className="scale-150"/> : <LuCamera className="scale-150"/>}
          </button>
          <button
            onClick={endCall}
            className="p-4 bg-red-200 rounded-3xl"
          >
            <MdOutlineCallEnd className="scale-200 text-red-500 "/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Callbar;
