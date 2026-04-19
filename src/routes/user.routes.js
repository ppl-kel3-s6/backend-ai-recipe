import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", verifyUser, (req, res) => {
  res.json({
    user_id: req.user.id,
    email: req.user.email,
  });
});

export default router;
