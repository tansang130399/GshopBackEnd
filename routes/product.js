var express = require("express");
const productModel = require("../models/productModel");
var router = express.Router();

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//* /product

//* lấy danh sách sản phẩm
router.get("/list", async (req, res, next) => {
  try {
    var data = await productModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* lấy sản phẩm theo danh mục
router.get("/list-by-category/:id_category", async (req, res, next) => {
  try {
    const { id_category } = req.params;

    const products = await productModel.find({
      id_category: id_category,
    });

    if (products.length === 0) {
      return res.json({ status: false, mess: id_category });
    }

    res.json({ status: true, data: products });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Lấy sản phẩm theo ID
router.get("/detail/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ status: false, mess: "Sản phẩm không tồn tại" });
    }
    res.json({ status: true, data: product });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Thêm sản phẩm
router.post("/create", async (req, res, next) => {
  try {
    const {
      name,
      price,
      quantity,
      description,
      id_category,
      id_supplier,
      status,
    } = req.body;

    if (
      !name ||
      !price ||
      !quantity ||
      !id_category ||
      !id_supplier ||
      !status
    ) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    if (price <= 0 || quantity <= 0) {
      return res.json({ status: false, mess: "Sai định dạng" });
    }

    const newProduct = new productModel({
      name,
      price,
      quantity,
      description,
      id_category,
      id_supplier,
      status,
    });

    const savedProduct = await newProduct.save();

    res.json({ status: true, data: savedProduct });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Cập nhật sản phẩm
router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      quantity,
      description,
      id_category,
      id_supplier,
      status,
    } = req.body;

    if (
      !name ||
      !price ||
      !quantity ||
      !id_category ||
      !id_supplier ||
      !status
    ) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    if (price <= 0 || quantity <= 0) {
      return res.json({ status: false, mess: "Sai định dạng" });
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { name, price, quantity, description, id_category, id_supplier, status },
      { new: true }
    );

    // Kiểm tra xem sản phẩm có tồn tại không
    if (!updatedProduct) {
      return res.json({ status: false, mess: "Không tìm thấy sản phẩm" });
    }

    res.json({ status: true, data: updatedProduct });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

module.exports = router;
