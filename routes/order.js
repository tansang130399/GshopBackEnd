var express = require("express");
var router = express.Router();
const orderModel = require("../models/orderModel");
const detailOrderModel = require("../models/detailOrderModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");

//* /order
//* lấy danh sách tất cả đơn hàng
router.get("/list", async (req, res, next) => {
  try {
    var data = await orderModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

// Tạo đơn hàng, xóa sp được chọn khỏi giỏ hàng, tạo order detail, giảm sl tồn kho
router.post("/create-order", async (req, res) => {
  try {
    const { id_user, id_payment, id_address } = req.body;

    // Tìm giỏ hàng của user
    const cart = await cartModel.findOne({ id_user });
    if (!cart || cart.items.length === 0) {
      return res.json({ status: false, message: "Giỏ hàng trống, không thể đặt hàng" });
    }

    // Lọc sản phẩm được chọn
    const selectedItems = cart.items.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      return res.json({
        status: false,
        message: "Vui lòng chọn sản phẩm trước khi đặt hàng",
      });
    }

    // Tạo đơn hàng mới
    const newOrder = await orderModel.create({
      id_user,
      id_payment,
      id_address,
      total_price: cart.totalPrice,
    });

    await Promise.all(
      selectedItems.map(async (item) => {
        // Tạo chi tiết đơn hàng
        await detailOrderModel.create({
          id_order: newOrder._id,
          id_product: item.id_product,
          quantity: item.quantity,
          unit_price: item.price,
        });

        // Giảm số lượng sản phẩm
        await productModel.findByIdAndUpdate(
          item.id_product,
          { $inc: { quantity: -item.quantity } },
          { new: true }
        );
      })
    );

    // Xóa sản phẩm đã mua khỏi giỏ hàng
    cart.items = cart.items.filter((item) => !item.selected);
    await cart.save();

    res.json({
      status: true,
      data: newOrder,
    });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

// Thay đổi status order
router.put("/update/:id_order", async (req, res, next) => {
  try {
    const { id_order } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    const updated = await orderModel.findByIdAndUpdate(
      id_order,
      { status },
      { new: true }
    );

    res.json({ status: true, data: updated });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

module.exports = router;
