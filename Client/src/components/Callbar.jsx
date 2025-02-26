"use client"

import { useEffect, useRef, useState, useContext } from "react"
import { io } from "socket.io-client"
import Peer from "peerjs"
import { LuCamera, LuCameraOff } from "react-icons/lu"
import { FaMicrophoneAlt, FaMicrophoneAltSlash } from "react-icons/fa"
import { MdOutlineCallEnd } from "react-icons/md"
import { IoSettingsOutline } from "react-icons/io5"
import { AuthContext } from "../context/Auth_Context"
import { ChatContext } from "../context/Chat_Context"

// Connect to the same port as the server
const socket = io("http://localhost:3000")

const Callbar = ({ isVideoCallActive, setIsVideoCallActive }) => {
  const { user } = useContext(AuthContext)
  const { selectedChat } = useContext(ChatContext)

  const [stream, setStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [availableCameras, setAvailableCameras] = useState([])
  const [availableMicrophones, setAvailableMicrophones] = useState([])
  const [selectedCamera, setSelectedCamera] = useState("")
  const [selectedMicrophone, setSelectedMicrophone] = useState("")
  const [peer, setPeer] = useState(null)
  const [peerId, setPeerId] = useState(null)
  const [incomingCallerId, setIncomingCallerId] = useState(null)
  const [incomingCall, setIncomingCall] = useState(false)
  const [callAccepted, setCallAccepted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const myVideo = useRef()
  const userVideo = useRef()

  // Get the other participant from the selected chat
  const otherParticipant = selectedChat?.participants?.find((p) => p._id !== user?._id)

  // Initialize PeerJS
  useEffect(() => {
    if (!user?._id) return;
    const newPeer = new Peer({
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
        ]
      }
    });
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      setPeerId(id);
      socket.emit("registerUser", { userId: user._id, peerId: id });
    });

    newPeer.on("call", (call) => {
      setIncomingCall(true);
      setIncomingCallerId(call.peer);
      window.incomingCall = call;
    });

    return () => newPeer.destroy();
  }, [user?._id]);

  // Socket event listeners
  useEffect(() => {
    if (!user?._id) return

    socket.on("incomingCall", ({ from, peerId }) => {
      console.log("📞 Incoming call from:", from, "PeerID:", peerId)
      setIncomingCall(true)
      setIncomingCallerId(from)

      // Store the caller's peerId for answering
      window.callerPeerId = peerId
    })

    socket.on("callAccepted", ({ peerId }) => {
      console.log("✅ Call accepted by remote user")
      setCallAccepted(true)

      // If we have a stored outgoing call and stream, connect with the remote peer
      if (window.outgoingCall && stream) {
        const call = peer.call(peerId, stream)
        call.on("stream", (remoteStream) => {
          console.log("✅ Remote stream received after call accepted")
          setRemoteStream(remoteStream)
          if (userVideo.current) {
            userVideo.current.srcObject = remoteStream
          }
        })
      }
    })

    socket.on("callEnded", () => {
      console.log("❌ Call ended by remote user")
      endCall()
    })

    return () => {
      socket.off("incomingCall")
      socket.off("callAccepted")
      socket.off("callEnded")
    }
  }, [user?._id, peer, stream])

  // Enumerate available devices
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          setAvailableCameras(devices.filter((d) => d.kind === "videoinput"))
          setAvailableMicrophones(devices.filter((d) => d.kind === "audioinput"))
        })
      })
      .catch((err) => console.error("Error accessing media devices:", err))
  }, [])

  // Start video call when isVideoCallActive changes
  useEffect(() => {
    if (isVideoCallActive && !callAccepted && otherParticipant) {
      startVideoCall()
    }
  }, [isVideoCallActive, callAccepted, otherParticipant])

  // Update video elements when streams change
  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    if (remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const startVideoCall = async () => {
    if (!selectedChat) return;

    const otherParticipant = selectedChat.participants.find((p) => p._id !== user._id);
    if (!otherParticipant) return;

    try {
      console.log("Requesting camera & mic access...")
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMicrophone ? { deviceId: { exact: selectedMicrophone } } : true,
      })

      console.log("✅ Camera & mic access granted!")
      setStream(userStream)
      if (myVideo.current) {
        myVideo.current.srcObject = userStream
      }

      console.log(`📞 Calling user: ${otherParticipant._id}`)

      // Store outgoing call information
      window.outgoingCall = {
        userId: otherParticipant._id,
        peerId
      }

      // Send call request through socket
      socket.emit("callUser", {
        userToCall: otherParticipant._id,
        from: user._id,
        peerId // Send our peerId so the remote user can call us back
      })

      setIsVideoCallActive(true)
    } catch (error) {
      console.error("❌ Error starting call:", error)
    }
  }

  const answerCall = async () => {
    try {
      console.log("📞 Answering call from:", incomingCallerId)

      const userStream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMicrophone ? { deviceId: { exact: selectedMicrophone } } : true,
      })

      setStream(userStream)
      if (myVideo.current) {
        myVideo.current.srcObject = userStream
      }

      setIsVideoCallActive(true)
      setCallAccepted(true)

      // Notify the caller that we've accepted
      socket.emit("answerCall", {
        to: incomingCallerId,
        peerId // Send our peerId so the caller can establish connection
      })

      // If we have the caller's peerId, establish connection
      if (window.callerPeerId) {
        console.log("Calling peer:", window.callerPeerId)
        const call = peer.call(window.callerPeerId, userStream)
        call.on("stream", (remoteStream) => {
          console.log("✅ Remote stream received", remoteStream)
          setRemoteStream(remoteStream)
          if (userVideo.current) {
            userVideo.current.srcObject = remoteStream
          }
        })
      }
    } catch (error) {
      console.error("❌ Error answering call:", error)
    }
  }

  const endCall = () => {
    // Stop all tracks in both streams
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
    }

    // Notify the other user if we're in a call
    if (callAccepted && incomingCallerId) {
      socket.emit("endCall", { to: incomingCallerId })
    } else if (window.outgoingCall) {
      socket.emit("endCall", { to: window.outgoingCall.userId })
    }

    // Reset state
    setStream(null)
    setRemoteStream(null)
    setIsVideoCallActive(false)
    setCallAccepted(false)
    setIncomingCall(false)
    setIncomingCallerId(null)

    // Clear stored call data
    window.callerPeerId = null
    window.outgoingCall = null
  }

  const toggleMute = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOn(!isVideoOn)
    }
  }

  return (
    <div className="flex flex-col h-full w-full px-4 py-2 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">📞 Call</h2>

      <div className="flex justify-center">
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="p-2 border border-gray-300 rounded-lg">
          <IoSettingsOutline className="text-xl" />
        </button>
      </div>

      {isDropdownOpen && (
        <div className="mt-2 bg-gray-100 p-3 rounded-lg shadow-md">
          <select
            onChange={(e) => setSelectedCamera(e.target.value)}
            value={selectedCamera}
            className="w-full p-2 border rounded-md mb-2"
          >
            <option value="">Default Camera</option>
            {availableCameras.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.substring(0, 5)}...`}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => setSelectedMicrophone(e.target.value)}
            value={selectedMicrophone}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Default Microphone</option>
            {availableMicrophones.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Mic ${device.deviceId.substring(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>
      )}

      {incomingCall && !callAccepted && (
        <div className="text-center my-4 p-4 bg-blue-100 rounded-lg">
          <p className="mb-2">📞 Incoming Call...</p>
          <div className="flex justify-center space-x-2">
            <button onClick={answerCall} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Answer
            </button>
            <button onClick={endCall} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
              Decline
            </button>
          </div>
        </div>
      )}

      {isVideoCallActive ? (
        <>
          <div className="flex-1 flex items-center justify-center bg-gray-300 rounded-lg overflow-hidden">
            {remoteStream ? (
              <video ref={userVideo} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-pulse w-16 h-16 bg-gray-400 rounded-full mb-2"></div>
                <p>Connecting to remote user...</p>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center bg-gray-200 rounded-lg overflow-hidden mt-4 p-4">
            {stream ? (
              <video ref={myVideo} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <p>Your preview will appear here</p>
            )}

            <div className="mt-8 flex justify-center space-x-4">
              <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? "bg-red-200" : "bg-gray-200"}`}>
                {isMuted ? (
                  <FaMicrophoneAltSlash className="text-red-600" />
                ) : (
                  <FaMicrophoneAlt className="text-gray-600" />
                )}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-full ${!isVideoOn ? "bg-red-200" : "bg-gray-200"}`}>
                {!isVideoOn ? <LuCameraOff className="text-red-600" /> : <LuCamera className="text-gray-600" />}
              </button>
              <button onClick={endCall} className="p-3 rounded-full bg-red-500 hover:bg-red-600">
                <MdOutlineCallEnd className="text-white" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-gray-500">
            {otherParticipant
              ? "Start a video call by clicking the video icon in the chat header"
              : "Select a chat to start a video call"}
          </p>
        </div>
      )}
    </div>
  )
}

export default Callbar
