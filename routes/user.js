var express = require("express");
const userModel = require("../models/userModel");
var router = express.Router();

//* /user

//* Đăng nhập
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ status: false, message: "User not found!" });
    }

    if (password != user.password) {
      return res.json({ status: false, message: "Invalid credentials!" });
    }

    res.json({ status: true, message: "Login successful!" });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});

//* Đăng ký
router.post("/register", async (req, res) => {
  const { email, password, fullName, phoneNumber } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ status: false, message: "User already exists!" });
    }

    await userModel.create({ email, password, fullName, phoneNumber });

    res.json({ status: true, message: "Registration successful!" });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});

//* lấy danh sách user theo id
router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userModel.findById(id);

    if (!user) {
      return res.json({ status: false, message: "User not found!" });
    }

    res.json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});

//* lấy danh sách tất cả user
router.get("/list", async (req, res, next) => {
  try {
    var data = await userModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách user" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Cập nhật user
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { email, fullName, phoneNumber, password } = req.body;

  try {
    const user = await userModel.findById(id);

    user.email = email || user.email;
    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.password = password || user.password;

    await user.save();

    res.json({ status: true, message: "User updated successfully!" });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});

module.exports = router;
