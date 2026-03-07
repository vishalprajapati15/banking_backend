import app from "./src/app.js";
import "dotenv/config";
import connectToDB from "./src/config/db.js";

connectToDB();
const port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`Server is running on ${port}`);
})