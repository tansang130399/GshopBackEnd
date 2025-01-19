const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const detailOrderSchema = new Schema({
  id: { type: ObjectId, required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  id_order: {
    type: ObjectId,
    ref: "order",
    required: true,
  },
  id_product: {
    type: ObjectId,
    ref: "product",
    required: true,
  },
});

const DetailOrder = mongoose.model("detail_order", detailOrderSchema);

module.exports = mongoose.models.detail_order || DetailOrder;
