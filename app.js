const express=require("express");
const app=express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();
app.use(express.json());

app.get("/test",(req,res)=>{
    res.status(200).json("running");
})
app.post("/test",(req,res)=>{
    const {name,id}=req.body;
    res.status(200).json({message:{name,id}});
})
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});