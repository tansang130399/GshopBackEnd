var express = require("express");
const ratingModel = require("../models/ratingModel");
var router = express.Router();
const uploadCloud = require("../ultils/upload_rating");

// rating
// Thêm đánh giá
router.post("/add", async (req, res) => {
  try {
    const { star, content, id_user, id_product } = req.body;

    const objectRate = await ratingModel.create({ star, content, id_user, id_product });

    res.json({ status: true, data: objectRate });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Thêm ảnh rating
router.post("/upload", [uploadCloud.array("image", 10)], async (req, res) => {
  try {
    const { id_rating } = req.query;
    const { files } = req;

    //kiểm tra
    if (!files || files.length === 0) {
      return res.json({ status: false, message: "Vui lòng chọn ít nhất một ảnh" });
    }

    let rating = await ratingModel.findById(id_rating);
    if (!rating) {
      return res.json({ status: false, message: "Đánh giá không tồn tại" });
    }
    const images = files.map((file) => file.path);

    if (rating.images.length === 0) {
      rating.images = images;
    } else {
      rating.images = [...rating.images, ...images];
    }

    await rating.save();
    res.json({ status: true, data: rating });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

//* Xóa 1 hoặc nhiều ảnh rating
router.delete("/delete-image", async (req, res, next) => {
  try {
    const { id_rating } = req.query;
    const { imaUrlsRemove } = req.body; // imaUrlsRemove là mảng

    // Kiểm tra nếu không truyền đúng định dạng
    if (!Array.isArray(imaUrlsRemove) || imaUrlsRemove.length === 0) {
      return res.json({ status: false, mess: "Dữ liệu không hợp lệ" });
    }

    let rating = await ratingModel.findById(id_rating);

    if (!rating) {
      return res.json({ status: false, mess: "Đánh giá không tồn tại" });
    }

    if (rating.length === 0) {
      return res.json({ status: false, mess: "Đánh giá chưa có ảnh" });
    }

    // Lọc bỏ những ảnh có trong danh sách cần xóa
    rating.images = rating.images.filter((item) => !imaUrlsRemove.includes(item));

    await rating.save();

    res.json({ status: true, data: rating });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

// Sửa đánh giá
router.put("/edit", async (req, res) => {
  try {
    const { _id } = req.query;
    const { star, content, id_user, id_product } = req.body;

    // Kiểm tra xem đánh giá có tồn tại không?
    const rateItem = await ratingModel.findById(_id);
    if (!rateItem) {
      return res.status(404).json({ status: false, message: "Đánh giá không tồn tại" });
    }

    // Cập nhật thông tin đánh giá
    await ratingModel.findByIdAndUpdate(_id, {
      star,
      content,
      id_user,
      id_product,
    });

    // Lấy data tin tức sau khi cập nhật
    const updatedrating = await ratingModel.findById(_id);
    res.json({ status: true, message: "Cập nhật thành công", data: updatedrating });
  } catch (e) {
    res.json({ status: false, message: "Cập nhật thất bại" });
  }
});

// Lấy danh sách tất cả đánh giá
router.get("/list", async (req, res) => {
  try {
    const data = await ratingModel.find();
    res.json({ status: true, data: data });
  } catch (e) {
    res.json({ status: false, message: e });
  }
});

// Lấy danh sách đánh giá theo sản phẩm
router.get("/list_product", async (req, res) => {
  try {
    const { id_product } = req.query;

    // Kiểm tra id_product
    if (!id_product) {
      return res.status(400).json({ status: false, message: "Thiếu id_product" });
    }

    // Tìm các đánh giá của sản phẩm
    const ratings = await ratingModel.find({ id_product }).sort({ date: -1 }); // Sắp xếp theo thời gian giảm dần

    // Kiểm tra sản phẩm có đánh giá chưa
    if (ratings.length === 0) {
      return res.json({ status: true, message: "Sản phẩm chưa có đánh giá" });
    }

    res.json({ status: true, data: ratings });
  } catch (e) {
    res.json({ status: false, message: e });
  }
});

// Lấy chi tiết đánh giá
router.get("/detail_rate", async (req, res) => {
  try {
    const { _id } = req.query;
    const detail = await ratingModel.findOne({ _id: _id });
    res.json({ status: true, data: detail });
  } catch (e) {
    res.json({ status: false, message: e });
  }
});

// Xóa đánh giá
router.delete("/delete", async (req, res) => {
  try {
    const { _id } = req.query;

    // Kiểm tra tin tức đã tồn tại chưa
    const rateItem = await ratingModel.findById(_id);
    if (!rateItem) {
      return res.status(404).json({ status: false, message: "Đánh giá không tồn tại" });
    }

    await ratingModel.findByIdAndDelete(_id);
    res.json({ status: true, message: "Xóa tin tức thành công" });
  } catch (e) {
    res.json({ status: false, message: e });
  }
});

module.exports = router;
