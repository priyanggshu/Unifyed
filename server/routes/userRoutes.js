import express from "express";
import { getUserProfile, getAllUsers } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.get("/", authMiddleware, getAllUsers);

export default router;