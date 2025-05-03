const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderSchema = new Schema({
  id: { type: ObjectId },
  date: {
    type: String,
    // default: () => new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
    default: () => new Date().toLocaleDateString("en-GB"),
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString("vi-VN", { hour12: false }),
  },
  total_price: { type: Number, required: true },
  shipping_fee: { type: Number, default: 29000 },
  status: { type: String, default: "Đang xử lý" },
  id_user: {
    type: ObjectId,
    ref: "user",
    required: true,
  },
  id_payment: {
    type: ObjectId,
    ref: "payment_method",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  staff_mail: {
    type: String,
    unique: true,
    default: "",
  },
});

// Middleware: Cộng shipping_fee vào total_price trước khi lưu
orderSchema.pre("save", function (next) {
  if (this.isModified("total_price") || this.isNew) {
    this.total_price += this.shipping_fee;
  }
  next();
});
const Order = mongoose.model("order", orderSchema);

module.exports = mongoose.models.oder || Order;
