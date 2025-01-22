var express = require("express");
const imageProductModel = require("../models/imageProductModel");
var router = express.Router();

//* /image_product

//* Lấy danh sách ảnh theo id_product
router.get("/list-images/:id_product", async (req, res, next) => {
  try {
    const { id_product } = req.params;

    const images = await imageModel.find({ id_product });

    if (images.length === 0) {
      return res.json({ status: false, mess: "Không có ảnh cho sản phẩm này" });
    }

    res.json({ status: true, data: images });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Thêm ảnh cho sản phẩm
router.post("/add-image/:id_product", async (req, res, next) => {
  try {
    const { id_product } = req.params;
    const { image } = req.body;

    const newImage = new imageModel({
      image,
      id_product,
    });

    await newImage.save();

    res.json({ status: true, data: newImage });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Xóa ảnh theo id
router.delete("/delete-image/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra tính hợp lệ của id
    if (!ObjectId.isValid(id)) {
      return res.json({ status: false, mess: "ID ảnh không hợp lệ" });
    }

    // Tìm và xóa ảnh
    const deletedImage = await imageModel.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.json({ status: false, mess: "Không tìm thấy ảnh để xóa" });
    }

    res.json({ status: true, mess: "Xóa ảnh thành công", data: deletedImage });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

module.exports = router;
