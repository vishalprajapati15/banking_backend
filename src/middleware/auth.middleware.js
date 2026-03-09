import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access, Please login to access this resource!!"
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedToken.userId);

        req.user = user;

        return next();

    } catch (error) {
        console.log("Error in auth middleware: ", error);
        return res.status(401).json({
            success: false,
            message: "Unauthorized access, Invalid token!!"
        });
    }
}


export const systemUserAuthMiddleware = async (req, res, next) => {
    const token = req.cookies.token || req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access, Please login to access this resource!!"
        });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken.userId).select("+systemUser");

        if (!user.systemUser) {
            return res.status(403).json({
                success: false,
                message: "Forbidden access, You don't have permission to access this resource!!"
            });
        }

        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized access, Invalid token!!"
        });
    }
}