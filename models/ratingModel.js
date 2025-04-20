const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ratingSchema = new Schema({
  id: { type: ObjectId },
  star: { type: Number, required: true, min: 1, max: 5 },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString("en-GB"),
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString("vi-VN", { hour12: false }),
  },
  content: { type: String, required: true },
  images: {
    type: [String],
    default: [],
    required: true,
  },
  id_user: {
    type: ObjectId,
    ref: "user",
  },
  id_product: {
    type: ObjectId,
    ref: "product",
  },
  id_order: {
    type: ObjectId,
    ref: "order"
  }
});

const Rating = mongoose.model("rating", ratingSchema);
module.exports = mongoose.models.rating || Rating;
