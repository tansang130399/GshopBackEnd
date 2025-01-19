var express = require("express");
const imageProductModel = require("../models/imageProductModel");
var router = express.Router();

//* /image_product
//* lấy danh sách tất cả
router.get("/list", async (req, res, next) => {
  try {
    var data = await imageProductModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});
module.exports = router;
