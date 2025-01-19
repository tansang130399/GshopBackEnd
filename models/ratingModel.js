const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ratingSchema = new Schema({
  id: { type: ObjectId, required: true },
  star: { type: Number, required: true, min: 1, max: 5 },
  date: { type: String },
  content: { type: String, required: false },
  id_user: {
    type: ObjectId,
    ref: "user",
  },
  id_product: {
    type: ObjectId,
    ref: "product",
  },
});

const Rating = mongoose.model("rating", ratingSchema);

module.exports = mongoose.models.rating || Rating;
