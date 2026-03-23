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
app.post("/test", async (req, res) => {
    try {
        const { name, email } = req.body;

        // validation
        if (!name || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        // create user
        const user = new User({ name, email });

        await user.save();

        res.status(201).json({
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message
        });
    }
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});