const fs = require("fs");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const File = require("../models/File");
const cloudinary = require("../config/cloudinary");

exports.getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id }).sort({
      createdAt: -1
    });

    res.json(files);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch files"
    });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const encryptedData = CryptoJS.AES.encrypt(
      fileBuffer.toString("base64"),
      process.env.ENCRYPTION_KEY
    ).toString();

    const encryptedPath = req.file.path + ".txt";

    fs.writeFileSync(encryptedPath, encryptedData);

    const result = await cloudinary.uploader.upload(encryptedPath, {
      resource_type: "raw",
      folder: "safelock-encrypted"
    });

    const newFile = new File({
      user: req.user.id,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      fileType: req.body.fileType
    });

    await newFile.save();

    fs.unlinkSync(req.file.path);
    fs.unlinkSync(encryptedPath);

    res.status(201).json({
      message: "Encrypted file uploaded successfully",
      file: newFile
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Encrypted upload failed"
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const response = await axios.get(file.fileUrl, {
      responseType: "text"
    });

    const decrypted = CryptoJS.AES.decrypt(
      response.data,
      process.env.ENCRYPTION_KEY
    );

    const originalBase64 = decrypted.toString(CryptoJS.enc.Utf8);

    const buffer = Buffer.from(originalBase64, "base64");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName}"`
    );

    res.send(buffer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Download failed"
    });
  }
};

exports.viewFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    const response = await axios.get(file.fileUrl, {
      responseType: "text"
    });

    const decrypted = CryptoJS.AES.decrypt(
      response.data,
      process.env.ENCRYPTION_KEY
    );

    const originalBase64 = decrypted.toString(CryptoJS.enc.Utf8);

    const buffer = Buffer.from(originalBase64, "base64");

    const extension = file.fileName.split(".").pop().toLowerCase();

    if (file.fileType === "photo") {
      if (extension === "png") {
        res.setHeader("Content-Type", "image/png");
      } else if (extension === "gif") {
        res.setHeader("Content-Type", "image/gif");
      } else {
        res.setHeader("Content-Type", "image/jpeg");
      }
    }

    if (file.fileType === "video") {
      if (extension === "webm") {
        res.setHeader("Content-Type", "video/webm");
      } else if (extension === "ogg") {
        res.setHeader("Content-Type", "video/ogg");
      } else {
        res.setHeader("Content-Type", "video/mp4");
      }
    }

    if (file.fileType === "document") {
      if (extension === "pdf") {
        res.setHeader("Content-Type", "application/pdf");
      } else if (extension === "doc") {
        res.setHeader("Content-Type", "application/msword");
      } else if (extension === "docx") {
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
      } else {
        res.setHeader("Content-Type", "application/octet-stream");
      }
    }

    res.send(buffer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "View failed"
    });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found"
      });
    }

    if (file.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    await File.findByIdAndDelete(req.params.id);

    res.json({
      message: "File deleted successfully"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Delete failed"
    });
  }
};