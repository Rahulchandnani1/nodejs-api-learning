const User = require("./models/User");
const express=require("express");
const app=express();
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
dotenv.config();
connectDB();
const multer = require("multer");
const path = require("path");

// storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

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
app.get("/api/search", async (req, res) => {
    try {
        const { name, email } = req.query;

        let filter = {};

        if (name) filter.name = { $regex: name, $options: "i" };
        if (email) filter.email = { $regex: email, $options: "i" };

        const users = await User.find(filter);

        res.json({ count: users.length, data: users });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        res.status(200).json({
            message: "File uploaded successfully",
            file: req.file
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// app.get("/search", async (req, res) => {
//     try {
//         const { name } = req.query;

//         const user = await User.find({ name: { $regex: name, $options: "i" } });

//         // if user not found
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         res.status(200).json({
//             message: "User fetched successfully",
//             data: user
//         });

//     } catch (error) {
//         res.status(500).json({
//             message: "Error fetching user",
//             error: error.message
//         });
//     }
// });
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

app.delete("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        // check existing user
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // create token
        const token = jwt.sign(
            { id: user._id },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});