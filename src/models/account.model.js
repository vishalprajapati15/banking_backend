import mongoose from "mongoose";
import Ledger from "./ledger.model.js";



const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Account must be associated with a user!!"],
        index: true
    },
    status:{
        enum:{
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Status must be either ACTIVE, FROZEN or CLOSED!!"
        },
        type: String,
        default: "ACTIVE"
    },
    currency:{
        type: String,
        required: [true, "Currency is required!!"],
        default: "INR"
    },
},{
    timestamps: true
});

accountSchema.index({user: 1, status: 1});  //compound index for user and status to optimize queries that filter by user and status

accountSchema.methods.getBalance = async function() {
    const balanceData = await Ledger.aggregate([
        {$match: {account: this._id}},
        {
            $group:{
                _id: null,
                totalDebit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type", "DEBIT"]},
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:[
                            {$eq:["$type", "CREDIT"]},
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project:{
                _id: 0,
                balance: {$subtract:["$totalCredit", "$totalDebit"]}
            }
        }
    ]);

    if(balanceData.length === 0){
        return 0;
    }
    return balanceData[0].balance;
}

const Account = mongoose.models.Account || mongoose.model("Account", accountSchema);

export default Account;