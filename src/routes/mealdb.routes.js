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

router.get("/random", getRecipeOfTheDay);
router.get("/categories", getCategories);
router.get("/areas", getAreas);
router.get("/category/:category", getMealsByCategory);
router.get("/area/:area", getMealsByArea);
router.get("/search", searchMeals);
router.get("/detail/:id", getMealDetail);

export default router;
