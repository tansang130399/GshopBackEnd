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

// Lấy chi tiết phương thức thanh toán theo id_payment
router.get("/detail/:id_payment", async (req, res) => {
  try {
    const { id_payment } = req.params;

    const payment = await paymentModel.findById(id_payment);

    if (!payment) {
      return res.json({ status: false, message: "Không tìm thấy phương thức thanh toán" });
    }

    res.json({ status: true, data: payment });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

module.exports = router;
