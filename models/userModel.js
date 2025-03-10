const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
  id: {
    type: ObjectId,
  },
  avatar: {
    type: String,
    default: "url",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
  code: {
    type: Number,
    default: 1,
  },
});

const User = mongoose.model("user", userSchema);

module.exports = mongoose.models.user || User;
