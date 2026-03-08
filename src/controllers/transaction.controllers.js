import Transaction from "../models/Transaction.js";
import Account from "../models/account.model.js";
import Ledger from "../models/ledger.model.js";
import { sendTransactionEmail, sendTransactionFailureEmail } from "../services/email.service.js";
import mongoose from "mongoose";

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

        //Drive sender balance form ledger
        const balance = await fromUserAccount.getBalance();
        console.log("Current balance: ", balance);

        if (balance < amount) {
            return res.status(400).json({
                success: false,
                message: `Insufficient balance!! Your current balance is ${balance}. Requested amount is ${amount} ${fromUserAccount.currency}`
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();         //ater this point, all operations will be part of this transaction until we commit or abort

        const transaction = await Transaction.create({
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }, { session });

        const debitLedgerEntry = await Ledger.create({
            account: fromAccount,
            type: "DEBIT",
            amount,
            transaction: transaction._id
        }, { session });

        const creditLedgerEntry = await Ledger.create({
            account: toAccount,
            type: "CREDIT",
            amount,
            transaction: transaction._id
        }, { session });

        transaction.status = "COMPLETED";
        await transaction.save({ session });
        
        await session.commitTransaction();  //if we reach this point, it means all operations were successful, so we can commit the transaction
        session.endSession();

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