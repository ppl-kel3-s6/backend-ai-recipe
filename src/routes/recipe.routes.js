import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  generateRecipe,
  getRecipeSuggestionsFromPantry,
} from "../controllers/recipe.controller.js";

const router = express.Router();

router.post("/generate", verifyUser, generateRecipe);
router.get("/suggestions", verifyUser, getRecipeSuggestionsFromPantry);

export default router;
