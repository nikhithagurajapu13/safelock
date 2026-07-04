const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fileName: String,
    fileUrl: String,
    fileType: {
      type: String,
      enum: ["photo", "video", "document"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);