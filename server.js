const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

const users = {};

app.use(express.static(path.join(__dirname + "/public")));

app.get("/users", (_, res) => {
  res.send(Object.values(users));
});

io.on("connection", function (socket) {
  // console.log("connected", socket.id);
  socket.on("newuser", (user) => {
    user = { name: user };
    console.log("kas cia", user.name);
    users[socket.id] = { ...user, id: socket.id };
    console.log("connected-user", users, "------", users[socket.id].name);
    socket.broadcast.emit("users-changed", Object.values(users));
  });
  socket.on("disconnect", () => {
    delete users[socket.id];
    socket.broadcast.emit("users-changed", Object.values(users));
  });

  socket.on("exituser", function (username) {
    socket.broadcast.emit("update", username + " left the conversation");
  });
  //bendram chatui
  // socket.on("chat", function (message) {
  //   socket.broadcast.emit("chat", message);
  // });
  //vienam konkreciam useriui

  socket.on("chat-message", (message) => {
    console.log("kas", message);
    socket.to(message.recipientId).emit(
      "chat-message",

      {
        user: message.name,
        text: message.text,
        senderId: socket.id,
      }
    );
  });
});

server.listen(3000);
