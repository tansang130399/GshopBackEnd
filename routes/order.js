var express = require("express");
var router = express.Router();
const orderModel = require("../models/orderModel");
const detailOrderModel = require("../models/detailOrderModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");

//* /order
//* lấy tất cả đơn hàng
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

//* Lấy tất cả order của user
router.get("/list-order-user/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;

    const order = await orderModel.find({ id_user });
    if (!order) {
      return res.json({ status: false, message: "Chưa có đơn hàng nào" });
    }

    res.json({ status: true, data: order });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* Lấy tất cả order "Đang xử lý" của user
router.get("/list-user-processing/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;

    const order = await orderModel.find({ id_user, status: "Đang xử lý" });
    if (!order) {
      return res.json({ status: false, message: "Không có đơn hàng nào" });
    }

    res.json({ status: true, data: order });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* Lấy tất cả order "Đang giao hàng" của user
router.get("/list-user-onDelivery/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;

    const order = await orderModel.find({ id_user, status: "Đang giao hàng" });
    if (!order) {
      return res.json({ status: false, message: "Không có đơn hàng nào" });
    }

    res.json({ status: true, data: order });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* Lấy tất cả order "Đã giao" của user
router.get("/list-user-delivered/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;

    const order = await orderModel.find({ id_user, status: "Đã giao" });
    if (!order) {
      return res.json({ status: false, message: "Không có đơn hàng nào" });
    }

    res.json({ status: true, data: order });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

// Tạo đơn hàng, xóa sp được chọn khỏi giỏ hàng, tạo order detail, giảm sl tồn kho
router.post("/create-order", async (req, res) => {
  try {
    const { id_user, id_payment, name, address, phone } = req.body;

    // Tìm giỏ hàng của user
    const order = await cartModel.findOne({ id_user });
    if (!order || order.items.length === 0) {
      return res.json({ status: false, message: "Giỏ hàng trống, không thể đặt hàng" });
    }

    // Lọc sản phẩm được chọn
    const selectedItems = order.items.filter((item) => item.selected);
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
      name,
      address,
      phone,
      total_price: order.totalPrice,
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
    order.items = order.items.filter((item) => !item.selected);
    await order.save();

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

    const updated = await orderModel.findByIdAndUpdate(id_order, { status }, { new: true });

    res.json({ status: true, data: updated });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Lấy tất cả order "Đang xử lý"
router.get("/list-processing", async (req, res) => {
  try {
    const order = await orderModel.find({ status: "Đang xử lý" });
    if (!order) {
      return res.json({ status: false, message: "Không có đơn hàng nào" });
    }

    res.json({ status: true, data: order });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* Lấy tất cả order "Đang giao hàng"
router.get("/list-onDelivery", async (req, res) => {
  try {
    const order = await orderModel.find({ status: "Đang giao hàng" });
    if (!order) {
      return res.json({ status: false, message: "Không có đơn hàng nào" });
    }

    res.json({ status: true, data: order });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* Lấy tất cả order "Đã giao" và doanh thu
router.get("/list-delivered", async (req, res) => {
  try {
    const order = await orderModel.find({ status: "Đã giao" });
    if (!order) {
      return res.json({ status: false, message: "Không có đơn hàng nào" });
    }

    const totalRevenue = order.reduce((sum, order) => sum + order.total_price, 0);

    res.json({ status: true, data: order, totalRevenue });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* doanh thu 7 ngày trước, 30 ngày trước, từ trước đến nay
router.get("/revenue", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Tính ngày bắt đầu cho mỗi khoảng thời gian
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Chuyển đổi các ngày sang định dạng "DD/MM/YYYY" (en-GB) để phù hợp với format lưu trong DB
    const formatDate = (date) => {
      return date.toLocaleDateString("en-GB");
    };

    const todayFormatted = formatDate(today);
    const sevenDaysAgoFormatted = formatDate(sevenDaysAgo);
    const thirtyDaysAgoFormatted = formatDate(thirtyDaysAgo);

    // 0. Doanh thu hôm nay
    const toDayOrders = await orderModel.find({
      date: todayFormatted,
      status: "Đã giao",
    });

    const toDayRevenue = toDayOrders.reduce((total, order) => total + order.total_price, 0);

    // 1. Tính doanh thu 7 ngày gần đây
    const last7DaysOrders = await orderModel.find({
      date: {
        $gte: sevenDaysAgoFormatted,
        $lt: todayFormatted,
      },
      status: "Đã giao",
    });

    const last7DaysRevenue = last7DaysOrders.reduce(
      (total, order) => total + order.total_price,
      0
    );

    // Doanh thu theo từng ngày trong 7 ngày gần đây
    const dailyRevenueLast7Days = {};
    const last7DaysArray = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateFormatted = formatDate(date);
      last7DaysArray.push(dateFormatted);
      dailyRevenueLast7Days[dateFormatted] = 0;
    }

    last7DaysOrders.forEach((order) => {
      if (dailyRevenueLast7Days[order.date] !== undefined) {
        dailyRevenueLast7Days[order.date] += order.total_price;
      }
    });

    // 2. Tính doanh thu 30 ngày gần đây
    const last30DaysOrders = await orderModel.find({
      date: {
        $gte: thirtyDaysAgoFormatted,
        $lt: todayFormatted,
      },
      status: "Đã giao",
    });

    const last30DaysRevenue = last30DaysOrders.reduce(
      (total, order) => total + order.total_price,
      0
    );

    // 3. Tính tổng doanh thu từ trước đến nay
    const allCompletedOrders = await orderModel.find({
      status: "Đã giao",
    });

    const totalRevenue = allCompletedOrders.reduce((total, order) => total + order.total_price, 0);

    // Tính doanh thu theo tháng trong năm hiện tại
    const currentYear = today.getFullYear();
    const monthlyRevenue = {};

    // Khởi tạo doanh thu các tháng bằng 0
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleString("vi-VN", { month: "long" });
      monthlyRevenue[monthName] = 0;
    }

    allCompletedOrders.forEach((order) => {
      const orderDate = order.date.split("/").map((part) => parseInt(part, 10));
      const orderMonth = orderDate[1] - 1; // Tháng trong JS bắt đầu từ 0
      const orderYear = orderDate[2];

      if (orderYear === currentYear) {
        const monthName = new Date(currentYear, orderMonth, 1).toLocaleString("vi-VN", {
          month: "long",
        });
        monthlyRevenue[monthName] += order.total_price;
      }
    });

    // Tính số đơn hàng đã hoàn thành
    const totalCompletedOrders = allCompletedOrders.length;

    return res.json({
      status: true,
      data: {
        toDayRevenue,
        toDayOrders: toDayOrders.length,
        last7DaysRevenue,
        last30DaysRevenue,
        totalRevenue,
        dailyRevenueLast7Days,
        monthlyRevenue,
        totalCompletedOrders,
      },
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

//* doanh thu từ ngày đến ngày ("dd/mm/yyyy")
router.get("/revenue-daily", async (req, res) => {
  try {
    const { start, end } = req.body; //data mẫu { "start": "01/03/2025", "end": "06/03/2025"}

    if (!start || !end) {
      return res.json({
        status: false,
        message: "Thiếu tham số ngày bắt đầu hoặc ngày kết thúc",
      });
    }

    // Kiểm tra định dạng ngày tháng (DD/MM/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.json({
        status: false,
        message: "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng DD/MM/YYYY",
      });
    }

    //Các đơn hàng "Đã giao"
    const ordersInPeriod = await orderModel
      .find({
        date: {
          $gte: start,
          $lte: end,
        },
        status: "Đã giao",
      })
      .sort({ date: 1 });

    // Tạo danh sách tất cả các ngày trong khoảng
    const allDates = [];
    const startParts = start.split("/").map((part) => parseInt(part, 10));
    const endParts = end.split("/").map((part) => parseInt(part, 10));

    const startDate = new Date(startParts[2], startParts[1] - 1, startParts[0]);
    const endDate = new Date(endParts[2], endParts[1] - 1, endParts[0]);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      allDates.push(d.toLocaleDateString("en-GB"));
    }

    // Tính doanh thu cho từng ngày
    const dailyRevenue = {};
    allDates.forEach((date) => {
      dailyRevenue[date] = 0;
    });

    ordersInPeriod.forEach((order) => {
      if (dailyRevenue[order.date] !== undefined) {
        dailyRevenue[order.date] += order.total_price;
      }
    });

    // Tính tổng doanh thu trong khoảng thời gian
    const totalRevenue = ordersInPeriod.reduce((total, order) => total + order.total_price, 0);

    // Tính số đơn hàng trong khoảng thời gian
    const totalOrders = ordersInPeriod.length;

    return res.json({
      status: true,
      data: {
        startDate: start,
        endDate: end,
        dailyRevenue,
        totalRevenue,
        totalOrders,
      },
    });
  } catch (error) {
    return res.json({
      status: false,
      message: error.message,
    });
  }
});

//* danh sách sản phẩm theo sll bán được, theo doanh thu.
//* Danh sách tỉ lệ từng loại sản phẩm theo sl bán được
router.get("/top-products", async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$id_product",
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$unit_price"] } },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 0,
          id_product: "$_id",
          name: "$productInfo.name",
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ];

    const byQuantity = await detailOrderModel.aggregate([
      ...pipeline,
      { $sort: { totalSold: -1 } },
    ]);

    const byRevenue = await detailOrderModel.aggregate([
      ...pipeline,
      { $sort: { totalRevenue: -1 } },
    ]);

    const categoryStats = await categoryModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "id_category",
          as: "products",
        },
      },
      {
        $unwind: {
          path: "$products",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "detail_orders",
          localField: "products._id",
          foreignField: "id_product",
          as: "orders",
        },
      },
      {
        $unwind: {
          path: "$orders",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name_type" },
          totalSold: { $sum: { $ifNull: ["$orders.quantity", 0] } },
        },
      },
    ]);

    const totalSoldAll = categoryStats.reduce((sum, item) => sum + item.totalSold, 0);

    const categoryRatio = categoryStats.map((item) => ({
      id_category: item._id,
      name: item.name,
      totalSold: item.totalSold,
      percentage:
        totalSoldAll === 0 ? "0%" : ((item.totalSold / totalSoldAll) * 100).toFixed(2) + "%",
    }));

    res.json({
      status: true,
      byQuantity,
      byRevenue,
      categoryRatio,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
