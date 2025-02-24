const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const imageProductSchema = new Schema({
  id: { type: ObjectId },
  image: { type: [String], required: true },
  id_product: {
    type: ObjectId,
    ref: "product",
  },
});

const imageimageProduct = mongoose.model("image_product", imageProductSchema);

module.exports = mongoose.models.image_product || imageimageProduct;
