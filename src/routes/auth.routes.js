/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */
import express from "express";
import {
  register,
  login,
  forgotPassword,
  updatePassword,
} from "../controllers/auth.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: Fauzan
 *               email:
 *                 type: string
 *                 example: user@email.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Register success
 */
router.post("/register", register);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: fauzanashshidiq29@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login success
 *       400:
 *         description: Login failed
 */
router.post("/login", login);
/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request forgot password email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@email.com
 *     responses:
 *       200:
 *         description: Reset password email sent
 *       400:
 *         description: Failed to send reset password email
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/update-password:
 *   post:
 *     summary: Update user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Failed to update password
 *       401:
 *         description: Unauthorized
 */
router.post("/update-password", verifyUser, updatePassword);

export default router;
