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
    players: {},
    playerPointer: 0,
    isGameStarted: false,
    currentUserId: null,
    connectedUsers: [],
    connectedPlayers: [],
    winners: [],
    bombs: [],
    fighting: {
      isActive: false,
      activPlayer: {
        id: '', //id тот кто вызвал на бой
        hitPoints: 30
      },

      passivPlayer: {
        id: '', //id тот кого вы..и
        hitPoints: 30
      }

    }
  }
};

function allDead(){log('All Dead')};

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
    const socketId = double[0];
    const socket = double[1];
    return {
      id: socketId,
      username: socket.username,
      position: socket.position,
      dead: socket.dead
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
    delete connectedSockets[socket.id];
    changeConnections(socket, io);
  });

  socket.on("set-username", (username) => {
    socket.username = username;
    changeConnections(socket, io);
    // socket.emit("data", "+++++++++++good+++++++++");
  });

  socket.on('chat-message', (message) => {
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
    let playerSocket = {};
    let condom = 0;
    do {
      playerSocket = players[gameInfo.playerPointer][1];
      gameInfo.playerPointer++;
      condom++;
      if (condom > 100) return allDead()
      if (gameInfo.playerPointer > players.length - 1) gameInfo.playerPointer = 0;
    } while (playerSocket.dead == false);
    log(gameInfo.playerPointer, 'gameinfoplayerpoinerrr');
    log(players.length);
    const playerId = players[gameInfo.playerPointer][0];
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

  socket.on('bomb-was-exploded', (user) => {
    log('12.12. before', gameInfo.bombs);
    const exploadedBombs = gameInfo.bombs = gameInfo.bombs.filter((b) => {
      return b.position == user.position;
    });
    gameInfo.bombs = gameInfo.bombs.filter((b) => {
      return b.position != user.position;
    });
    log('12.12.after', gameInfo.bombs);
    io.emit('refresh-game-state', gameInfo);
    io.emit('bomb-exploaded-for-all', { exploadedBombs, user });

    exploadedBombs.forEach((b) => {
      const message = `У игрока ${socket.username} есть пробитие, негативный эффект: ${b.bomb.title}`;
      io.emit('new-all-message', { text: message, username: 'Dungeon Master:', style: 'master-message' });
    })
  });

  socket.on('fighting-start', ({ activPlayer, passivPlayer }) => {
    gameInfo.fighting.isActive = true;
    gameInfo.fighting.activPlayer.id = activPlayer;
    gameInfo.fighting.passivPlayer.id = passivPlayer;
    io.emit('open-arena', gameInfo);
  });

  socket.on('fighting-strike', (fightingData) => {
    log(fightingData);
  });
  socket.on('action-result', (user) => {
    // gameInfo.players[socket.id] = user;
    if (user.hitPoints < 1) { //.......................................................................................GAME OVER
      socket.emit('game-over');
      // gameInfo.connectedPlayers = gameInfo.connectedPlayers.filter(p => p.id != socket.id);
      io.emit('refresh-game-state', gameInfo);
      socket.dead = true;

    }
  });

});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});

