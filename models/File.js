const mongoose = require("mongoose");


const fileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    originalName: String,
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
