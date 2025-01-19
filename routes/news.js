var express = require("express");
const newsModel = require("../models/newsModel");
var router = express.Router();

//* /news
//* lấy danh sách tất cả
router.get("/list", async (req, res, next) => {
  try {
    var data = await newsModel.find();
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
