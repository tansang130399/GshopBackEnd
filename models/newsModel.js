const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const newsSchema = new Schema({
  id: {
    type: ObjectId,
  },

  images: {
    type: [String],
    default: [],
    required: true,
  },

  title: {
    type: String,
    required: true,
    default: "",
  },

  content: {
    type: String,
    required: true,
    default: "",
  },

  date: {
    type: String,
    default: () => new Date().toLocaleDateString("en-GB"),
  },

  id_user: {
    type: ObjectId,
    ref: "user",
    required: true,
  },
});

const News = mongoose.model("news", newsSchema);
module.exports = mongoose.models.news || News;
