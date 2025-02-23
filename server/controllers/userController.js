import User from "../db/User.js";
import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {
  try {
    if (!req.user._id || !mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    console.log("Authenticated user:", req.user); // Debugging log
    const users = await User.find().select("-password");
    console.log("Users fetched successfully. Count:", users.length);
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};
