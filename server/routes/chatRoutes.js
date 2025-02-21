import express from "express";
import { getAllChats, createChat } from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllChats);
router.post("/", authMiddleware, createChat);

export default router;
