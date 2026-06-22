import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  generateRecipe,
  getRecipeSuggestionsFromPantry,
  checkRecipeExists
} from "../controllers/recipe.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/recipes/generate:
 *   post:
 *     summary: Generate recipe detail from selected food
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tomato Omelette
 *               category:
 *                 type: string
 *                 example: Breakfast
 *               cuisine:
 *                 type: string
 *                 example: American
 *     responses:
 *       200:
 *         description: Recipe generated successfully
 */
router.post("/generate", verifyUser, generateRecipe);
/**
 * @swagger
 * /api/recipes/suggestions:
 *   get:
 *     summary: Generate AI recipe suggestions from pantry
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recipe suggestions generated
 */
router.get("/suggestions", verifyUser, getRecipeSuggestionsFromPantry);
router.get("/check", verifyUser, checkRecipeExists);

export default router;
