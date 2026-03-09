import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createAccountController, getAccountsBalanceController, getUserAccountsController } from "../controllers/account.controllers.js";
const accountRouter = express.Router();

accountRouter.post("/", authMiddleware, createAccountController);
accountRouter.get("/", authMiddleware, getUserAccountsController);
accountRouter.get("/balance/:accountId", authMiddleware, getAccountsBalanceController);


export default accountRouter;