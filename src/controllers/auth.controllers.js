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
    
    console.log("Existing User: ", existingUser);

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
    console.log("New User created: ", newUser);

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


 export const userLoginController = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!!"
        });
    }

    const user = await User.findOne({email}).select("+password");
    console.log("User found: ", user);
    if(!user){
        return res.status(401).json({
            success: false,
            message: "User does not exist!!"
        });
    }

    const isValidPassword = await user.comparePassword(password);
    if(!isValidPassword){
        return res.status(401).json({
            success: false,
            message: "Invalid Password!!"
        });
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn:"4d"});
    console.log("Generated Token: ", token);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 4 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({
        success: true,
        message: "User logged in successfully!!",
        token,
        user:{
            _id: user._id,
            email: user.email,
            name: user.name
        }
    });

}