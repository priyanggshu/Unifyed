import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authMiddleware from "./middleware/authMiddleware.js";
import setupSocketServer from "./ws/socket.js";

// setting up environment variables
dotenv.config();

// express-app initialization
const app = express();
const server = http.createServer(app);
setupSocketServer(server);

// middleware
app.use(cors());
app.use(express.json());

// db connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.error(`DB connection error: ${err.message}`));

// api routes
app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);

// error-handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));