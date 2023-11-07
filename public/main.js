const log = console.log;
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
  steps: 1,
  weapon: 2,
  dice: 0,
}

socket.on('force-front-restart', () => location.reload());// restart all-fronts if restart back
socket.on("refresh-users-list", (userList) => renderUserList(userList));

render();
init();
checkUsernameInMemory();





