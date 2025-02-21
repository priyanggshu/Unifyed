import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
},
  chatId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Chat" 
},
  content: { 
    type: String, 
    required: true 
},
  isEncrypted: { 
    type: Boolean, 
    default: false 
}
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
