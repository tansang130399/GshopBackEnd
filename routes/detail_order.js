var express = require("express");
const detailOrderModel = require("../models/detailOrderModel");
var router = express.Router();

//* /detail_order

//* Lấy danh sách chi tiết đơn hàng theo id_order
router.get("/list-by-order/:id_order", async (req, res, next) => {
  try {
    const { id_order } = req.params;

    const detailOrders = await detailOrderModel.find({ id_order });

    res.json({ status: true, data: detailOrders });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Thêm chi tiết đơn hàng
router.post("/add", async (req, res, next) => {
  try {
    const { quantity, unit_price, id_order, id_product } = req.body;

    if (!quantity || !unit_price || !id_order || !id_product) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    const newDetailOrder = new detailOrderModel({
      quantity,
      unit_price,
      id_order,
      id_product,
    });

    await newDetailOrder.save();

    res.json({ status: true, data: newDetailOrder });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

module.exports = router;
