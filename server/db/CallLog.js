import mongoose from "mongoose";

const callLogSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  callType: { type: String, enum: ["video", "audio"], required: true },
  duration: { type: Number, default: 0 }, // Call duration in seconds
  status: { type: String, enum: ["missed", "completed"], required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("CallLog", callLogSchema);
