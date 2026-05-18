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

app.get("/", (req, res) => {
  res.send("API running...");
});

app.get(["/api-docs", "/api-docs/"], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>AI Recipe Platform API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>

        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: "/api-docs.json",
            dom_id: "#swagger-ui"
          });
        </script>
      </body>
    </html>
  `);
});

app.get("/api-docs.json", (req, res) => {
  res.json(swaggerSpec);
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

if (process.env.NODE_ENV !== "production") {
  app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
  });
}

export default app;
