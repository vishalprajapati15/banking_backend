import mongoose from "mongoose";
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

const Account = mongoose.models.Account || mongoose.model("Account", accountSchema);

export default Account;