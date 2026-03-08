import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { createAccountController } from "../controllers/account.controllers.js";

const accountRouter = express.Router();

accountRouter.post("/", authMiddleware, createAccountController);


export default accountRouter;