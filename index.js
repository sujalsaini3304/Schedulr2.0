import express from "express"
import dotenv from "dotenv"
import router from "./router.js";


dotenv.config({
    path:".env",
})


const app = express();

app.use(express.urlencoded({extended:true}));
app.use("/" , router);


app.listen(process.env.PORT , (req,res)=>{
    console.log("Server Started");
})