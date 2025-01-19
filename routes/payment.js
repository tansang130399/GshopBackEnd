var express = require("express");
const paymentModel = require("../models/paymentModel");
var router = express.Router();

//* /payment_method
//* lấy danh sách tất cả
router.get("/list", async (req, res, next) => {
  try {
    var data = await paymentModel.find();
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
