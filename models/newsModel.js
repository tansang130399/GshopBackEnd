const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const newsSchema = new Schema({
  id: {
    type: ObjectId,
    required: true,
  },

  images: {
    type: [String],
    default: "Unknown"
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
    default: () => new Date().toLocaleDateString("en-GB")
  },

  id_user: {
    type: ObjectId,
    ref: "user",
    default: "Unknow"
  },
});

const News = mongoose.model("news", newsSchema);
module.exports = mongoose.models.news || News;
