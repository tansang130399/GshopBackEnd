const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const AddressDeliverySchema = new Schema({
  id: {
    type: ObjectId,
  },
  detail: {
    type: String,
    required: true,
    trim: true,
  },
  commune: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  province: {
    type: String,
    required: true,
    trim: true,
  },
  id_user: {
    type: ObjectId,
    ref: "user",
  },
  selected: {
    type: Boolean,
    defaul: false,
  },
});

module.exports =
  mongoose.models.address_delivery || mongoose.model("address_delivery", AddressDeliverySchema);
