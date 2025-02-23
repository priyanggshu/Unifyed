import express from "express";
import { signupController, loginController } from "../controllers/authcontroller.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);

export default router;
