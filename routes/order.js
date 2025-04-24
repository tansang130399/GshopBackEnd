var express = require("express");
var router = express.Router();
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const detailOrderModel = require("../models/detailOrderModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const imageProductModel = require("../models/imageProductModel");
const paymentMethod = require("../models/paymentModel");
const categoryModel = require("../models/categoryModel");
var sendMail = require("../utils/configMail");
const getOrderMail = require("../emailTemplates/getOrderMail");
const getCancelOrder = require("../emailTemplates/getCancelOrder");
const { JWT } = require("google-auth-library");

//* /order
//* lấy tất cả đơn hàng
router.get("/list", async (req, res, next) => {
  try {
    const getAccessToken = () => {
      return new Promise(function (resolve, reject) {
        //todo sửa thành file của gshop
        const key = require("../utils/demos-1cf27-firebase-adminsdk-fbsvc-c85c970230.json");
        const jwtClient = new JWT(
          key.client_email,
          null,
          key.private_key,
          ["https://www.googleapis.com/auth/cloud-platform"],
          null
        );
        jwtClient.authorize(function (err, tokens) {
          if (err) {
            reject(err);
            return;
          }
          resolve(tokens.access_token);
        });
      });
    };
    console.log(await getAccessToken());
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

    // Lấy thông tin để gửi mail khi đặt hàng thành công
    const user = await userModel.findById(id_user);
    const orderDetails = await detailOrderModel.find({ id_order: newOrder._id });

    const productOrder = await Promise.all(
      orderDetails.map(async (detail) => {
        const product = await productModel.findById(detail.id_product);
        const imageProduct = await imageProductModel.findOne({ id_product: detail.id_product });

        return {
          ...detail._doc,
          productName: product ? product.name : "Không xác định",
          productPrice: product ? product.price : "Không xác định",
          productImage:
            imageProduct && imageProduct.image.length > 0 ? imageProduct.image[0] : null,
        };
      })
    );

    const productTotal = productOrder.reduce((sum, item) => {
      return sum + item.unit_price * item.quantity;
    }, 0);

    const payment = await paymentMethod.findById(id_payment);
    const paymentName = payment ? payment.name : "Không xác định";

    await sendOrderStatusEmail(
      user.email,
      newOrder._id,
      newOrder.status,
      user.name,
      paymentName,
      productOrder,
      {
        total_price: newOrder.total_price,
        shipping_fee: newOrder.shipping_fee,
        date: newOrder.date,
        time: newOrder.time,
        name: newOrder.name,
        phone: newOrder.phone,
        address: newOrder.address,
        productTotal,
      }
    );

    res.json({
      status: true,
      data: newOrder,
    });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

// Hàm gửi mail khi trạng thái đơn hàng thay đổi
const sendOrderStatusEmail = async (
  email,
  orderID,
  status,
  userName,
  paymentName,
  orderDetails,
  orderInfo
) => {
  const mailOptions = {
    from: "GShop <pn93948848@gmail.com>",
    to: email,
    subject: `Thông báo cập nhật đơn hàng`,
    html: getOrderMail(userName, orderID, status, paymentName, orderDetails, orderInfo),
  };

  await sendMail.transporter.sendMail(mailOptions);
};

// Thay đổi status order
router.put("/update/:id_order", async (req, res, next) => {
  try {
    const { id_order } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    const order = await orderModel.findById(id_order);
    if (!order) {
      return res.json({ status: false, mess: "Đơn hàng không tồn tại" });
    }

    const user = await userModel.findById(order.id_user);
    if (!user || !user.email) {
      return res.json({ status: false, mess: "Không tìm thấy người dùng" });
    }

    const payment = await paymentMethod.findById(order.id_payment);
    const paymentName = payment ? payment.name : "Không xác định";

    const orderDetails = await detailOrderModel.find({ id_order: id_order });
    const productOrder = await Promise.all(
      orderDetails.map(async (detail) => {
        const product = await productModel.findById(detail.id_product);
        const imageProduct = await imageProductModel.findOne({ id_product: detail.id_product });
        return {
          ...detail._doc,
          productName: product ? product.name : "Không xác định",
          productPrice: product ? product.price : "Không xác định",
          productImage:
            imageProduct && imageProduct.image.length > 0 ? imageProduct.image[0] : null,
        };
      })
    );

    const productTotal = productOrder.reduce((sum, item) => {
      return sum + item.unit_price * item.quantity;
    }, 0);

    const updated = await orderModel.findByIdAndUpdate(id_order, { status }, { new: true });

    await sendOrderStatusEmail(
      user.email,
      order._id,
      status,
      user.name,
      paymentName,
      productOrder,
      {
        total_price: order.total_price,
        shipping_fee: order.shipping_fee,
        date: order.date,
        time: order.time,
        name: order.name,
        phone: order.phone,
        address: order.address,
        productTotal,
      }
    );

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

// Hàm định dạng ngày theo dd/mm/yyyy
const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

//* doanh thu 7 ngày trước, 28 ngày trước, 60 ngày trước, 365 ngày trước, từ trước đến nay
router.get("/revenue", async (req, res) => {
  try {
    const today = new Date();
    const todayFormatted = formatDate(today);

    const allCompletedOrders = await orderModel.find({
      status: "Đã giao",
    });

    // Convert định dạng date string sang Date object
    const parseDateString = (dateStr) => {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day); // month trong JS bắt đầu từ 0
    };

    // Tính các mốc thời gian
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const twentyEightDaysAgo = new Date(today);
    twentyEightDaysAgo.setDate(today.getDate() - 28);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const threeSixtyFiveDaysAgo = new Date(today);
    threeSixtyFiveDaysAgo.setDate(today.getDate() - 365);

    // Lọc đơn hàng theo khoảng thời gian
    const toDayOrders = allCompletedOrders.filter((order) => order.date === todayFormatted);

    const last7DaysOrders = allCompletedOrders.filter((order) => {
      const orderDate = parseDateString(order.date);
      return orderDate >= sevenDaysAgo && orderDate <= today;
    });

    const last28DaysOrders = allCompletedOrders.filter((order) => {
      const orderDate = parseDateString(order.date);
      return orderDate >= twentyEightDaysAgo && orderDate <= today;
    });

    const last60DaysOrders = allCompletedOrders.filter((order) => {
      const orderDate = parseDateString(order.date);
      return orderDate >= sixtyDaysAgo && orderDate <= today;
    });

    const last365DaysOrders = allCompletedOrders.filter((order) => {
      const orderDate = parseDateString(order.date);
      return orderDate >= threeSixtyFiveDaysAgo && orderDate <= today;
    });

    // Tính tổng doanh thu cho từng giai đoạn
    const toDayRevenue = toDayOrders.reduce((total, order) => total + order.total_price, 0);
    const last7DaysRevenue = last7DaysOrders.reduce(
      (total, order) => total + order.total_price,
      0
    );
    const last28DaysRevenue = last28DaysOrders.reduce(
      (total, order) => total + order.total_price,
      0
    );
    const last60DaysRevenue = last60DaysOrders.reduce(
      (total, order) => total + order.total_price,
      0
    );
    const last365DaysRevenue = last365DaysOrders.reduce(
      (total, order) => total + order.total_price,
      0
    );
    const totalRevenue = allCompletedOrders.reduce((total, order) => total + order.total_price, 0);

    // Log để debug
    console.log("Orders counts:", {
      today: toDayOrders.length,
      last7Days: last7DaysOrders.length,
      last28Days: last28DaysOrders.length,
      last60Days: last60DaysOrders.length,
      last365Days: last365DaysOrders.length,
      total: allCompletedOrders.length,
    });

    // Tính doanh thu theo ngày trong 7 ngày gần đây
    const dailyRevenueLast7Days = {};
    const last7DaysArray = [];

    for (let i = 0; i < 7; i++) {
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

    // Tính doanh thu theo tháng trong năm hiện tại
    const currentYear = today.getFullYear();
    const monthlyRevenue = {};

    // Khởi tạo doanh thu các tháng bằng 0
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleString("vi-VN", { month: "long" });
      monthlyRevenue[monthName] = 0;
    }

    allCompletedOrders.forEach((order) => {
      const [day, month, year] = order.date.split("/").map(Number);

      if (year === currentYear) {
        const monthName = new Date(year, month - 1, 1).toLocaleString("vi-VN", {
          month: "long",
        });
        monthlyRevenue[monthName] += order.total_price;
      }
    });

    // Trả về kết quả
    return res.json({
      status: true,
      data: {
        toDayRevenue,
        toDayOrders: toDayOrders.length,
        last7DaysRevenue,
        last28DaysRevenue,
        last60DaysRevenue,
        last365DaysRevenue,
        totalRevenue,
        dailyRevenueLast7Days,
        monthlyRevenue,
        totalCompletedOrders: allCompletedOrders.length,
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
router.post("/revenue-daily", async (req, res) => {
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
