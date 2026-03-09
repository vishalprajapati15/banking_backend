import express from "express";
import { userLoginController, userLogoutController, userRegisterController } from "../controllers/auth.controllers.js";


const authRouter = express.Router();

authRouter.post("/register", userRegisterController);
authRouter.post("/login", userLoginController);
authRouter.post("/logout", userLogoutController);


export default authRouter;