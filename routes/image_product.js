var express = require("express");
var router = express.Router();
const imageProductModel = require("../models/imageProductModel");
const uploadCloud = require("../ultils/uploader");
//* /image_product

//* Lấy danh sách ảnh theo id_product
router.get("/list-images/:id_product", async (req, res, next) => {
  try {
    const { id_product } = req.params;

    const images = await imageProductModel.find({ id_product: id_product });

    if (images.length === 0) {
      return res.json({ status: false, mess: "Không có ảnh cho sản phẩm này" });
    }

    res.json({ status: true, data: images });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Thêm ảnh cho sản phẩm
router.post("/upload", [uploadCloud.array("image", 9)], async (req, res) => {
  try {
    const { files } = req;
    console.log(files);
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
