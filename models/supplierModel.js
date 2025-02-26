const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const supplierSchema = new Schema({
  id: { type: ObjectId },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  representative: {
    type: String,
    required: true,
    trim: true,
  },
  cooperation_date: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

module.exports =
  mongoose.models.supplier || mongoose.model("supplier", supplierSchema);
