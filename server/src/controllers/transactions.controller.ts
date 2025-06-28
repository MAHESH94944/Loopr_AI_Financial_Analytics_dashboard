import { Request, Response } from "express";
import { Transaction } from "../models/transaction.model";

export const getTransactions = async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "date",
    sortOrder = "desc",
    category,
    status,
    dateFrom,
    dateTo,
    search,
  } = req.query;

  const query: any = {};

  if (category) query.category = category;
  if (status) query.status = status;
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom as string);
    if (dateTo) query.date.$lte = new Date(dateTo as string);
  }
  if (search) {
    const regex = new RegExp(search as string, "i");
    query.$or = [
      { user_id: regex },
      { category: regex },
      { status: regex },
      { amount: { $regex: regex } },
      { date: { $regex: regex } },
      // add more fields as needed
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort: any = { [sortBy as string]: sortOrder === "asc" ? 1 : -1 };

  const [transactions, total] = await Promise.all([
    Transaction.find(query).sort(sort).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(query),
  ]);

  res.json({ transactions, total });
};
