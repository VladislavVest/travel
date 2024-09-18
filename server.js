const log = () => {};
const log2 = console.log;

const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const path = require('path');
const { random } = require("./server-logic/utils.js");

const app = express();
const server = createServer(app);
// const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin: "*", // Или укажи конкретный домен, если нужно
    methods: ["GET", "POST"]
  }
});


app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

const connectedSockets = {}; // Список подключенных сокетов
let players = []; // Список игроков
let winners = []; // Список победителей
let gameInfo = getInitialGameInfo(); // Информация о текущей игре

// Инициализация начальной информации об игре
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
      activPlayer: { id: '', hitPoints: 30 },
      passivPlayer: { id: '', hitPoints: 30 }
    }
  };
}

// Получение списка подключенных сокетов
function getConnectedSockets() {
  return Object.entries(connectedSockets);
}

// Получение списка подключенных пользователей
function getConnectedUsers() {
  return getConnectedSockets().map(([id, socket]) => ({
    id,
    username: socket.username,
  }));
}

// Получение списка подключенных игроков
function getConnectedPlayers() {
  return players.map(([id, socket]) => ({
    id,
    username: socket.username,
    position: socket.frontUser.position,
    frontUser: socket.frontUser,
    dead: socket.dead,
    winner: socket.winner
  }));
}

// Получение списка победителей
function getWinners() {
  return winners.map(([id, socket]) => ({
    id,
    username: socket.username,
  }));
}

// Обновление информации о соединениях и состоянии игры
function changeConnections(io) {
  io.emit('refresh-users-list', getConnectedUsers());
  io.emit('refresh-game-state', getGameInfo());
}

// Получение информации об игре
function getGameInfo() {
  gameInfo.connectedUsers = getConnectedUsers();
  gameInfo.connectedPlayers = getConnectedPlayers();
  gameInfo.winners = getWinners();
  return gameInfo;
}

// Завершение игры
function gameOver() {
  io.emit('game-over');
  masterMessage('Бой О КОНЧЕН');
}

// Сброс игры
function reset() {
  io.emit('force-front-restart');
  gameInfo = getInitialGameInfo();
}

// Отправка сообщения от мастера
function masterMessage(message) {
  io.emit('new-all-message', { text: message, username: 'Dungeon Master:', style: 'master-message' });
}

let reloadFrontFlag = false;
const usedMsgId = []; // Идентификаторы использованных сообщений

io.on("connection", (socket) => {
  socket.username = 'Anonymous';
  socket.frontUser = { position: 0 };
  connectedSockets[socket.id] = socket;
  socket.emit('your-id', socket.id);
  changeConnections(io);

  // Перезапуск фронтенда при первом подключении
  setTimeout(() => {
    if (!reloadFrontFlag) {
      io.emit('force-front-restart');
      reloadFrontFlag = true;
    }
  }, 2000);

  socket.on("disconnect", () => {
    delete connectedSockets[socket.id];
    changeConnections(io);
  });

  socket.on("set-username", (username) => {
    socket.username = username;
    changeConnections(io);
  });

  socket.on('chat-message', (message) => {
    io.emit('new-all-message', { text: message, username: socket.username });
  });

  socket.on('start-game-signal', () => {
    log2('igra na4alas')
    if (gameInfo.isGameStarted) return;
    gameInfo.isGameStarted = true;
    players = getConnectedSockets().splice(0,5);
    const playerId = players[gameInfo.playerPointer][0];
    const playerSocket = players[gameInfo.playerPointer][1];
    gameInfo.currentUserId = playerId;
    playerSocket.emit('open-step', getGameInfo());
    io.emit('game-activation', getGameInfo());
  });

  socket.on('skip-step', (user) => {
    handleSkipStep(user, socket);
  });

  socket.on('reset', reset);

  socket.on('new-user-position', (frontUser) => {
    socket.frontUser = frontUser;
    io.emit('refresh-game-state', getGameInfo());
  });

  socket.on('rolling', () => io.emit('rolling-all'));

  socket.on('rolling-result', (number) => io.emit('rolling-result-all', number));

  socket.on('winner', () => {
    handleWinner(socket);
  });

  socket.on('set-bomb-on-cell', (bomb) => {
    bomb.position = socket.position;
    gameInfo.bombs.push(bomb);
    io.emit('refresh-game-state', getGameInfo());
  });

  socket.on('master-message', masterMessage);

  socket.on('master-message-once', ({ message, roundId }) => {
    if (usedMsgId.includes(roundId)) return;
    usedMsgId.push(roundId);
    masterMessage(message);
  });

  socket.on('bomb-was-exploded', (user) => {
    handleBombExplosion(user, socket);
  });

  socket.on('fighting-start', ({ activPlayerId, passivPlayerId }) => {
    handleFightingStart(activPlayerId, passivPlayerId);
  });

  socket.on('fighting-strike', (firstFightingData) => {
    handleFightingStrike(firstFightingData, socket);
  });

  socket.on('round-result', () => {
    gameInfo.fighting.isActive = true;
    socket.emit('start-new-round');
  });

  socket.on('action-result', (frontUser) => {
    socket.frontUser = frontUser;
  });

  socket.on('end-boy', ({ newXpFighter1, newXpFighter2, fighterObject1, fighterObject2 }) => {
    handleEndBoy(newXpFighter1, newXpFighter2, fighterObject1, fighterObject2);
  });
  socket.on('test', () => {
    log2('zaebis');

  });


});

// Обработка пропуска хода
function handleSkipStep(user, socket) {
  if (user.hitPoints < 1 && !socket.dead) {
    socket.dead = true;
    players = players.filter(p => p[0] !== socket.id);
    socket.emit('game-over-for-one');
    masterMessage('Личная обильная кончина настигла игрока ' + socket.username);
    io.emit('refresh-game-state', getGameInfo());
    io.emit('refresh-users-list', getConnectedUsers());
  }

  if (players.length === 0) {
    gameOver();
    return;
  }

  gameInfo.playerPointer = (gameInfo.playerPointer + 1) % players.length;
  const nextPlayerSocket = players[gameInfo.playerPointer][1];
  gameInfo.currentUserId = players[gameInfo.playerPointer][0];
  nextPlayerSocket.emit('open-step', getGameInfo());
  io.emit('refresh-game-state', getGameInfo());
}

// Обработка победителя
function handleWinner(socket) {
  socket.winner = true;
  winners.push([socket.id, socket]);
  players = players.filter(p => p[0] !== socket.id);
  io.emit('refresh-game-state', getGameInfo());
}

// Обработка взрыва бомбы
function handleBombExplosion(user, socket) {
  const exploadedBombs = gameInfo.bombs.filter(b => b.position === user.position);
  gameInfo.bombs = gameInfo.bombs.filter(b => b.position !== user.position);
  io.emit('refresh-game-state', getGameInfo());
  io.emit('bomb-exploaded-for-all', { exploadedBombs, user });

  exploadedBombs.forEach(b => {
    masterMessage(`У игрока ${socket.username} есть пробитие, негативный эффект: ${b.bomb.title}`);
  });
}

// Обработка начала боя
function handleFightingStart(activPlayerId, passivPlayerId) {
  gameInfo.fighting = {
    isActive: true,
    activPlayer: { id: activPlayerId, hitPoints: 30 },
    passivPlayer: { id: passivPlayerId, hitPoints: 30 }
  };
  io.emit('open-arena', getGameInfo());
  setTimeout(() => io.emit('open-arena-hit-button'), random(1000, 5500));
}

// Обработка удара в бою
function handleFightingStrike(firstFightingData, socket) {
  if (!gameInfo.fighting.isActive) return;
  gameInfo.fighting.isActive = false;
  const roundId = Math.random();
  const otherFighterId = socket.id === gameInfo.fighting.activPlayer.id ? gameInfo.fighting.passivPlayer.id : gameInfo.fighting.activPlayer.id;
  const otherSocket = connectedSockets[otherFighterId];

  if (otherSocket) {
    otherSocket.emit('get-fighting-data', (secondFightingData) => {
      const isFirstGetDamage = firstFightingData.protection !== secondFightingData.mortalStrike;
      const isSecondGetDamage = secondFightingData.protection !== firstFightingData.mortalStrike;
      const firstPlayerPowerAttack = Math.round(firstFightingData.yourDickPower / 6);
      const secondPlayerPowerAttack = Math.round(secondFightingData.yourDickPower / 6);

      const roundResult = [
        { id: otherSocket.id, damage: firstPlayerPowerAttack, isDamage: isSecondGetDamage },
        { id: socket.id, damage: secondPlayerPowerAttack, isDamage: isFirstGetDamage }
      ];

      io.emit('round-done', { roundResult, roundId });
    });
  } else {
    masterMessage('Не найден другой игрок для боя');
  }
}

// Обработка конца боя
function handleEndBoy(newXpFighter1, newXpFighter2, fighterObject1, fighterObject2) {
  const fighter1Socket = connectedSockets[fighterObject1.id];
  const fighter2Socket = connectedSockets[fighterObject2.id];
  if (newXpFighter1 < 1 && newXpFighter2 < 1) {
    // Ничья
  } else {
    if (newXpFighter1 < 1) {
      fighter1Socket.frontUser.hitPoints -= 1;
    } else {
      fighter1Socket.frontUser.hitPoints += 1;
    }
    if (newXpFighter2 < 1) {
      fighter2Socket.frontUser.hitPoints -= 1;
    } else {
      fighter2Socket.frontUser.hitPoints += 1;
    }
  }
  io.emit('refresh-game-state', getGameInfo());
  io.emit('end-of-the-fight');
}

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
