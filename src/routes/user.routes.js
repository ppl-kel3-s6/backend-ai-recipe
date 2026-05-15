import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile endpoints
 */

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", verifyUser, (req, res) => {
  res.json({
    user_id: req.user.id,
    email: req.user.email,
  });
});

export default router;
