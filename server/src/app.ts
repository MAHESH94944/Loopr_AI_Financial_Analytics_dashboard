import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes = require("./routes/auth.routes");
import transactionRoutes = require("./routes/transaction.routes");
import { notFound, errorHandler } from "./middlewares/error.middleware";

// Load .env variables
dotenv.config();

const app: Application = express();

// Security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Request logging
app.use(morgan("dev"));

// JSON body parsing
app.use(express.json());

// Cookie parsing
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.send("API is running");
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;
