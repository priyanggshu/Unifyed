import express from "express";
import { getMessagesForChat, sendMessage } from "../controllers/messageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:chatId", authMiddleware, getMessagesForChat);
router.post("/:chatId", authMiddleware, sendMessage);

export default router;