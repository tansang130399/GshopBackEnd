var express = require("express");
const newsModel = require("../models/newsModel");
var router = express.Router();

// news

// Middleware giả lập xác thực người dùng
// router.use((req, res, next) => {
//   req.user = { _id: new Types.ObjectId() } // // Giả lập một user ID
// })

// // Thêm tin tức
// router.post('/addNews', async (req, res) => {
//   try {
//     // const { images, title, content } = req.body;
//     // const idUser = req.user._id; // Lấy id_user từ middleware giả lập

//     // // Đảm bảo images là mảng
//     // if(!Array.isArray(images)){
//     //   images = [images];
//     // }

//     // const objectNews = {images, title, content, idUser};
//     // await newsModel.create(objectNews);

//     res.status(200).json({ status: true, message: "Thêm tin tức thành công" });
//   } catch (e) {
//     res.status(404).json({ status: false, message: "Thêm tin tức thất bại", error: error.message });
//   }
// })

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
    res.status(404).json({ status: false, message: 'Thêm thất bại tin tưccsa' });
  }
})

//* lấy danh sách tất cả
// router.get("/list", async (req, res, next) => {
//   try {
//     var data = await newsModel.find();
//     if (data) {
//       res.json({ status: true, data: data });
//     } else {
//       res.json({ status: false, mess: "Không có danh sách" });
//     }
//   } catch (error) {
//     res.json({ status: false, mess: error.message });
//   }
// });

module.exports = router;
