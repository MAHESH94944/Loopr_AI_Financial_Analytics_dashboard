import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Transaction } from "../models/transaction.model";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;

const transactionsPath = path.resolve(__dirname, "../../../transactions.json");

async function seedTransactions() {
  try {
    if (!MONGO_URI) throw new Error("MONGO_URI not set in .env");

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing transactions
    await Transaction.deleteMany({});
    console.log("Cleared existing transactions");

    // Read sample data
    const data = fs.readFileSync(transactionsPath, "utf-8");
    const transactions = JSON.parse(data);

    // Insert sample data
    await Transaction.insertMany(transactions);
    console.log(`Inserted ${transactions.length} transactions`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedTransactions();
