var express = require("express");
const addressModel = require("../models/addressModel");
var router = express.Router();

//* /address

//* lấy danh sách địa chỉ
router.get("/list", async (req, res, next) => {
  try {
    var data = await addressModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Thêm địa chỉ
router.post("/create", async (req, res, next) => {
  try {
    const { detail, commune, district, province, id_user } = req.body;

    if (!detail || !commune || !district || !province || !id_user) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    const newAddress = await addressModel.create({
      detail,
      commune,
      district,
      province,
      id_user,
    });

    res.json({ status: true, data: newAddress });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Sửa địa chỉ
router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { detail, commune, district, province, id_user } = req.body;

    if (!detail || !commune || !district || !province || !id_user) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    const updatedAddress = await addressModel.findByIdAndUpdate(
      id,
      { detail, commune, district, province, id_user },
      { new: true }
    );

    res.json({ status: true, data: updatedAddress });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Xóa địa chỉ
router.delete("/delete/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedAddress = await addressModel.findByIdAndDelete(id);

    if (!deletedAddress) {
      return res.json({ status: false, mess: "Error" });
    }

    res.json({ status: true, mess: "Xóa địa chỉ thành công" });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Lấy danh sách địa chỉ theo id_user
router.get("/list/:id_user", async (req, res, next) => {
  try {
    const { id_user } = req.params;

    const addresses = await addressModel.find({ id_user });

    if (addresses.length === 0) {
      return res.json({ status: false, mess: "Không có địa chỉ nào" });
    }

    res.json({ status: true, data: addresses });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

// Lấy chi tiết địa chỉ theo id_address
router.get("/detail/:id_address", async (req, res) => {
  try {
    const { id_address } = req.params;

    // Tìm địa chỉ theo ID
    const address = await addressModel.findById(id_address);

    if (!address) {
      return res.json({ status: false, message: "Không tìm thấy địa chỉ" });
    }

    res.json({ status: true, data: address });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});
module.exports = router;
