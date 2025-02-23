import User from "../db/User.js";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateToken } from "../config/jwt.js";

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional(),
  gender: z.enum(["male", "female"]).optional(),
});

const loginSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6)
});

const avatarBaseUrl = "https://avatar.iran.liara.run/public";

export const signupController = async (req, res) => {
  try {
    const { username, email, password, gender = "male", role = "user"} = signupSchema.parse(req.body);

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const avatarUrl = `${avatarBaseUrl}/${gender === "male" ? "boy" : "girl"}?username=${username}`;

    const user = await User.create({ 
      username, 
      email, 
      password: hashedPassword, 
      avatar: avatarUrl,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message || error.errors });
  }
};

export const loginController = async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

