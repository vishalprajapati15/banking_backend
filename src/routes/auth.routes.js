import express from "express";
import { userRegisterController } from "../controllers/auth.controllers.js";
const authRouter = express.Router();

authRouter.post("/register", userRegisterController);


export default authRouter;