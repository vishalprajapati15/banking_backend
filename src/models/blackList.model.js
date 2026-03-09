import mongoose from "mongoose";

const tokenBlackListSchema = new mongoose.Schema({
    token:{
        type: String,
        required: [true, "Token is required to blacklist!!"],
        unique: true,
    },
},{
    timestamps: true
});

tokenBlackListSchema.index(
    {createdAt: 1}, 
    {expireAfterSeconds: 60 * 60 * 24 * 4}
); //expire documents after 24 hours (assuming token validity is 4 days)

const TokenBlackList = mongoose.models.TokenBlackList || mongoose.model("TokenBlackList", tokenBlackListSchema);

export default TokenBlackList;