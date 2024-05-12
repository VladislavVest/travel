const log = () => { }
const log2 = console.log;

const express = require("express");
const { createServer, get } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);
var path = require('path');

const { random } = require("./server-logic/utils.js")


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

function allDead() { log('All Dead') };

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
    const socket = double[1];
    return {
      id: socket.id,
      username: socket.username,
      position: socket.frontUser.position,
      frontUser: socket.frontUser,
      dead: socket.dead,
      winner: socket.winner

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
  io.emit('refresh-game-state', getGameInfo());
}

function getGameInfo() {
  gameInfo.connectedUsers = getConnectedUsers();
  gameInfo.connectedPlayers = getConnectedPlayers();
  gameInfo.winners = getWinners();
  return gameInfo
}

function gameOver() {
  io.emit('game-over');
  masterMassage('Бой О КОНЧЕН')
  // setTimeout(reset, 10000);
}

function reset() {
  io.emit('force-front-restart');
  gameInfo = getInitialGameInfo();
}


function masterMassage(message) {
  io.emit('new-all-message', { text: message, username: 'Dungeon Master:', style: 'master-message' });
}

let reloadFrontFlag = false;

const usedMsgId = []; // это идентификаторы использованных соообщений чтобы не пропускать их повторно

io.on("connection", (socket) => {
  // console.log("a user connected");
  socket.username = 'Anonymous';
  socket.frontUser = {};
  socket.frontUser.position = 0;
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
    gameInfo.isGameStarted = true;
    gameInfo.connectedUsers = getConnectedUsers();
    gameInfo.connectedPlayers = getConnectedPlayers();
    //open step for first user
    players = getConnectedSockets();
    const playerId = players[gameInfo.playerPointer][0];
    const playerSocket = players[gameInfo.playerPointer][1];
    gameInfo.currentUserId = playerId;
    playerSocket.emit('open-step', getGameInfo());
    //start game for all users
    io.emit('game-activation', getGameInfo())
  });

  socket.on('skip-step', (user) => {
    log2('ошибка с гейм овер', gameInfo.playerPointer, players.length);
    if (gameInfo.playerPointer > players.length - 1) gameInfo.playerPointer = 0;
    const playerSocket = players[gameInfo.playerPointer][1];

    if (user.hitPoints < 1 && !playerSocket.dead) { //.......................................................................................GAME OVER
      playerSocket.dead = true;
      players = players.filter((p) => {
        return p[0] !== playerSocket.id;
      });

      playerSocket.emit('game-over');
      // gameInfo.connectedPlayers = gameInfo.connectedPlayers.filter(p => p.id != socket.id);
      io.emit('refresh-game-state', getGameInfo());
      io.emit('refresh-users-list', getConnectedUsers());

    }
    gameInfo.playerPointer++;
    if (gameInfo.playerPointer > players.length - 1) gameInfo.playerPointer = 0; //12.05 Ошибка с вызовом резета пробелма  споинтерами.
    if (players.length == 0) {
      log2("шляпа с гейм овер")
      gameOver();
      return
    }

    //если пллер лентс сокет 0.............придумать конец игры .....................................................07.05
    log2('ошибка 2 с гейм овер', gameInfo.playerPointer, players.length);

    const nextPlayerSocket = players[gameInfo.playerPointer][1];
    log("плеер сокет кому ход выбор", nextPlayerSocket.id, getGameInfo())


    const playerId = players[gameInfo.playerPointer][0];
    gameInfo.currentUserId = playerId;
    nextPlayerSocket.emit('open-step', getGameInfo());
    io.emit('refresh-game-state', getGameInfo());
  });

  socket.on('reset', reset);

  socket.on('new-user-position', (frontUser) => {
    socket.position = frontUser.position;
    log('frontUser', frontUser)
    socket.frontUser = frontUser;
    gameInfo.connectedUsers = getConnectedUsers();
    gameInfo.connectedPlayers = getConnectedPlayers();
    io.emit('refresh-game-state', getGameInfo());
  });

  socket.on('rolling', () => {
    io.emit('rolling-all');

  });

  socket.on('rolling-result', (number) => {
    io.emit('rolling-result-all', number);
  });

  socket.on('winner', (user) => {
    // log('winner!!!');
    socket.winner = true;
    winners.push([socket.id, socket]);
    players = players.filter((p) => {
      return p[0] !== socket.id;
    })
    // log(players.length);
    // gameInfo.connectedUsers = getConnectedUsers();
    // gameInfo.connectedPlayers = getConnectedPlayers();
    // gameInfo.winners = getWinners();                        //////////////////////////////////////////тут вынесли функцию гейминфо в отдельную гет гейм инфо
    io.emit('refresh-game-state', getGameInfo());
  })

  socket.on('set-bomb-on-cell', (bomb) => {
    bomb.position = socket.position;
    log('TODAY', socket.position);
    gameInfo.bombs.push(bomb);
    // log(bomb);
    io.emit('refresh-game-state', getGameInfo());
  });

  socket.on('master-message', (message) => {
    masterMassage(message)

  });

  socket.on('master-message-once', ({ message, roundId }) => {
    log(message, roundId, '06/04 messsageeeeeeeeeeeeeee');
    log(usedMsgId, 'cостояние юзед мсг');

    const isUsed = usedMsgId.find((id) => id == roundId)
    log(isUsed, 'isuseddddddddddddd')
    if (isUsed) return;
    usedMsgId.push(roundId);
    log(usedMsgId, 'cостояние юзед мсг');

    masterMassage(message)

  });






  socket.on('bomb-was-exploded', (user) => {
    // log('12.12. before', gameInfo.bombs);
    const exploadedBombs = gameInfo.bombs = gameInfo.bombs.filter((b) => {
      return b.position == user.position;
    });
    gameInfo.bombs = gameInfo.bombs.filter((b) => {
      return b.position != user.position;
    });
    // log('12.12.after', gameInfo.bombs);
    io.emit('refresh-game-state', getGameInfo());
    io.emit('bomb-exploaded-for-all', { exploadedBombs, user });

    exploadedBombs.forEach((b) => {
      const massage = `У игрока ${socket.username} есть пробитие, негативный эффект: ${b.bomb.title}`;
      masterMassage(massage);
    })
  });


  let _activPlayerId;
  let _passivPlayerId;
  socket.on('fighting-start', ({ activPlayerId, passivPlayerId }) => {
    _activPlayerId = activPlayerId;
    _passivPlayerId = passivPlayerId;
    log(activPlayerId, passivPlayerId, 'problem id fight')
    //   вызов на бой
    gameInfo.fighting.isActive = true;
    gameInfo.fighting.activPlayer.id = _activPlayerId;
    gameInfo.fighting.passivPlayer.id = _passivPlayerId;
    io.emit('open-arena', getGameInfo());
    const randomNumb = random(1000, 5500);
    log('randomnumb', randomNumb);
    setTimeout(() => { io.emit('open-arena-hit-button') }, randomNumb);

  });

  let roundId;
  socket.on('fighting-strike', (firstFightingData) => {

    if (!gameInfo.fighting.isActive) return; //не пропускаем если удар нанесен
    gameInfo.fighting.isActive = false; //закрываем файтинг после первого удара
    roundId = Math.random();

    // определить айди другого бойца
    const otherFighterId = (socket.id == gameInfo.fighting.activPlayer.id) ? gameInfo.fighting.passivPlayer.id : gameInfo.fighting.activPlayer.id

    const otherSocket = connectedSockets[otherFighterId];
    log(otherFighterId, socket.id, '4444444444444');
    if (otherSocket) {
      otherSocket.emit('get-fighting-data', (secondFightingData) => {
        log(secondFightingData, firstFightingData, '11111eeeeeeerr');
        const isFirstGetDamage = firstFightingData.protection != secondFightingData.mortalStrike;
        log2('изферст гет демейд;', firstFightingData.protection, secondFightingData.mortalStrike)
        const isSecondGetDamage = secondFightingData.protection != firstFightingData.mortalStrike;
        log2('cекнод гет демейдж;', secondFightingData.protection, firstFightingData.mortalStrike)

        log('процесс боя', isFirstGetDamage, isSecondGetDamage);
        const firstPlayerPowerAttack = Math.round(firstFightingData.yourDickPower / 6);
        const secondPlayerPowerAttack = Math.round(secondFightingData.yourDickPower / 6);

        // взять их 30 хп из объекта на сервере а потом на фронт отослать 


        const roundResult = [
          { id: otherSocket.id, damage: firstPlayerPowerAttack, isDamage: isSecondGetDamage },
          { id: socket.id, damage: secondPlayerPowerAttack, isDamage: isFirstGetDamage }]
        log2(roundResult, 'раунд зезальтттттт')
        io.emit('round-done', { roundResult, roundId });

      });
    } else {
      masterMassage('other socket dont find', otherFighterId)
    }


    // fighting: {
    //   isActive: false,
    //   activPlayer: {
    //     id: '', //id тот кто вызвал на бой
    //     hitPoints: 30
    //   },
    //   passivPlayer: {
    //     id: '', //id тот кого вы..и
    //     hitPoints: 30
    //   }
    // }

    // {
    //   mortalStrike: 'headshot',
    //   protection: 'headshot',
    //   yourDickPower: 65,
    //   yourPartnerDickPower: 41
    // } {
    //   mortalStrike: 'headshot',
    //   protection: 'headshot',
    //   yourDickPower: 10,
    //   yourPartnerDickPower: 73
    // } 




  });


  socket.on('round-result', (result) => {
    gameInfo.fighting.isActive = true;
    socket.emit('start-new-round');
  });

  socket.on('action-result', (frontUser) => {
    log('екшен резалт!!!!!!!!!!!!!!!!!!!!', frontUser)
    // екшен резалт!!!!!!!!!!!!!!!!!!!! {
    //   position: 5,
    //   hitPoints: 29,
    //   moral: 10,
    //   armor: 0,
    //   steps: -3,
    //   weapon: 2,
    //   dice: 0
    // }
    //  gameInfo.players[socket.id].params = userParams;
    socket.frontUser = frontUser;
    log('gameinfoooooooo', gameInfo)

  });


  socket.on('end-boy', ({ newXpFighter1, newXpFighter2, fighterObject1, fighterObject2 }) => {
    log('конец боя', newXpFighter1, newXpFighter2, fighterObject1, fighterObject2);

    log("gameInfo.players", gameInfo.players, socket.frontUser)
    const fighter1Socket = connectedSockets[fighterObject1.id];
    const fighter2Socket = connectedSockets[fighterObject2.id];
    if (newXpFighter1 < 1 && newXpFighter2 < 1) {
      //Ничья
    } else {
      log('пересчет после бояяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяяя')
      if (newXpFighter1 < 1) {
        fighter1Socket.frontUser.hitPoints = fighter1Socket.frontUser.hitPoints - 1
      } else {
        fighter1Socket.frontUser.hitPoints = fighter1Socket.frontUser.hitPoints + 1
      }
      if (newXpFighter2 < 1) {
        fighter2Socket.frontUser.hitPoints = fighter2Socket.frontUser.hitPoints - 1
      } else {
        fighter2Socket.frontUser.hitPoints = fighter2Socket.frontUser.hitPoints + 1
      }
    }
    io.emit('refresh-game-state', getGameInfo());
    io.emit('end-of-the-fight');
  });

});



server.listen(3000, () => {
  // console.log("server running at http://localhost:3000");
});

// дебаг степ