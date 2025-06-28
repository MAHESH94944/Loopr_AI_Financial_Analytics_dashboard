import { Router } from "express";
import {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV,
  getTransactionsSummary,
  getTransactionsTrends,
  getTransactionsCategoryBreakdown,
} from "../controllers/transaction.controller";
import { transactionFilter } from "../middlewares/transactionFilter.middleware";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Protected routes - require authentication
router.use(protect);

// Analytics routes (these must be before the :id route to avoid confusion)
router.get("/summary", getTransactionsSummary);
router.get("/trends", getTransactionsTrends);
router.get("/category-breakdown", getTransactionsCategoryBreakdown);

// CSV export route
router.post("/export-csv", exportTransactionsCSV);

// CRUD routes
router
  .route("/")
  .get(transactionFilter, getTransactions)
  .post(createTransaction);

router
  .route("/:id")
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export = router;
