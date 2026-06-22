import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Recipe Platform API",
      version: "1.0.0",
      description: "API documentation for AI Recipe Platform",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://backend-ai-recipe.vercel.app"
            : "http://localhost:8000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/**/*.js"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
