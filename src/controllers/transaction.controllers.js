import Transaction from "../models/transaction.model.js";
import Account from "../models/account.model.js";
import Ledger from "../models/ledger.model.js";
import { sendTransactionEmail, sendTransactionFailureEmail } from "../services/email.service.js";
import mongoose, { set } from "mongoose";

export const createTransaction = async (req, res) => {
    try {
        const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

        if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "FromAccount, ToAccount, Amount and IdempotencyKey are required!!"
            });
        }
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Amount must be greater than zero!!"
            });
        }

        if (fromAccount === toAccount) {
            return res.status(400).json({
                success: false,
                message: "FromAccount and ToAccount cannot be the same!!"
            });
        }

        const fromUserAccount = await Account.findById(fromAccount);

        if (!fromUserAccount) {
            return res.status(404).json({
                success: false,
                message: "From account not found!!"
            });
        }
        const toUserAccount = await Account.findById(toAccount);

        if (!toUserAccount) {
            return res.status(404).json({
                success: false,
                message: "To account not found!!"
            });
        }

        const isTransactionAlreadyExist = await Transaction.findOne({ idempotencyKey });

        if (isTransactionAlreadyExist) {
            if (isTransactionAlreadyExist.status === "COMPLETED") {
                return res.status(200).json({
                    success: true,
                    message: "Transaction already processed!!",
                    transaction: isTransactionAlreadyExist
                });
            }

            if (isTransactionAlreadyExist.status === "PENDING") {
                return res.status(200).json({
                    success: true,
                    message: "Transaction is still processing!!",
                });
            }

            if (isTransactionAlreadyExist.status === "FAILED") {
                return res.status(500).json({
                    success: false,
                    message: "Transaction processing failed, Please try again!!"
                });
            }

            if (isTransactionAlreadyExist.status === "REVERSED") {
                return res.status(500).json({
                    success: false,
                    message: "Transaction is reversed, Please try again!!"
                });
            }
        }

        if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Both accounts must be active to process transaction!!"
            });
        }

        //Derive sender balance form ledger
        const balance = await fromUserAccount.getBalance();
        console.log("Current balance: ", balance);

        if (balance < amount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance!! Your current balance is ${balance}. Requested amount is ${amount} ${fromUserAccount.currency}`
            });
        }

        let transaction;

        try {
            const session = await mongoose.startSession();
            session.startTransaction();         //ater this point, all operations will be part of this transaction until we commit or abort

            transaction = (await Transaction.create([{
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
            }], { session }))[0];  //when we create with session, it returns an array of created documents, so we take the first element of the array

            const debitLedgerEntry = await Ledger.create([{
                account: fromAccount,
                type: "DEBIT",
                amount,
                transaction: transaction._id
            }], { session });

            await (() => {
                return new Promise((resolev) => setTimeout(resolev, 15 * 1000));
            })();

            const creditLedgerEntry = await Ledger.create([{
                account: toAccount,
                type: "CREDIT",
                amount,
                transaction: transaction._id
            }], { session });

            await transaction.findOneAndUpdate(
                { _id: transaction._id },
                { status: "COMPLETED" },
                { session }
            );

            await session.commitTransaction();  //if we reach this point, it means all operations were successful, so we can commit the transaction
            session.endSession();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Transaction is pending due to some issue, Please try after some time!!"
            });
        }

        await sendTransactionEmail(req.user.email, req.user.name, amount, fromUserAccount.currency, toAccount);

        return res.status(201).json({
            success: true,
            message: "Transaction completed successfully!!",
            transaction
        });

    } catch (error) {
        await session.abortTransaction();  //if an error occurs, we abort the transaction
        return res.status(500).json({
            success: false,
            message: "Internal server error!!"
        });
    }
}


export const createInitialFundsTransaction = async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body;
    console.log("ToAccount: ", toAccount);
    console.log("Amount: ", amount)
    console.log("idempotencyKeyI: ", idempotencyKey)

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            success: false,
            message: "ToAccount, Amount and IdempotencyKey are required!!"
        });
    }

    if (amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Amount must be greater than zero!!"
        });
    }

    try {
        const toUserAccount = await Account.findOne({ _id: toAccount });

        if (!toUserAccount) {
            return res.status(404).json({
                success: false,
                message: "Invalid User account, not found!!"
            });
        }
        console.log("ToUserAccount: ", toUserAccount)
        const fromUserAccount = await Account.findOne({ user: req.user._id });

        if (!fromUserAccount) {
            return res.status(404).json({
                success: false,
                message: "Invalid System account not found !!"
            });
        }
        console.log("FromUserAccount: ", fromUserAccount)
        const session = await mongoose.startSession();
        session.startTransaction();

        console.log("Session: ", session)

        const transaction = new Transaction({
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        });

        console.log("Transaction: ", transaction);
        //when we use session data is through an array of objects.
        const debitLedgerEntry = await Ledger.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session });

        console.log("DebitLedgerEntry: ", debitLedgerEntry);

        const creditLedgerEntry = await Ledger.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session });

        console.log("CreditLedgerEntry: ", creditLedgerEntry);

        transaction.status = "COMPLETED";
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        await sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount.currency, toAccount);

        return res.status(201).json({
            success: true,
            message: "Initial funds added successfully!!",
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error!!"
        });
    }
}