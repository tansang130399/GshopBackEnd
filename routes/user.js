var express = require("express");
const userModel = require("../models/userModel");
var router = express.Router();

//* /user

//* Đăng nhập
router.post("/login", async (req, res) => {
  const { email, phone_number, password } = req.body;
  try {
    // const user = await userModel.findOne({ email, phone_number });

    var checkUser = await userModel.findOne({
      $or: [{ email }, { phone_number }],
      password: password
    })

    if (checkUser) {
      res.status(200).json({
        status: true,
        message: 'Đăng nhập thành công',
        data: checkUser
      })
    } else {
      res.status(400).json({ status: false, message: 'Email/SĐT hoặc Mật khẩu sai' })
    }

    // if (!checkUser) {
    //   return res.json({ status: false, message: "User not found" });
    // }

    // if (password != checkUser.password) {
    //   return res.json({ status: false, message: "Invalid credentials" });
    // }

    //res.json({ status: true, data: checkUser });
  } catch (error) {
    console.error(error);
    res.status(404).json({ status: false, message: error.message });
  }
});

//* Đăng ký
router.post("/register", async (req, res) => {
  const { email, password, fullName, phoneNumber } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ status: false, message: "User already exists" });
    }

    await userModel.create({ email, password, fullName, phoneNumber });

    res.json({ status: true, message: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});

//* lấy user theo email
router.get("/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const user = await userModel.find({ email: email });

    if (!user) {
      return res.json({ status: false, message: "User not found" });
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
router.put("/update", async (req, res) => {
  const { email, fullName, phoneNumber, password } = req.body;

  try {
    const user = await userModel.find({ email: email });

    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.password = password || user.password;

    await user.save();

    res.json({ status: true, message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});


// Lấy danh sách user theo staff
router.get("/list_staff", async (req, res, next) => {
  try {
    const { role } = req.query; // Lấy role từ query params
    
    let filter = {};
    if (role) {
      filter.role = role; // Lọc user theo role nếu có
    }
    
    const data = await userModel.find(filter);
    
    if (data.length > 0) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách user phù hợp" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

module.exports = router;
