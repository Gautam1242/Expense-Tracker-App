import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactionsByUserId,
  transactionSummary,
} from "../controller/transactionController.js";

const router = express.Router();

router.get("/transactions/:userId", getTransactionsByUserId);

router.delete("/delete/:id", deleteTransaction);

router.post("/transaction", createTransaction);

router.get("/transactions/summary/:userId", transactionSummary);

export default router;
