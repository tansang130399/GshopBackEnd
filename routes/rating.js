var express = require("express");
const ratingModel = require("../models/ratingModel");

var router = express.Router();

//* /rating
//* lấy danh sách tất cả
router.get("/list", async (req, res, next) => {
  try {
    var data = await ratingModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});
module.exports = router;
