// const mongoose = require("mongoose");
// const Product = require("./models/productModel"); // Đường dẫn tới model sản phẩm

// // Hàm xác định trạng thái của sản phẩm
// function getStatus(product) {
//     if (!product.isActive) return "Ngừng kinh doanh"; // Nếu không hoạt động, ngừng kinh doanh
//     if (product.quantity === 0) return "Hết hàng"; // Hết hàng nhưng vẫn đang kinh doanh
//     return product.quantity <= 10
//         ? `Chỉ còn ${product.quantity} bộ`
//         : `Còn ${product.quantity} bộ`;
// }

// // Kết nối MongoDB và cập nhật sản phẩm
// async function updateAllProducts() {
//     try {
//         await mongoose.connect("mongodb+srv://ASM:V26pueztMVK6ZqUS@cluster0.7d9pi.mongodb.net/GShop", {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });

//         console.log("🔗 Kết nối thành công với MongoDB");

//         // Lấy tất cả sản phẩm
//         const products = await Product.find({});

//         // Duyệt qua từng sản phẩm và cập nhật
//         for (let product of products) {
//             let newStatus = getStatus(product);

//             // Cập nhật trạng thái nếu có thay đổi
//             if (product.status !== newStatus) {
//                 await Product.updateOne({ _id: product._id }, { $set: { status: newStatus } });
//                 console.log(`🔄 Đã cập nhật sản phẩm ID: ${product._id} -> ${newStatus}`);
//             }
//         }

//         console.log("✅ Cập nhật trạng thái sản phẩm thành công!");
//     } catch (error) {
//         console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
//     } finally {
//         mongoose.disconnect();
//     }
// }

// // Chạy script cập nhật
// updateAllProducts();