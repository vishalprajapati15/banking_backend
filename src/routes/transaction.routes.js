import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createTransaction } from "../controllers/transaction.controllers.js";


const transactionRouter = express.Router();


transactionRouter.post("/", authMiddleware, createTransaction);




export default transactionRouter;
