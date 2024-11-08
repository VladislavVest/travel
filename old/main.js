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
  fightingStepFlag: false
};
let gameInfo = {};

socket.on('force-front-restart', () => location.reload());// restart all-fronts if restart back
socket.on('rolling-all', () => rollingAnimation());
socket.on('rolling-result-all', (number) => rollingResult(number));
socket.on("refresh-users-list", (userList) => renderUserList(userList));
socket.on('your-id', (id) => { localStorage.setItem('socket-id', id) });
socket.on('game-over', () => {
  log2('финальная заставка')
  const overScreenNode = document.querySelector('.game-over');
  overScreenNode.classList.remove("hide");
  // setTimeout(() => {
  //   overScreenNode.classList.add("hide");
  // }, 4000);
});

socket.on('game-over-for-one',async()=>{
  const overOne = document.querySelector('.game-over-for-one');
  overOne.classList.remove("hide");
  overOne.style.backgroundImage = "url(./images/overcum2.gif)"; //струя
  addSound('./audio/over1.mp3', 0.5);
  await pause(8000);
  overOne.style.backgroundImage = "url(./images/overcum3.gif)";
  await pause(5000);
  overOne.style.backgroundImage = "url(./images/overcum4.gif)";
  await pause(15000);
    overOne.classList.add("hide");

})




socket.on('refresh-game-state', (_gameInfo) => {
  gameInfo = _gameInfo;
  renderUserList(null, gameInfo);
  log('9999999999999999', gameInfo, localStorage.getItem('socket-id'))
  const currentUser = gameInfo.connectedPlayers.find((u) => u.id == localStorage.getItem('socket-id'))
  log('KURRRRRRRRRRrrnet USER)', currentUser);
  if (currentUser && currentUser.frontUser.hitPoints) {
    user.hitPoints = currentUser.frontUser.hitPoints;// ПРодолжить!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


  }
  render();
  // log('FOR FIGHTING!!!!', gameInfo, gameInfo.isGameStarted);
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
  // log('11111111111111111111111111111111111111', exploadedBombs, user);
  const animationNode = document.querySelector('.animation-container');
  const imageNode = animationNode.querySelector('img');
  imageNode.src = './images/bombbefore.gif';
  animationNode.style.display = 'flex';
  await pause(3000);
  imageNode.src = './images/bombafter.gif';
  await pause(3500);
  animationNode.style.display = 'none';

});



