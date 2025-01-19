var express = require("express");
const categoryModel = require("../models/categoryModel");
var router = express.Router();

//* /category

//* lấy danh sách danh mục
router.get("/list", async (req, res, next) => {
  try {
    var data = await categoryModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* tạo danh mục
router.post("/create", async (req, res, next) => {
  try {
    const { name_type } = req.body;
    if (!name_type) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    const newCategory = await categoryModel.create({ name_type });
    res.json({ status: true, data: newCategory });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* cập nhật danh mục
router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name_type } = req.body;

    if (!name_type) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { name_type },
      { new: true }
    );

    if (!updatedCategory) {
      return res.json({ status: false, mess: "Không tìm thấy danh mục" });
    }

    res.json({ status: true, data: updatedCategory });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

module.exports = router;
