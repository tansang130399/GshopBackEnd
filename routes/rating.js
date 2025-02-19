var express = require("express");
const ratingModel = require("../models/ratingModel");
var router = express.Router();

// rating
// Thêm đánh giá
router.post('/add', async (req, res) => {
  try {
    const { star, content, id_user, id_product } = req.body;

    const objectRate = { star, content, id_user, id_product };
    await ratingModel.create(objectRate)

    res.status(200).json({ status: true, message: 'Thêm thành công' });
  } catch (e) {
    res.status(404).json({ status: false, message: 'Thêm thất bại' });
  }
});

// Sửa đánh giá
router.put('/edit', async (req, res) => {
  try {
    const { _id } = req.query;
    const { star, content, id_user, id_product } = req.body;

    // Kiểm tra xem đánh giá có tồn tại không?
    const rateItem = await ratingModel.findById(_id);
    if (!rateItem) {
      return res.status(404).json({ status: false, message: 'Đánh giá không tồn tại' });
    }

    // Cập nhật thông tin đánh giá
    await ratingModel.findByIdAndUpdate(_id, {
      star, content, id_user, id_product
    })

    // Lấy data tin tức sau khi cập nhật
    const updatedNews = await ratingModel.findById(_id);
    res.status(200).json({ status: true, message: 'Cập nhật thành công', data: updatedNews });
  } catch (e) {
    res.status(404).json({ status: false, message: 'Cập nhật thất bại' });
  }
});

// Lấy danh sách tất cả đánh giá
router.get('/list', async (req, res) => {
  try {
    const data = await ratingModel.find();
    res.status(200).json({ status: true, data: data });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Lấy danh sách đánh giá theo sản phẩm
router.get('/list_product', async (req, res) => {
  try {
    const { id_product } = req.query;

    // Kiểm tra id_product
    if (!id_product) {
      return res.status(400).json({ status: false, message: "Thiếu id_product" });
    }

    // Tìm các đánh giá của sản phẩm
    const ratings = await ratingModel.find({ id_product })
      .sort({ date: -1 }); // Sắp xếp theo thời gian giảm dần

    // Kiểm tra sản phẩm có đánh giá chưa
    if (ratings.length === 0) {
      return res.status(200).json({ status: true, message: "Sản phẩm chưa có đánh giá" });
    }

    res.status(200).json({ status: true, data: ratings });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Lấy chi tiết đánh giá
router.get('/detail_rate', async (req, res) => {
  try {
    const { _id } = req.query;
    const detail = await ratingModel.findOne({ _id: _id });
    res.status(200).json({ status: true, data: detail });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Xóa tin tức
router.delete('/delete', async (req, res) => {
  try {
    const { _id } = req.query;

    // Kiểm tra tin tức đã tồn tại chưa
    const rateItem = await ratingModel.findById(_id);
    if (!rateItem) {
      return res.status(404).json({ status: false, message: 'Đánh giá không tồn tại' });
    }

    await ratingModel.findByIdAndDelete(_id);
    res.status(200).json({ status: true, message: 'Xóa tin tức thành công' });
  } catch (e) {
    res.status(404).json({ status: false, message: e })
  }
});

module.exports = router;
