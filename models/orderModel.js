const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderSchema = new Schema({
  id: { type: ObjectId },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString("en-GB"),
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
  id_address: {
    type: ObjectId,
    ref: "address_delivery",
    required: true,
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
