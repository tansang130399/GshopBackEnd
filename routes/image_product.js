var express = require("express");
var router = express.Router();
const imageProductModel = require("../models/imageProductModel");
const productModel = require("../models/productModel");
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
router.post("/upload/:id_product", [uploadCloud.array("image", 10)], async (req, res) => {
  try {
    const { id_product } = req.params;
    const { files } = req;

    //kiểm tra
    if (!files || files.length === 0) {
      return res.json({ status: false, message: "Vui lòng chọn ít nhất một ảnh" });
    }

    const product = await productModel.findById(id_product);
    if (!product) {
      return res.json({ status: false, message: "Sản phẩm không tồn tại" });
    }

    const imageUrls = files.map((file) => file.path);

    let listIma = await imageProductModel.findOne({ id_product });

    if (!listIma) {
      listIma = new imageProductModel({ id_product, image: imageUrls });
    } else {
      listIma.image = [...listIma.image, ...imageUrls];
    }

    await listIma.save();
    return res.json({
      status: true,
      message: `Đã upload thành công ${files.length} ảnh`,
      data: listIma,
    });
  } catch (error) {
    return res.json({
      status: false,
      message: "Đã xảy ra lỗi khi upload ảnh",
      error: error.message,
    });
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
