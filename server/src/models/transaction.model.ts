import mongoose, { Document, Schema } from "mongoose";

export enum TransactionCategory {
  Revenue = "Revenue",
  Expense = "Expense",
}

export enum TransactionStatus {
  Paid = "Paid",
  Pending = "Pending",
}

export interface ITransaction extends Document {
  date: Date;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  user_id: string;
  user_profile: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: Object.values(TransactionCategory),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
    },
    user_id: { type: String, required: true },
    user_profile: { type: String, required: true },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
