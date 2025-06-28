import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

export const connectDB = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI not set in environment variables");
  }

  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Connect with retry logic
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};
