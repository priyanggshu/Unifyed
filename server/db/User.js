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
    avatar: {
      type: String,
      default: function () {
        return `https://avatar.iran.liara.run/public/boy?username=${this.username}`;
      },
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