const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSchema = new Schema({
  id: { type: ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  viewer: { type: Number, default: 0 },
  description: { type: String, default: "" },
  id_category: {
    type: ObjectId,
    ref: "category",
  },
  id_supplier: {
    type: ObjectId,
    ref: "supplier",
  },
  isActive: { type: Boolean, default: true },
  status: { type: String, required: true },
});

// Middleware cập nhật status trước khi lưu sản phẩm mới
productSchema.pre("save", function (next) {
  this.status = getStatus(this);
  next();
});

// Middleware cập nhật status trước khi update
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.quantity !== undefined || update.isActive !== undefined) {
    update.status = getStatus(update);
  }
  next();
});

// Hàm xác định trạng thái của sản phẩm
function getStatus(product) {
  if (!product.isActive) return "Ngừng kinh doanh";
  if (product.quantity === 0) return "Hết hàng";
  return product.quantity <= 10
   ? `Chỉ còn ${product.quantity} bộ`
   : `Còn ${product.quantity} bộ`
}

const Product = mongoose.model("product", productSchema);
module.exports = mongoose.models.product || Product;
