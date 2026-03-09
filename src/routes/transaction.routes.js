import express from "express";
import { authMiddleware, systemUserAuthMiddleware } from "../middleware/auth.middleware.js";
import { createInitialFundsTransaction, createTransaction } from "../controllers/transaction.controllers.js";


const transactionRouter = express.Router();


transactionRouter.post("/", authMiddleware, createTransaction);
transactionRouter.post("/system/initial-funds", systemUserAuthMiddleware, createInitialFundsTransaction);




export default transactionRouter;
