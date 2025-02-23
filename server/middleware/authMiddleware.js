import jwt from "jsonwebtoken";
import User from "../db/User.js";

const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      console.log("🔑 Token received in backend:", req.headers.authorization);
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(403).json({ message: "User not found" });
      }

      console.log("Authenticated user:", req.user); // Debugging log
      console.log("calling next()");
      return next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(403).json({ message: "Access denied" });
    }
  }
  return res.status(401).json({ message: "Not authorized, no token" });
};

export default authMiddleware;
