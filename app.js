const User = require("./models/User");
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
app.get("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        // if user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error: error.message
        });
    }
});
app.get("/search", async (req, res) => {
    try {
        const { name } = req.query;

        const user = await User.find({ name: { $regex: name, $options: "i" } });

        // if user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User fetched successfully",
            data: user
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching user",
            error: error.message
        });
    }
});
app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User updated successfully",
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});