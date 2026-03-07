import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const userRegisterController = async (req, res) => {
    const { email, name, password } = req.body;;
    if (!email || !name || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!!"
        });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists with this email!!"
        });
    }

    const newUser = await User.create({
        email,
        name,
        password
    });

    const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET, {expiresIn:"4d"});

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 4 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully!!",
        token,
        user:{
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name
        }
    });
}