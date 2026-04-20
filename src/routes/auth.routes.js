import express from "express";
import {
  register,
  login,
  forgotPassword,
  updatePassword,
} from "../controllers/auth.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/update-password", verifyUser, updatePassword);

export default router;
