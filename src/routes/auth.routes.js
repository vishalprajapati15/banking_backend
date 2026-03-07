import express from "express";
import { userLoginController, userRegisterController } from "../controllers/auth.controllers.js";
const authRouter = express.Router();

authRouter.post("/register", userRegisterController);
authRouter.post("/login", userLoginController);


export default authRouter;