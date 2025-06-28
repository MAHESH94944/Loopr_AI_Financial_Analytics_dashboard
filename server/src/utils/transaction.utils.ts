import {
  TransactionCategory,
  TransactionStatus,
} from "../models/transaction.model";

export function isValidCategory(category: any): boolean {
  return Object.values(TransactionCategory).includes(category);
}

export function isValidStatus(status: any): boolean {
  return Object.values(TransactionStatus).includes(status);
}
