import express from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import {errorHandler} from "./middleware/errorHandler";
import {logger} from "./utils/logger";
import {connectDB} from "./lib/prisma";
import {authRoutes} from "./modules/auth/routes";
import {roleRoutes} from "./modules/roles/routes";
import {profileRoutes} from "./modules/profile/routes";
import {userRoutes} from "./modules/user/routes";
import "./config/passport";

// Load environment variables
require("dotenv").config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);
// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: process.env.APP_NAME || "Admin API",
      version: process.env.APP_VERSION || "1.0.0",
      description: process.env.APP_DESCRIPTION || "Admin API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token in the format: Bearer <token>",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            email: {
              type: "string",
              format: "email",
            },
            firstName: {
              type: "string",
            },
            lastName: {
              type: "string",
            },
            role: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  format: "uuid",
                },
                name: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/modules/**/routes/*.ts"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
const apiPrefix = process.env.API_PREFIX || "/api";
const apiVersion = process.env.API_VERSION || "v1";
const basePath = `${apiPrefix}/${apiVersion}`;

app.use(`${basePath}/auth`, authRoutes);
app.use(`${basePath}/roles`, roleRoutes);
app.use(`${basePath}/profile`, profileRoutes);
app.use(`${basePath}/user`, userRoutes);
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `API Documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
