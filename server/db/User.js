import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    role: { 
        type: String, 
        enum: ["user", "admin"], 
        default: "user" 
    },
    lastActive: {
      type: Date,
      default: Date.now
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;