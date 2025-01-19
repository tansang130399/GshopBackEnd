var express = require("express");
const detailOrderModel = require("../models/detailOrderModel");
var router = express.Router();

//* /detail_order
//* lấy danh sách tất cả
router.get("/list", async (req, res, next) => {
  try {
    var data = await detailOrderModel.find();
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
