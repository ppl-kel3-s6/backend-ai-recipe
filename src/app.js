import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pantryRoutes from "./routes/pantry.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";
import mealdbRoutes from "./routes/mealdb.routes.js";
import savedRecipeRoutes from "./routes/savedRecipe.routes.js";
import { swaggerSpec } from "./config/swagger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/mealdb", mealdbRoutes);
app.use("/api/saved-recipes", savedRecipeRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API running...");
});

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large",
      message: "Maximum image size is 10MB",
    });
  }

  res.status(500).json({
    error: "Internal server error",
    detail: err.message,
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
