const userModel = require("../models/userModel");
const paymentMethod = require("../models/paymentModel");
const productModel = require("../models/productModel");
const imageProductModel = require("../models/imageProductModel");
const sendMail = require("../utils/configMail");
const getOrderMail = require("../emailTemplates/getOrderMail");

const sendOrderCreatedEmail = async (order, selectedItems) => {
  const user = await userModel.findById(order.id_user);
  if (!user || !user.email) return;

  const payment = await paymentMethod.findById(order.id_payment);
  const paymentName = payment ? payment.name : "Không xác định";

  const productOrder = await Promise.all(selectedItems.map(async (item) => {
    const product = await productModel.findById(item.id_product);
    const imageProduct = await imageProductModel.findOne({ id_product: item.id_product });
    return {
      ...item,
      unit_price: item.price,
      productName: product ? product.name : "Không xác định",
      productImage: imageProduct?.image?.[0] || null
    };
  }));

  const productTotal = productOrder.reduce((sum, item) => {
    return sum + item.unit_price * item.quantity;
  }, 0);

  const shippingFee = 15000; // fix cứng hoặc lấy từ order nếu đã có
  const finalPrice = productTotal + shippingFee;

  const now = new Date();
  const orderDate = now.toLocaleDateString("vi-VN");
  const orderTime = now.toLocaleTimeString("vi-VN");

  const mailOptions = {
    from: "GShop <pn93948848@gmail.com>",
    to: user.email,
    subject: "Đơn hàng của bạn đã được tạo thành công",
    html: getOrderMail(
      user.name,
      order._id,
      "Đã xác nhận",
      paymentName,
      productOrder,
      {
        total_price: finalPrice,
        shipping_fee: shippingFee,
        date: orderDate,
        time: orderTime,
        name: order.name,
        phone: order.phone,
        address: order.address,
        productTotal
      }
    )
  };

  await sendMail.transporter.sendMail(mailOptions);
};

module.exports = sendOrderCreatedEmail;
