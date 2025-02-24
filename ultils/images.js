const cloudinary = require("../configs/cloudinaryConfig");

export const uploadImages = async (req, res) => {
  try {
    const images = req.files.map((file) => file.path);
    const listImage = [];

    for (let ima of images) {
      const result = await cloudinary.uploader.upload(ima);
      listImage.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};
