const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "dojc67380",
  api_key: "514968897857836",
  api_secret: "xXd4kIj_Sv1nip4uCiiF1_k_SRI",
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png", "jpeg", "heif", "heic"],
  params: {
    folder: "gshop-image-news",
  },
});

const uploadCloud = multer({ storage });

module.exports = uploadCloud;
