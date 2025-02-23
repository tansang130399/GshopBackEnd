var express = require("express");
const productModel = require("../models/productModel");
var router = express.Router();

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

//* /product

//* lấy danh sách sản phẩm
router.get("/list", async (req, res, next) => {
  try {
    var data = await productModel.find();
    if (data) {
      res.json({ status: true, data: data });
    } else {
      res.json({ status: false, mess: "Không có danh sách" });
    }
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* lấy sản phẩm theo danh mục
router.get("/list-by-category/:id_category", async (req, res, next) => {
  try {
    const { id_category } = req.params;

    const products = await productModel.find({
      id_category: id_category,
    });

    if (products.length === 0) {
      return res.json({ status: false, mess: id_category });
    }

    res.json({ status: true, data: products });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Lấy sản phẩm theo ID
router.get("/detail/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ status: false, mess: "Sản phẩm không tồn tại" });
    }
    res.json({ status: true, data: product });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Thêm sản phẩm
router.post("/create", async (req, res, next) => {
  try {
    const {
      name,
      price,
      quantity,
      description,
      id_category,
      id_supplier,
      status,
    } = req.body;

    if (
      !name ||
      !price ||
      !quantity ||
      !id_category ||
      !id_supplier ||
      !status
    ) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    if (price <= 0 || quantity <= 0) {
      return res.json({ status: false, mess: "Sai định dạng" });
    }

    const newProduct = new productModel({
      name,
      price,
      quantity,
      description,
      id_category,
      id_supplier,
      status,
    });

    const savedProduct = await newProduct.save();

    res.json({ status: true, data: savedProduct });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Cập nhật sản phẩm
router.put("/update/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      quantity,
      description,
      id_category,
      id_supplier,
      status,
    } = req.body;

    if (
      !name ||
      !price ||
      !quantity ||
      !id_category ||
      !id_supplier ||
      !status
    ) {
      return res.json({ status: false, mess: "Thiếu dữ liệu đầu vào" });
    }

    if (price <= 0 || quantity <= 0) {
      return res.json({ status: false, mess: "Sai định dạng" });
    }
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { name, price, quantity, description, id_category, id_supplier, status },
      { new: true }
    );

    // Kiểm tra xem sản phẩm có tồn tại không
    if (!updatedProduct) {
      return res.json({ status: false, mess: "Không tìm thấy sản phẩm" });
    }

    res.json({ status: true, data: updatedProduct });
  } catch (error) {
    res.json({ status: false, mess: error.message });
  }
});

//* Cập nhật view của sản phẩm
router.put("/update_view", async (req, res) => {
  try {
    const { id } = req.query;

    // Tìm và tăng giá trị viewer lên 1
    const product = await productModel.findByIdAndUpdate(
      id,
      { $inc: { viewer: 1 } }, // Tăng viewer lên 1 mỗi lần gọi API
      { new: true }
    );

    if (!product) {
      return res.status(400).json({ status: false, message: 'Sản phẩm không tồn tại' });
    }

    res.status(200).json({ status: true, message: 'Lượt xem đã được cập nhật', product });
  } catch (e) {
    res.status(404).json({ status: false, message: 'Lỗi cập nhật lượt xem' });
  }
});

//* Cập nhật status và isActive của sản phẩm (để test kiểm thử)
router.put("/update_status", async (req, res) => {
  try {
    const {id} = req.query;
    const {isActive, quantity} = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await productModel.findById(id);
    if(!product){
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    // Cập nhật thông tin sản phẩm
    if(isActive !== undefined) product.isActive = isActive;
    if(quantity !== undefined) product.quantity = quantity;
    product.status = getStatus(product);

    // Lưu sản phẩm
    await product.save
    res.status(200).json({ status: true, message: 'Cập nhật thành công', data: product })
  } catch (e) {
    res.status(404).json({ status: false, message: 'Cập nhật thất bại' })
  }
});

// Hàm xác định trạng thái của sản phẩm
function getStatus(product) {
  if (!product.isActive) return "Ngừng kinh doanh";
  if (product.quantity === 0) return "Hết hàng";
  return product.quantity <= 10
    ? `Chỉ còn ${product.quantity} bộ`
    : `Còn ${product.quantity} bộ`;
}

module.exports = router;
