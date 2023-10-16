const log = console.log;

const express = require("express");
const { createServer, get } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);
var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

//////////////////////////// SOCKET /////////////////////////
const connectedSockets = {};

function getConnectedSockets() {
  return Object.entries(connectedSockets);
}

function getConnectedUsers() {
  const socketList = getConnectedSockets();
  const userList = socketList.map((double) => {
    return {
      id: double[0],
      username: double[1].username,
    }
  });
  return userList;
}

function changeConnections(socket, io) {
  // socket.broadcast.emit('refresh-users-list', getConnectedUsers());
  // socket.emit('refresh-users-list', getConnectedUsers());
  io.emit('refresh-users-list', getConnectedUsers());
}

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.username = 'Anonymous';
  connectedSockets[socket.id] = socket;
  changeConnections(socket, io);

  

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete connectedSockets[socket.id];
    changeConnections(socket, io);
  });
  //   socket.on("massage", (msg) => {
  //     log(msg);

  //     socket.emit("data", "+++++++++++good+++++++++");
  //   });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
