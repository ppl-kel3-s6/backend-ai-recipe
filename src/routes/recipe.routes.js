import express from "express";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { generateRecipe } from "../controllers/recipe.controller.js";

const router = express.Router();

router.post("/generate", verifyUser, generateRecipe);

export default router;
