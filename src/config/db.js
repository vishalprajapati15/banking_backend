import mongoose from "mongoose";
import "dotenv/config";

function connectToDB(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("DataBase Connected!!");
    }).catch((err)=>{
        console.log("Error connecting to database", err);
        process.exit(1);
    });
}

export default connectToDB;