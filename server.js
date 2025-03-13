const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Cho phép mọi nguồn kết nối
  },
});

app.use(cors());

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Giả lập gửi thông báo từ server sau 5 giây
  setTimeout(() => {
    socket.emit("pushNotification", {
      title: "Thông báo từ server",
      message: "Bạn vừa nhận một thông báo mới!",
    });
  }, 5000);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
