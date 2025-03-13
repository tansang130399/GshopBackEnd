const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("requestNotification", () => {
    io.emit("pushNotification", {
      title: "Tiêu đề thông báo",
      message: "Nội dung thông báo từ backend",
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
