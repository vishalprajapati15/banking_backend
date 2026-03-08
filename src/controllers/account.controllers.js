import Account from "../models/account.model.js";


export const createAccountController = async(req, res) => {
    const user = req.user;
    try {
        
        const newAccount = await Account.create({
            user: user._id,
        });

        console.log("New account created: ", newAccount);
        return res.status(201).json({
            success: true,
            message: "Account created successfully!!",
            account: newAccount
        })
    } catch (error) {
        console.log("Error in create account controller: ", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while creating account!!"
        });
    }
}