var express = require("express");
const supplierModel = require("../models/supplierModel");
var router = express.Router();

//* /supplier
//* lấy danh sách tất cả
router.get("/list", async (req, res, next) => {
  try {
    var data = await supplierModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* thêm nhà cung cấp
router.post("/add", async (req, res, next) => {
  try {
    const { name, email, phone_number, representative, cooperation_date, address, status } =
      req.body;

    // Kiểm tra nếu thiếu thông tin
    if (!name || !email || !phone_number || !representative || !cooperation_date || !address) {
      return res.json({
        status: false,
        mess: "Vui lòng nhập đầy đủ thông tin",
      });
    }

    // Tạo nhà cung cấp mới
    const newSupplier = new supplierModel({
      name,
      email,
      phone_number,
      representative,
      cooperation_date,
      address,
      status,
    });
    await newSupplier.save();

    res.json({
      status: true,
      data: newSupplier,
    });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* sửa nhà cung cấp
router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone_number, representative, cooperation_date, address, status } =
      req.body;

    // Cập nhật dữ liệu
    const updatedSupplier = await supplierModel.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone_number,
        representative,
        cooperation_date,
        address,
        status,
      },
      { new: true }
    );

    if (updatedSupplier) {
      res.json({
        status: true,
        data: updatedSupplier,
      });
    } else {
      res.json({ status: false, mess: "Không tìm thấy nhà cung cấp" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

module.exports = router;
