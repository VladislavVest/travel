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
let players = [];
let gameInfo = { playerPointer: 0, isGameStarted: false };
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
let reloadFrontFlag = false;
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.username = 'Anonymous';
  connectedSockets[socket.id] = socket;
  changeConnections(socket, io);
  setTimeout(() => {
    if (!reloadFrontFlag) {
      io.emit('force-front-restart');
      reloadFrontFlag = true;
    };
  }, 2000);


  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete connectedSockets[socket.id];
    changeConnections(socket, io);
  });

  socket.on("set-username", (username) => {
    log(username);
    socket.username = username;
    changeConnections(socket, io);
    // socket.emit("data", "+++++++++++good+++++++++");
  });
  socket.on('chat-message', (message) => {
    log('vot ono', message);
    io.emit('new-all-message', { text: message, username: socket.username });
  });
  socket.on('start-game-signal', (username) => {
    players = getConnectedSockets();
    gameInfo.isGameStarted = true;
    //open step for first user
    const playerId = players[gameInfo.playerPointer][0];
    const playerSocket = players[gameInfo.playerPointer][1];
    socket.emit('open-step', gameInfo);
    //start game for all users
    io.emit('game-activation', gameInfo)
  });


});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
