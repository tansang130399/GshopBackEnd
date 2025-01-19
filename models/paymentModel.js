const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const paymentSchema = new Schema({
  id: { type: ObjectId, required: true },
  image: { type: String, required: true },
  name: { type: String, required: true },
});

const Payment = mongoose.model("payment_method", paymentSchema);

module.exports = mongoose.models.payment_method || Payment;
