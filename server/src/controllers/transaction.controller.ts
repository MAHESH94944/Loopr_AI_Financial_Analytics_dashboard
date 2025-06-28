import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import {
  Transaction,
  ITransaction,
  TransactionCategory,
  TransactionStatus,
} from "../models/transaction.model";
import mongoose from "mongoose";
import { stringify } from "csv-stringify";

// If you extract validation/filtering helpers, import from utils here
// import { validateTransactionInput } from "../utils/transaction.utils";

// GET /api/transactions?start=YYYY-MM-DD&end=YYYY-MM-DD&category=Revenue&status=Paid
export const getTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    // Use filter from middleware if present, else fallback to query parsing
    const filter = (req as any).transactionFilter || {};
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  }
);

// POST /api/transactions
export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const { date, amount, category, status, user_id, user_profile } = req.body;

    // Basic validation
    if (
      !date ||
      typeof amount !== "number" ||
      !Object.values(TransactionCategory).includes(category) ||
      !Object.values(TransactionStatus).includes(status) ||
      !user_id ||
      !user_profile
    ) {
      res.status(400);
      throw new Error("Invalid transaction data");
    }

    const transaction = await Transaction.create({
      date,
      amount,
      category,
      status,
      user_id,
      user_profile,
    });

    res.status(201).json(transaction);
  }
);

// GET /api/transactions/:id
export const getTransactionById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid transaction ID");
    }
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      res.status(404);
      throw new Error("Transaction not found");
    }
    res.json(transaction);
  }
);

// PATCH /api/transactions/:id
export const updateTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid transaction ID");
    }

    const updateFields: Partial<ITransaction> = {};
    const allowedFields = [
      "date",
      "amount",
      "category",
      "status",
      "user_id",
      "user_profile",
    ];
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateFields[key as keyof ITransaction] = req.body[key];
      }
    }

    if (
      updateFields.category &&
      !Object.values(TransactionCategory).includes(
        updateFields.category as TransactionCategory
      )
    ) {
      res.status(400);
      throw new Error("Invalid category");
    }
    if (
      updateFields.status &&
      !Object.values(TransactionStatus).includes(
        updateFields.status as TransactionStatus
      )
    ) {
      res.status(400);
      throw new Error("Invalid status");
    }

    const transaction = await Transaction.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!transaction) {
      res.status(404);
      throw new Error("Transaction not found");
    }
    res.json(transaction);
  }
);

// DELETE /api/transactions/:id
export const deleteTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      throw new Error("Invalid transaction ID");
    }
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      res.status(404);
      throw new Error("Transaction not found");
    }
    res.json({ message: "Transaction deleted" });
  }
);

// POST /api/transactions/export
export const exportTransactionsCSV = async (req: Request, res: Response) => {
  try {
    const {
      columns = [
        "date",
        "amount",
        "category",
        "status",
        "user_id",
        "user_profile",
      ],
    } = req.body;

    // Fetch transactions
    const transactions = await Transaction.find({}).lean();

    // Transform data: format date as MM/DD/YYYY
    const transformedData = transactions.map((tx) => {
      const row: any = {};
      const txAny = tx as any; // <-- Add this line
      for (const col of columns) {
        if (col === "date" && txAny.date) {
          row.date = new Date(txAny.date).toLocaleDateString("en-US");
        } else {
          row[col] = txAny[col] ?? "";
        }
      }
      return row;
    });

    // Set CSV headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=transactions_export.csv"
    );

    // Create CSV with headers
    stringify(transformedData, {
      header: true,
      columns: columns as string[],
    }).pipe(res);
  } catch (err: any) {
    res.status(500).json({ message: "Export failed", error: err.message });
  }
};

interface TransactionSummary {
  totalRevenue: number;
  totalExpense: number;
  net: number;
}

interface MonthlyTrend {
  month: string;
  Revenue: number;
  Expense: number;
}

interface CategoryBreakdown {
  category: string;
  value: number;
}

// GET /api/transactions/summary
export const getTransactionsSummary = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const transactions = await Transaction.find({});

      const summary: TransactionSummary = transactions.reduce(
        (acc, curr) => {
          if (curr.category === TransactionCategory.Revenue) {
            acc.totalRevenue += curr.amount;
          } else if (curr.category === TransactionCategory.Expense) {
            acc.totalExpense += curr.amount;
          }
          return acc;
        },
        { totalRevenue: 0, totalExpense: 0, net: 0 }
      );

      summary.net = summary.totalRevenue - summary.totalExpense;
      res.json(summary);
    } catch (error) {
      console.error("Error in getTransactionsSummary:", error);
      res.status(500).json({ message: "Failed to get transactions summary" });
    }
  }
);

// GET /api/transactions/trends
export const getTransactionsTrends = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const transactions = await Transaction.find({}).sort({ date: 1 });

      const monthlyTrends: Record<string, MonthlyTrend> = transactions.reduce(
        (acc, curr) => {
          const date = new Date(curr.date);
          const monthYear = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });

          if (!acc[monthYear]) {
            acc[monthYear] = { month: monthYear, Revenue: 0, Expense: 0 };
          }

          if (curr.category === TransactionCategory.Revenue) {
            acc[monthYear].Revenue += curr.amount;
          } else if (curr.category === TransactionCategory.Expense) {
            acc[monthYear].Expense += curr.amount;
          }

          return acc;
        },
        {} as Record<string, MonthlyTrend>
      );

      const trends = Object.values(monthlyTrends);
      res.json(trends);
    } catch (error) {
      console.error("Error in getTransactionsTrends:", error);
      res.status(500).json({ message: "Failed to get transaction trends" });
    }
  }
);

// GET /api/transactions/category-breakdown
export const getTransactionsCategoryBreakdown = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const transactions = await Transaction.find({});

      const breakdown: Record<string, number> = transactions.reduce(
        (acc, curr) => {
          if (!acc[curr.category]) {
            acc[curr.category] = 0;
          }
          acc[curr.category] += Math.abs(curr.amount);
          return acc;
        },
        {} as Record<string, number>
      );

      const categoryData: CategoryBreakdown[] = Object.entries(breakdown).map(
        ([category, value]) => ({
          category,
          value,
        })
      );

      res.json(categoryData);
    } catch (error) {
      console.error("Error in getTransactionsCategoryBreakdown:", error);
      res.status(500).json({ message: "Failed to get category breakdown" });
    }
  }
);
