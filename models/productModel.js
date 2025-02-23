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
  status: { type: String, required: true },
});

const Product = mongoose.model("product", productSchema);

module.exports = mongoose.models.product || Product;
