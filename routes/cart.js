const express = require("express");
const router = express.Router();
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

//* /cart

//* Thêm sản phẩm vào giỏ hàng
router.post("/add", async (req, res) => {
  try {
    const { id_user, id_product, quantity } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(id_product);
    if (!product) {
      return res.json({ status: false, message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra số lượng tồn kho
    if (quantity > product.quantity) {
      return res.json({ status: false, message: `Chỉ còn ${product.quantity} sản phẩm trong kho` });
    }

    let cart = await Cart.findOne({ id_user });

    if (!cart) {
      cart = new Cart({ id_user, items: [] });
    }

    const existingItem = cart.items.find((item) => item.id_product.equals(id_product));

    if (existingItem) {
      // Kiểm tra tổng số lượng có vượt kho không
      if (existingItem.quantity + quantity > product.quantity) {
        return res.json({
          status: false,
          message: `Bạn chỉ có thể thêm tối đa ${product.quantity - existingItem.quantity} sản phẩm nữa`,
        });
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ id_product, quantity, price: product.price });
    }

    await cart.save();
    res.json({ status: true, data: cart });
  } catch (error) {
    res.json({ status: false, error: error.message });
  }
});

//*  Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/update", async (req, res) => {
  try {
    const { id_user, id_product, quantity } = req.body;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(id_product);
    if (!product) {
      return res.json({ status: false, message: "Sản phẩm không tồn tại" });
    }

    // Kiểm tra số lượng tồn kho
    if (quantity > product.quantity) {
      return res.json({ status: false, message: `Chỉ còn ${product.quantity} sản phẩm trong kho` });
    }

    let cart = await Cart.findOne({ id_user });
    if (!cart) {
      return res.json({ status: false, message: "Giỏ hàng không tồn tại" });
    }

    const item = cart.items.find((item) => item.id_product.equals(id_product));
    if (!item) {
      return res.json({ status: false, message: "Sản phẩm không có trong giỏ hàng" });
    }

    item.quantity = quantity;
    await cart.save();
    res.json({ status: true, data: cart });
  } catch (error) {
    res.json({ status: false, error: error.message });
  }
});

//* Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove", async (req, res) => {
  try {
    const { id_user, id_product } = req.body;

    let cart = await Cart.findOne({ id_user });
    if (!cart) {
      return res.json({ status: false, message: "Giỏ hàng không tồn tại" });
    }

    cart.items = cart.items.filter((item) => !item.id_product.equals(id_product));

    await cart.save();
    res.json({ status: true, data: cart });
  } catch (error) {
    res.json({ status: false, error: error.message });
  }
});

//* Lấy giỏ hàng của user
router.get("/:id_user", async (req, res) => {
  try {
    const { id_user } = req.params;

    const cart = await Cart.findOne({ id_user }).populate("items.id_product", "name quantity price isActive");
    if (!cart) {
      return res.json({ status: false, message: "Giỏ hàng trống" });
    }
    /*
    // Kiểm tra trạng thái sản phẩm và cập nhật vào giỏ hàng
    cart.items = cart.items.map((item) => {
      const product = item.id_product;
      if (!product) {
        return { ...item._doc, status: "Sản phẩm không tồn tại" };
      }

      if (!product.isActive) {
        return { ...item._doc, status: "Ngừng kinh doanh" };
      }

      if (product.quantity === 0) {
        return { ...item._doc, status: "Hết hàng" };
      }

      if (product.quantity < item.quantity) {
        return {
          ...item._doc,
          status: `Chỉ còn ${product.quantity} sản phẩm trong kho`,
        };
      }

      return { ...item._doc, status: "Còn hàng" };
    });
*/
    res.json({ status: true, data: cart });
  } catch (error) {
    res.json({ status: false, error: error.message });
  }
});

module.exports = router;
