var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors"); // Cài đặt thư viện cors: npm install cors

// Cấu hình CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Cho phép yêu cầu từ origin này
    methods: ["GET", "POST", "PUT", "DELETE"], // Các phương thức được phép
    credentials: true, // Cho phép gửi cookie hoặc header xác thực
  })
);

//*config mongoose
const mongoose = require("mongoose");
require("./models/userModel");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/user");
var addressRouter = require("./routes/address");
var newsRouter = require("./routes/news");
var categoryRouter = require("./routes/category");
var supplierRouter = require("./routes/supplier");
var productRouter = require("./routes/product");
var imageProductRouter = require("./routes/image_product");
var orderRouter = require("./routes/order");
var paymentMethodRouter = require("./routes/payment");
var detailOrderRouter = require("./routes/detail_order");
var ratingRouter = require("./routes/rating");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//*connect database
mongoose
  .connect(
    "mongodb+srv://ASM:V26pueztMVK6ZqUS@cluster0.7d9pi.mongodb.net/GShop"
  )
  .then(() => console.log(">>>>>>>>>> DB Connected!!!!!!"))
  .catch((err) => console.log(">>>>>>>>> DB Error: ", err));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/address", addressRouter);
app.use("/news", newsRouter);
app.use("/category", categoryRouter);
app.use("/supplier", supplierRouter);
app.use("/product", productRouter);
app.use("/image_product", imageProductRouter);
app.use("/order", orderRouter);
app.use("/payment_method", paymentMethodRouter);
app.use("/detail_order", detailOrderRouter);
app.use("/rating", ratingRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
