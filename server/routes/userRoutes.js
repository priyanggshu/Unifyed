
import express from "express";
import { getUserProfile, getAllUsers } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.get("/", authMiddleware, adminMiddleware, getAllUsers);

export default router;
