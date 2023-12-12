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
let winners = [];
let gameInfo = getInitialGameInfo();

function getInitialGameInfo() {
  return {
    playerPointer: 0,
    isGameStarted: false,
    currentUserId: null,
    connectedUsers: [],
    connectedPlayers: [],
    winners: [],
    bombs: []
  }
};


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

function getConnectedPlayers() {
  const socketList = players;
  const userList = socketList.map((double) => {
    return {
      id: double[0],
      username: double[1].username,
      position: double[1].position
    }
  });
  return userList;
}


function getWinners() {
  const socketList = winners;
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
  io.emit('refresh-game-state', gameInfo);
}
let reloadFrontFlag = false;

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.username = 'Anonymous';
  socket.position = 0;
  gameInfo.connectedUsers = getConnectedUsers();
  connectedSockets[socket.id] = socket;
  socket.emit('your-id', socket.id);
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
    if (gameInfo.isGameStarted) return;
    players = getConnectedSockets();
    gameInfo.isGameStarted = true;
    gameInfo.connectedUsers = getConnectedUsers();
    gameInfo.connectedPlayers = getConnectedPlayers();
    //open step for first user
    const playerId = players[gameInfo.playerPointer][0];
    const playerSocket = players[gameInfo.playerPointer][1];
    gameInfo.currentUserId = playerId;
    socket.emit('open-step', gameInfo);
    //start game for all users
    io.emit('game-activation', gameInfo)
  });

  socket.on('skip-step', () => {
    log('skip-step');
    gameInfo.playerPointer++;
    if (gameInfo.playerPointer > players.length - 1) gameInfo.playerPointer = 0;
    log(gameInfo.playerPointer, 'gameinfoplayerpoinerrr');
    log(players.length);
    const playerId = players[gameInfo.playerPointer][0];
    const playerSocket = players[gameInfo.playerPointer][1];
    gameInfo.currentUserId = playerId;
    playerSocket.emit('open-step', gameInfo);
    io.emit('refresh-game-state', gameInfo);
  });

  socket.on('reset', () => {
    io.emit('force-front-restart');
    gameInfo = getInitialGameInfo();
  });

  socket.on('new-user-position', (position) => {
    socket.position = position;
    gameInfo.connectedUsers = getConnectedUsers();
    gameInfo.connectedPlayers = getConnectedPlayers();
    io.emit('refresh-game-state', gameInfo);
  });

  socket.on('rolling', () => {
    io.emit('rolling-all');

  });
  socket.on('rolling-result', (number) => {
    io.emit('rolling-result-all', number);
  });
  socket.on('winner', (user) => {
    log('winner!!!');
    winners.push([socket.id, socket]);
    players = players.filter((p) => {
      log(p[0], 'PE IDDD');
      log(socket.id, 'SOCKET IDDD');
      return p[0] !== socket.id;
    })
    log(players.length);
    gameInfo.connectedUsers = getConnectedUsers();
    gameInfo.connectedPlayers = getConnectedPlayers();
    gameInfo.winners = getWinners();
    io.emit('refresh-game-state', gameInfo);
  })
  socket.on('set-bomb-on-cell', (bomb) => {
    bomb.position = socket.position;
    gameInfo.bombs.push(bomb);
    log(bomb);
    io.emit('refresh-game-state', gameInfo);
  });
  socket.on('bomb-was-exploded', (position)=>{
    log('12.12. before', gameInfo.bombs);
    gameInfo.bombs = gameInfo.bombs.filter((b) => {
      return b.position != position;
    });
    log('12.12.after', gameInfo.bombs);
    io.emit('refresh-game-state', gameInfo);
  });


});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

