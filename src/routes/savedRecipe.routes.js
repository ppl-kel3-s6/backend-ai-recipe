/**
 * @swagger
 * tags:
 *   name: Saved Recipes
 *   description: Save and manage favorite recipes
 */
import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  saveRecipe,
  getSavedRecipes,
  unsaveRecipe,
  saveMealdbRecipe,
  unsaveMealdbRecipe,
} from "../controllers/savedRecipe.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/saved-recipes:
 *   post:
 *     summary: Save recipe to collection
 *     tags: [Saved Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipe_id
 *             properties:
 *               recipe_id:
 *                 type: string
 *                 example: 766315a3-30e8-4d9e-a826-955192f9b2c4
 *     responses:
 *       200:
 *         description: Recipe saved successfully
 *       409:
 *         description: Recipe already saved
 */
router.post("/", verifyUser, saveRecipe);

/**
 * @swagger
 * /api/saved-recipes:
 *   get:
 *     summary: Get saved recipes
 *     tags: [Saved Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved recipes fetched successfully
 */
router.get("/", verifyUser, getSavedRecipes);

/**
 * @swagger
 * /api/saved-recipes/{recipeId}:
 *   delete:
 *     summary: Remove recipe from saved collection
 *     tags: [Saved Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recipeId
 *         required: true
 *         schema:
 *           type: string
 *         example: 766315a3-30e8-4d9e-a826-955192f9b2c4
 *     responses:
 *       200:
 *         description: Recipe unsaved successfully
 *       404:
 *         description: Saved recipe not found
 */
router.delete("/:recipeId", verifyUser, unsaveRecipe);

// Custom routes for saving external/AI recipes directly from DetailResep.jsx
router.post("/mealdb", verifyUser, saveMealdbRecipe);
router.delete("/mealdb/:title", verifyUser, unsaveMealdbRecipe);

export default router;
