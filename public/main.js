const socket = io(); // socket.emit("massage", "hellotest");
const asideUserList = document.querySelector('.aside-userlist');
const setUsernameScreen = document.querySelector('.set-username-screen');
const grid = document.querySelector(".grid");
const audio = document.getElementById("audio");
const illustration = document.querySelector(".illustration");
const runButton = document.querySelector("#run");
const startButton = document.querySelector('.start-game-screen');
const img = document.createElement('img');
const descr = document.querySelector("#descr");
let timerCounter = 0;
const user = {
  position: 1,
  hitPoints: 30,
  moral: 10,
  armor: 0,
  steps: 0,
  weapon: 2,
  dice: 0,
};
let gameInfo = {};

socket.on('force-front-restart', () => location.reload());// restart all-fronts if restart back
socket.on('rolling-all', () => rollingAnimation());
socket.on('rolling-result-all', (number) => rollingResult(number));
socket.on("refresh-users-list", (userList) => renderUserList(userList));
socket.on('your-id', (id) => { localStorage.setItem('socket-id', id) });
socket.on('refresh-game-state', (_gameInfo) => {
  gameInfo = _gameInfo;
  renderUserList(null, gameInfo);
  log('FOR FIGHTING!!!!', gameInfo, gameInfo.isGameStarted);
  if (gameInfo.isGameStarted) {
    const partyScreen = document.querySelector('.start-game-screen');
    partyScreen.style.display = 'none';
  };
  // moveUsers(gameInfo.connectedPlayers);
  rebuildGameField(gameInfo);
}
);

render();
init();
checkUsernameInMemory();

socket.on('bomb-exploaded-for-all', async ({ exploadedBombs, user }) => {
  log('11111111111111111111111111111111111111', exploadedBombs, user);
  const animationNode = document.querySelector('.animation-container');
  const imageNode = animationNode.querySelector('img');
  imageNode.src = './images/bombbefore.gif';
  animationNode.style.display = 'flex';
  await pause(3000);
  imageNode.src = './images/bombafter.gif';
  await pause(3500);
  animationNode.style.display = 'none';

});



