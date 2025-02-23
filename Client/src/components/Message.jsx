const Message = ({ message, currentUser }) => {
    const isSender = message.sender === currentUser._id;
  
    return (
      <div className={`flex ${isSender ? "justify-end" : "justify-start"} mb-2`}>
        <div className={`p-3 rounded-lg ${isSender ? "bg-blue-500 text-white" : "bg-gray-300"}`}>
          {message.content}
        </div>
      </div>
    );
  };
  
  export default Message;
  