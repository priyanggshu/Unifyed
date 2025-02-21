import User from "../db/User.js";
import Message from "../db/Message.js";

// fetches all users (excluding their password field)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.log((`getAllUsers error: ${error}`));
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(`deleteUser error: ${error}`);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getChatStats = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    
    const activeUsers = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });
    res.status(200).json({ totalMessages, activeUsers });
  } catch (error) {
    console.log(`getChatStats error: ${error}`);
    res.status(500).json({ message: "Failed to fetch chat stats" });
  }
};