var express = require("express");
const newsModel = require("../models/newsModel");
var router = express.Router();

// news

// Thêm tin tức
router.post('/add', async (req, res) => {
  try {
    const { images, title, content, id_user } = req.body;

    // Đảm bảo image là mảng
    if (!Array.isArray(images)) {
      images = [images];
    }

    const objectNews = { images, title, content, id_user };
    await newsModel.create(objectNews);

    res.status(200).json({ status: true, message: 'Thêm thành công' });
  } catch (e) {
    res.status(404).json({ status: false, message: 'Thêm thất bại tin tức' });
  }
});

// Sửa tin tức
router.put('/edit', async (req, res) => {
  try {
    const { _id } = req.query;
    const { images, title, content, id_user } = req.body;

    // Kiểm tra xem tin tức có tồn tại không
    const newsItem = await newsModel.findById(_id);
    if (!newsItem) {
      return res.status(404).json({ status: false, message: 'Tin tức không tồn tại' });
    }

    // Đảm bảo images là mảng, nếu không có images mới, giữ lại images cũ
    const updatedImages = images ? (Array.isArray(images) ? images : [images]) : newsItem.images;

    // Cập nhật thông tin tin tức
    await newsModel.findByIdAndUpdate(_id, {
      images: updatedImages,
      title,
      content,
      id_user
    });

    // Lấy data tin tức sau khi cập nhật
    const updatedNews = await newsModel.findById(_id);

    res.status(200).json({ status: true, message: 'Cập nhật thành công', data: updatedNews });
  } catch (e) {
    res.status(404).json({ status: false, message: 'Cập nhật thành công' });
  }
});

// Lấy danh sách tin tức
router.get('/list', async (req, res) => {
  try {
    const data = await newsModel.find()
    res.status(200).json({ status: true, data: data });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Lấy chi tiết tin tức
router.get('/detail_news', async (req, res) => {
  try {
    const { _id } = req.query;
    const detail = await newsModel.findOne({ _id: _id });
    res.status(200).json({ status: true, data: detail });
  } catch (e) {
    res.status(404).json({ status: false, message: e })
  }
});

// Xóa tin tức
router.delete('/delete', async (req, res) => {
  try {
    const { _id } = req.query;

    // Kiểm tra tin tức đã tồn tại chưa
    const newsItem = await newsModel.findById(_id);
    if (!newsItem) {
      return res.status(404).json({ status: false, message: 'Tin tức không tồn tại' });
    }

    // Xóa tin tức
    await newsModel.findByIdAndDelete(_id);
    res.status(200).json({ status: true, message: 'Xóa tin tức thành công' });
  } catch (e) {
    res.status(404).json({ status: false, message: e })
  }
});

module.exports = router;
