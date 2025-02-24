const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const categorySchema = new Schema({
  id: { type: ObjectId },
  name_type: {
    type: String,
    unique: true,
  },
});

const Cate = mongoose.model("category", categorySchema);

module.exports = mongoose.models.category || Cate;
