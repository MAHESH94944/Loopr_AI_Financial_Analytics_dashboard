import { Request, Response, NextFunction } from "express";

export const transactionFilter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    category,
    status,
    search,
    sortBy = "date",
    sortOrder = "desc",
    page = "1",
    limit = "10",
  } = req.query;

  const filter: any = {};

  // Date range
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
    if (dateTo) filter.date.$lte = new Date(dateTo as string);
  }

  // Amount range
  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = Number(minAmount);
    if (maxAmount) filter.amount.$lte = Number(maxAmount);
  }

  // Exact match fields
  if (category) filter.category = category;
  if (status) filter.status = status;

  // Text search across multiple fields
  if (search) {
    const searchRegex = new RegExp(search as string, "i");
    filter.$or = [
      { user_id: searchRegex },
      { user_profile: searchRegex },
      // Add more fields as needed
    ];
  }

  // Sorting
  const sort: any = {};
  sort[String(sortBy)] = sortOrder === "asc" ? 1 : -1;

  // Pagination
  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  // Attach to request
  (req as any).transactionFilter = filter;
  (req as any).transactionSort = sort;
  (req as any).transactionPagination = { skip, limit: limitNum };

  next();
};
