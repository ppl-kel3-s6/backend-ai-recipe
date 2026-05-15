import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import {
  saveRecipe,
  getSavedRecipes,
  unsaveRecipe,
} from "../controllers/savedRecipe.controller.js";

const router = express.Router();

router.post("/", verifyUser, saveRecipe);
router.get("/", verifyUser, getSavedRecipes);
router.delete("/:recipeId", verifyUser, unsaveRecipe);

export default router;
