const CallControls = ({ toggleMute, isMuted, toggleVideo, isVideoOn, endCall }) => {
    return (
      <div className="mt-4 flex justify-center space-x-4">
        <button onClick={toggleMute} className="bg-yellow-500 text-white px-4 py-2 rounded-md">
          {isMuted ? "Unmute Mic" : "Mute Mic"}
        </button>
        <button onClick={toggleVideo} className="bg-red-500 text-white px-4 py-2 rounded-md">
          {isVideoOn ? "Turn Off Video" : "Turn On Video"}
        </button>
        <button onClick={endCall} className="bg-gray-600 text-white px-4 py-2 rounded-md">
          End Call
        </button>
      </div>
    );
  };
  
  export default CallControls;
  