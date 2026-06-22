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
import { supabase } from "../config/supabase.js";

router.get("/me", verifyUser, async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id)
      .single();

    res.json({
      user_id: req.user.id,
      email: req.user.email,
      fullname: profile?.fullname || req.user.user_metadata?.full_name || req.user.user_metadata?.name || "User",
      image_url: profile?.image_url || req.user.user_metadata?.avatar_url || req.user.user_metadata?.picture || null,
    });
  } catch (error) {
    res.json({
      user_id: req.user.id,
      email: req.user.email,
      fullname: req.user.user_metadata?.full_name || req.user.user_metadata?.name || "User",
    });
  }
});

export default router;
