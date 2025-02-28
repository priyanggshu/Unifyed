const Message = ({ message, currentUser }) => {
  const isSender = message.sender._id === currentUser._id;

  return (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-3`}>
      {/* Display Avatar for received messages */}
      {!isSender && message.sender?.avatar && (
        <img
          src={message.sender.avatar}
          alt="Sender Avatar"
          className="w-10 h-10 rounded-full object-cover border border-gray-300 mr-2"
        />
      )}

      {/* Message Bubble */}
      <div
        className={`relative px-4 pb-6 max-w-[75%] text-sm shadow-md rounded-2xl ${
          isSender
            ? "bg-[#a4e9dd] rounded-br-xl"
            : "bg-gray-200 text-gray-900 rounded-bl-xl"
        }`}
      >
        {/* Show sender name for group chats */}
        <p className="text-sm font-semibold italic mr-10 my-1">
          {!isSender ? message.sender.username : "You"}
        </p>

        {/* Message Content */}
        <p className="text-gray-800 hover:text-lg hover:font-semibold hover:scale-105 transition-all">
          {message.content}
        </p>

        {/* Timestamp */}
        <span className="absolute bottom-1 right-2 text-[10px] font-semibold text-gray-600">
          {message.timestamp && !isNaN(new Date(message.timestamp).getTime())
            ? new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "⏳"}
        </span>
      </div>
    </div>
  );
};

export default Message;
