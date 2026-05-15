/**
 * @swagger
 * tags:
 *   name: MealDB
 *   description: MealDB external recipe inspiration endpoints
 */
import express from "express";
import {
  getRecipeOfTheDay,
  getCategories,
  getAreas,
  getMealsByCategory,
  getMealsByArea,
  searchMeals,
  getMealDetail,
} from "../controllers/mealdb.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/mealdb/random:
 *   get:
 *     summary: Get random meal from MealDB
 *     tags: [MealDB]
 *     responses:
 *       200:
 *         description: Random meal fetched successfully
 */
router.get("/random", getRecipeOfTheDay);

/**
 * @swagger
 * /api/mealdb/categories:
 *   get:
 *     summary: Get MealDB categories
 *     tags: [MealDB]
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 */
router.get("/categories", getCategories);

/**
 * @swagger
 * /api/mealdb/areas:
 *   get:
 *     summary: Get MealDB areas or cuisines
 *     tags: [MealDB]
 *     responses:
 *       200:
 *         description: Areas fetched successfully
 */
router.get("/areas", getAreas);

/**
 * @swagger
 * /api/mealdb/category/{category}:
 *   get:
 *     summary: Get meals by category
 *     tags: [MealDB]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         example: Chicken
 *     responses:
 *       200:
 *         description: Meals fetched by category
 */
router.get("/category/:category", getMealsByCategory);

/**
 * @swagger
 * /api/mealdb/area/{area}:
 *   get:
 *     summary: Get meals by area or cuisine
 *     tags: [MealDB]
 *     parameters:
 *       - in: path
 *         name: area
 *         required: true
 *         schema:
 *           type: string
 *         example: Japanese
 *     responses:
 *       200:
 *         description: Meals fetched by area
 */
router.get("/area/:area", getMealsByArea);

/**
 * @swagger
 * /api/mealdb/search:
 *   get:
 *     summary: Search meals by name
 *     tags: [MealDB]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: chicken
 *     responses:
 *       200:
 *         description: Meals searched successfully
 *       400:
 *         description: Query is required
 */
router.get("/search", searchMeals);

/**
 * @swagger
 * /api/mealdb/detail/{id}:
 *   get:
 *     summary: Get meal detail by MealDB ID
 *     tags: [MealDB]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 52772
 *     responses:
 *       200:
 *         description: Meal detail fetched successfully
 *       404:
 *         description: Meal not found
 */
router.get("/detail/:id", getMealDetail);

export default router;
