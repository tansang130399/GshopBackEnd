var express = require("express");
const newsModel = require("../models/newsModel");
const userModel = require("../models/userModel");
var router = express.Router();
const uploadCloud = require("../ultils/upload_news");

// news
// Thêm tin tức
router.post("/add", async (req, res) => {
  try {
    const { title, content, id_user } = req.body;

    const user = await userModel.findById(id_user);
    if (user.role === "user") {
      return res.json({ status: false, message: "Staff, Admin mới có thể đăng tin tức" });
    }
    const objectNews = { title, content, id_user };
    await newsModel.create(objectNews);

    res.json({ status: true, data: objectNews });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Thêm ảnh bìa tin tức
router.post("/upload-thumbnail", [uploadCloud.single("image")], async (req, res) => {
  try {
    const { id_news } = req.query;
    const { file } = req;

    //kiểm tra
    if (!file || file.length === 0) {
      return res.json({ status: false, message: "Vui lòng chọn ít nhất một ảnh" });
    }

    let news = await newsModel.findById(id_news);
    if (!news) {
      return res.json({ status: false, message: "Tin tức không tồn tại" });
    }

    news.thumbnail = file.path;

    await news.save();
    res.json({ status: true, data: news });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

//* Xóa thumbnail tin tức
router.delete("/delete-image-thumbnail", async (req, res, next) => {
  try {
    const { id_news } = req.query;

    let news = await newsModel.findById(id_news);

    if (!news) {
      return res.json({ status: false, mess: "Tin tức không tồn tại" });
    }

    const removeThumb = await newsModel.findByIdAndUpdate(
      id_news,
      { thumbnail: "url" },
      { new: true }
    );

    res.json({ status: true, data: removeThumb });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

// Sửa tin tức
router.put("/edit", async (req, res) => {
  try {
    const { _id } = req.query;
    const { title, content, id_user } = req.body;

    // Kiểm tra xem tin tức có tồn tại không
    const newsItem = await newsModel.findById(_id);
    if (!newsItem) {
      return res.json({ status: false, message: "Tin tức không tồn tại" });
    }

    // Cập nhật thông tin tin tức
    await newsModel.findByIdAndUpdate(_id, {
      title,
      content,
      id_user,
    });

    // Lấy data tin tức sau khi cập nhật
    const updatedNews = await newsModel.findById(_id);

    res.json({ status: true, data: updatedNews });
  } catch (e) {
    res.json({ status: false, message: e.message });
  }
});

// Lấy danh sách tin tức
router.get("/list", async (req, res) => {
  try {
    const data = await newsModel.find();
    res.json({ status: true, data: data });
  } catch (e) {
    res.json({ status: false, message: e });
  }
});

// Lấy chi tiết tin tức
router.get("/detail_news", async (req, res) => {
  try {
    const { _id } = req.query;

    const detail = await newsModel.findOne({ _id: _id });
    if (!detail) {
      return res.json({ status: false, message: "Tin tức không tồn tại" });
    }
    res.json({ status: true, data: detail });
  } catch (e) {
    return res.json({ status: false, message: e.message });
  }
});

// Xóa tin tức
router.delete("/delete", async (req, res) => {
  try {
    const { _id } = req.query;

    const newsItem = await newsModel.findById(_id);
    if (!newsItem) {
      return res.json({ status: false, message: "Tin tức không tồn tại" });
    }

    // Xóa tin tức
    await newsModel.findByIdAndDelete(_id);
    res.json({ status: true, message: "Xóa tin tức thành công" });
  } catch (e) {
    res.json({ status: false, message: e });
  }
});

//* Thêm ảnh cho content
router.post(
  "/upload-content/:id_news",
  [uploadCloud.array("image", 10)],
  async (req, res) => {
    try {
      const { id_news } = req.params;
      const { files } = req;

      //kiểm tra
      if (!files || files.length === 0) {
        return res.json({ status: false, message: "Vui lòng chọn ít nhất một ảnh" });
      }

      let news = await newsModel.findById(id_news);
      if (!news) {
        return res.json({ status: false, message: "Tin tức không tồn tại" });
      }

      const imageUrls = files.map((file) => file.path);

      if (news.images.length === 0) {
        news.images = imageUrls;
      } else {
        news.images = [...news.images, ...imageUrls];
      }

      await news.save();
      return res.json({
        status: true,
        message: `Đã upload thành công ${files.length} ảnh`,
        data: news,
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  }
);

//* Xóa 1 hoặc nhiều ảnh content
router.delete("/delete-image-content", async (req, res, next) => {
  try {
    const { id_news } = req.query;
    const { imaUrlsRemove } = req.body; // imaUrlsRemove là mảng

    // Kiểm tra nếu không truyền đúng định dạng
    if (!Array.isArray(imaUrlsRemove) || imaUrlsRemove.length === 0) {
      return res.json({ status: false, mess: "Dữ liệu không hợp lệ" });
    }

    let news = await newsModel.findById(id_news);

    if (!news) {
      return res.json({ status: false, mess: "Tin tức không tồn tại" });
    }

    // Lọc bỏ những ảnh có trong danh sách cần xóa
    news.images = news.images.filter((item) => !imaUrlsRemove.includes(item));

    await news.save();

    res.json({ status: true, data: news });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});
module.exports = router;
