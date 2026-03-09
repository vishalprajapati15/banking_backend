import mongoose from "mongoose"; 

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Transaction must be associated with a sender account!!"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Transaction must be associated with a recipient account!!"],
        index: true
    },
    status:{
        type: String,
        enum:{
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "Status must be either PENDING, COMPLETED or FAILED or REVERSED!!"
        },
        default: "PENDING"
    },
    amount:{
        type: Number,
        required: [true, "Amount is required for a transaction!!"],
        min: [0, "Amount must be a positive number!!"]
    },
    idempotencyKey:{
        type: String,
        required: [true, "Idempotency key is required for a transaction!!"],
        unique: true,
        index: true
    }
},{
    timestamps: true
});

const Transaction = mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default Transaction;