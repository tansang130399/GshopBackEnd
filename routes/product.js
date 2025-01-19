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

//*
module.exports = router;
