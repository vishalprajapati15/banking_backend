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

export const getUserAccountsController = async(req, res) => {
    const accounts = await Account.find({user: req.user._id});

    if(accounts.length === 0){
        return res.status(404).json({
            success: false,
            message: "No accounts found for the user!!"
        });
    }

    return res.status(200).json({
        success: true,
        message: "User accounts retrieved successfully!!",
        accounts
    });

}

export const getAccountsBalanceController = async(req, res) => {
    const {accountId} = req.params;

    console.log("AccountId: ", accountId);

    try {
        const account = await Account.findOne({_id: accountId, user: req.user._id});
        
        if(!account){
            return res.status(404).json({
                success: false,
                message: "Account not found!!"
            });
        }

        console.log("Account found: ", account);

        const balance = await account.getBalance();

        console.log("Balance: ", balance);

        return res.status(200).json({
            success: true,
            message: "Account balance retrieved successfully!!",
            balance
        });

    } catch (error) {
        console.log("Error in get accounts balance controller: ", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching account balance!!"
        });
    }

    
}