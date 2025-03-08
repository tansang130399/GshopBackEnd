var express = require("express");
const userModel = require("../models/userModel");
var router = express.Router();
const uploadCloud = require("../ultils/upload_avatar");

//* /user

//* Đăng nhập
router.post("/login", async (req, res) => {
  const { email, phone_number, password } = req.body;
  try {
    var checkUser = await userModel.findOne({
      $or: [{ email }, { phone_number }],
      password: password,
      role: { $ne: "admin" },
    });

    if (checkUser) {
      res.status(200).json({
        status: true,
        message: "Đăng nhập thành công",
        data: checkUser,
      });
    } else {
      res.status(400).json({ status: false, message: "Email/SĐT hoặc Mật khẩu sai" });
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ status: false, message: error.message });
  }
});

//* Đăng ký
router.post("/register", async (req, res) => {
  const { email, password, name, phone_number } = req.body;

  try {
    // const existingUser = await userModel.findOne({ email });

    // if (existingUser) {
    //   return res.json({ status: false, message: "User already exists" });
    // }

    // await userModel.create({ email, password, name, phone_number });

    // res.json({ status: true, message: "Registration successful" });

    // Kiểm tra xem email hoặc phone đã tồn tại chưa
    const existingUser = await userModel.findOne({ $or: [{ email }, { phone_number }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email hoặc Số điện thoại đã tồn tại" });
    }

    // Kiểm tra mật khẩu
    const checkPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!checkPassword.test(password)) {
      return res.status(400).json({
        status: false,
        message: "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số",
      });
    }

    // Tạo đối tượng
    const objectUser = { email, password, name, phone_number };
    await userModel.create(objectUser);

    res.status(200).json({ status: true, message: "Đăng ký thành công" });
  } catch (error) {
    console.error(error);
    res.status(404).json({ status: false, message: error.message });
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
  const { email, name, phone_number } = req.body;

  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.json({ status: false, mess: "User không tồn tại" });
    }
    user.name = name || user.name;
    user.phone_number = phone_number || user.phone_number;

    await user.save();

    res.json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});

// Lấy danh sách user theo role nhập vào
router.get("/list_userByRole", async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      res.status(400).json({ status: false, message: "Chưa nhập role" });
    }

    const data = await userModel.find({ role });
    if (data) {
      res.status(200).json({ status: true, data: data });
    } else {
      res.status(400).json({ status: false, message: "Không tìm thấy" });
    }
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Lấy danh sách user theo từng role
// Role Admin
router.get("/list_admin", async (req, res) => {
  try {
    const admin = await userModel.find({ role: "admin" });
    res.status(200).json({ status: true, data: admin });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Role Staff
router.get("/list_staff", async (req, res) => {
  try {
    const staff = await userModel.find({ role: "staff" });
    res.status(200).json({ status: true, data: staff });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Role User
router.get("/list_user", async (req, res) => {
  try {
    const user = await userModel.find({ role: "user" });
    res.status(200).json({ status: true, data: user });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

// Đổi mật khẩu
router.put("/changPass", async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    // Kiểm tra user có tồn tại không
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu nhập lại có khớp không
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ status: false, message: "Mật khẩu mới nhập lại không khớp" });
    }

    // Cập nhật lại mật khẩu user
    await userModel.findByIdAndUpdate(userId, { password: newPassword });
    return res.status(200).json({ status: true, message: "Đổi mật khẩu thành công" });
  } catch (e) {
    return res.status(404).json({ status: false, message: "Đổi mật khẩu thất bại" });
  }
});

// Lấy thông tin chi tiết của user
router.get("/detail_user", async (req, res) => {
  try {
    const { _id } = req.query;
    const detail = await userModel.findOne({ _id: _id });
    res.status(200).json({ status: true, data: detail });
  } catch (e) {
    res.status(404).json({ status: false, message: e });
  }
});

//* tạo avatar user
router.post("/create-avatar/:id_user", [uploadCloud.single("image")], async (req, res) => {
  try {
    const { id_user } = req.params;
    const { file } = req;

    //kiểm tra
    if (!file || file.length === 0) {
      return res.json({ status: false, message: "Vui lòng chọn ít nhất một ảnh" });
    }

    const user = await userModel.findById(id_user);
    if (!user) {
      return res.json({ status: false, message: "User không tồn tại" });
    }

    user.avatar = file.path;

    await user.save();
    return res.json({ status: true, data: user });
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
});

//* xóa avatar user
router.delete("/delete-avatar/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;

    const updatedUser = await userModel.findByIdAndUpdate(
      id_user,
      { avatar: "url" },
      { new: true }
    );

    if (!updatedUser) {
      return res.json({ status: false, message: "User không tồn tại" });
    }

    res.json({ status: true, data: updatedUser });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* tạo nhân viên
router.post("/create-staff", async (req, res) => {
  try {
    const { email, password, name, phone_number } = req.body;

    // Kiểm tra mật khẩu
    const checkPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!checkPassword.test(password)) {
      return res.json({
        status: false,
        message: "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số",
      });
    }

    let user = await userModel.findOne({ email });

    if (user) {
      user.role = "staff";
      await user.save();
    } else {
      user = new userModel({ email, password, name, phone_number, role: "staff" });
      await user.save();
    }

    res.json({ status: true, data: user });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
});

//* Xóa nhân viên
router.put("/update-staff/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;

    const user = await userModel.findByIdAndUpdate(id_user, { role: "user" }, { new: true });
    if (!user) {
      return res.json({ status: false, mess: "User không tồn tại" });
    }
    await user.save();

    res.json({ status: true, data: user });
  } catch (error) {
    console.error(error);
    res.json({ status: false, message: error.message });
  }
});

module.exports = router;
