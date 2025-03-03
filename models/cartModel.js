const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const cartSchema = new Schema({
  id: {
    type: ObjectId,
  },
  id_user: { type: ObjectId, ref: "user", required: true },
  items: [
    {
      id_product: { type: ObjectId, ref: "product", required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true },
      selected: { type: Boolean, default: false },
    },
  ],
  totalPrice: { type: Number, default: 0 },
});

// Middleware tự động cập nhật totalPrice trước khi lưu
cartSchema.pre("save", function (next) {
  this.totalPrice = this.items.reduce((sum, item) => {
    return item.selected ? sum + item.quantity * item.price : sum;
  }, 0);
  next();
});

const Cart = mongoose.model("cart", cartSchema);
module.exports = mongoose.models.cart || Cart;
