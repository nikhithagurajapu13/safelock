const express = require("express");
const router = express.Router();
const multer = require("multer");

const auth = require("../middleware/authMiddleware");

const {
  getMyFiles,
  uploadFile,
  downloadFile,
  viewFile,
  deleteFile
} = require("../controllers/fileController");

const upload = multer({
  dest: "uploads/"
});

router.get("/my-files", auth, getMyFiles);

router.post(
  "/upload",
  auth,
  upload.single("file"),
  uploadFile
);

router.get("/download/:id", auth, downloadFile);
router.get("/view/:id", auth, viewFile);
router.delete("/:id", auth, deleteFile);

module.exports = router;