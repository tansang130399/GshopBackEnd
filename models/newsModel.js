const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const newsSchema = new Schema({
  id: {
    type: ObjectId,
    required: true,
  },
  thumbnails: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  id_user: {
    type: ObjectId,
    ref: "user",
  },
});

const News = mongoose.model("news", newsSchema);

module.exports = mongoose.models.news || News;
