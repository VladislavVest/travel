const log = console.log;

let timerCounter = 0;

/////////////////////////////////////////////////////////////////   SOCKET    ////////////////////////////////////////////////
const socket = io();
// socket.emit("massage", "hellotest");

socket.on("refresh-users-list", (userList) => {
  renderUserList(userList);
});

function renderUserList(userList) {
  const asideUserList = document.querySelector('.aside-userlist');
  asideUserList.innerHTML = '';
  userList.forEach((user) => {
    asideUserList.innerHTML += `
    <div class="user" id="x${user.id}">
      <div class="avatar"></div>
      <div class="username">${user.username}</div>
    </div>
  `;

  })
};
const setUsernameScreen = document.querySelector('.set-username-screen');
const username = localStorage.getItem("username");
if (!username) {
  setUsernameScreen.style.display = 'flex';
} else { socket.emit('set-username', username) }


//////////////////////////////////////////////////////////////////  SOCKET    ////////////////////////////////////////////////
function setUserName() {
  log('chek 1111');
  const nameUser = document.querySelector('#nameForm input').value;
  localStorage.setItem("username", nameUser);
  setUsernameScreen.style.display = 'none';
  socket.emit('set-username', username);
}
const img = document.createElement('img');
const descr = document.querySelector("#descr");

const user = {
  position: 1,
  hitPoints: 30,
  moral: 10,
  armor: 0,
  steps: 1,
  weapon: 2,
  dice: 0,
}
const getCellDescription = (cellNumber) => cellsDescription.find(cdo => cdo.number == cellNumber) || { effect: [], description: '' };

function render() {
  const xp = document.querySelector("#xp");
  xp.innerHTML = user.hitPoints;
  const moral = document.querySelector("#moral");
  moral.innerHTML = user.moral;
  const armor = document.querySelector("#armor");
  armor.innerHTML = user.armor;
  const steps = document.querySelector("#steps");
  steps.innerHTML = user.steps;
  const weapon = document.querySelector("#weapon");
  weapon.innerHTML = user.weapon;
  const dice = document.querySelector("#dice");
  dice.innerHTML = user.dice;

}
render();



const grid = document.querySelector(".grid");
gameField.forEach((row, i) => {
  row.forEach((cell, ii) => {
    // const opisanie = cellsDescription.find(cdo => cdo.number == cell) || { description: '', effect: [] };
    const opisanie = getCellDescription(cell);
    let classes = 'cell';
    opisanie.effect.forEach((ef) => {
      if (ef.name == 'emptyHole') classes += ' empty-hole';
      if (ef.name == 'armor') classes += ' armor';
    });
    grid.innerHTML += `
    <div id="${cell}" class="${classes}" title="${opisanie.description}"></div>
    `
  })
});

const cells = document.querySelectorAll(".cell");
cells[91 - 1].innerHTML = `
    <span class="material-symbols-outlined fishka">
         elderly
    </span>
    <span class="material-symbols-outlined fishka">
  elderly_woman
  </span>  
  <span class="material-symbols-outlined fishka">
  accessible
  </span>
  <span class="material-symbols-outlined fishka">
  accessible_forward
  </span>
`;

cells[90].classList.add("with-user");


function moveUser() {
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove('with-user');
  })
  const currentCell = document.getElementById(user.position);
  currentCell.innerHTML += `
<span class="material-symbols-outlined fishka">
elderly
</span>
`
  currentCell.classList.add("with-user");
}

function run() {
  const illustration = document.querySelector(".illustration");
  const runButton = document.querySelector("#run");
  illustration.style.backgroundImage = "url(./images/dice2.gif)";
  runButton.disabled = true;
  let number = Math.ceil(Math.random() * 3);
  switch (number) {
    case 1:
      setTimeout(() => {
        illustration.style.backgroundImage = "url(./images/num1.jpg)";
        runButton.disabled = false;
      }, 1500);
      break;
    case 2:
      setTimeout(() => {
        illustration.style.backgroundImage = "url(./images/num2.jpg)";
        runButton.disabled = false;
      }, 1500);
      break
    case 3:
      setTimeout(() => {
        illustration.style.backgroundImage = "url(./images/num3.jpg)";
        runButton.disabled = false;
      }, 1500);
      break;
  }
  const opisanie = getCellDescription(user.position);
  let stop = false;
  opisanie.effect.forEach((ef) => {
    if (typeof ef == 'string' && ef == 'reverse') {
      setTimeout(() => {
        user.position -= number;
        action(user.position)
      }, 1600);
      stop = true;
    };
  })

  if (!stop) {
    user.position += number;
    setTimeout(() => action(user.position), 1600);
  }
}


function action(n) {

  moveUser();
  const opisanie = getCellDescription(n);
  descr.innerHTML = opisanie.description;
  opisanie.effect.forEach((ef) => {
    log(ef, typeof ef);
    if (typeof ef == 'string') {
    };
    if (typeof ef == 'object') {
      if (ef.name == 'minusXp') {
        if (user.armor > 0) user.armor--
        else user.hitPoints -= ef.n;
      };
      if (ef.name == 'plusXp') {
        user.hitPoints += ef.n
      };
      if (ef.name == 'minusMoral') {
        if (user.armor > 0) user.armor--
        else user.moral -= ef.n;
      };
      if (ef.name == 'plusMoral') {
        user.moral += ef.n
      };
      if (ef.name == 'fall') {
        user.position = ef.to;
        moveUser();
      }
      if (ef.name == 'vampire') {
      }
      if (ef.name == 'plusMoral1') {
        user.moral += ef.n
        moveUser();
        addSound('./audio/rooster.wav', 0.1);
      }
      if (ef.name == 'armor') {
        user.armor += ef.n
        moveUser();
        addSound('./audio/armor.mp3', 0.1);
      }
      if (ef.name == 'emptyHole') {
        user.position = ef.to;
        moveUser();
      }
      if (ef.name == 'skip') {
        if (user.armor > 0) user.armor--
        else user.steps -= ef.n;
      }
    }
  });
  render();
  //start timer to skip step

}


var button = document.getElementById("run");
var audio = document.getElementById("audio");
button.addEventListener("click", function () {
  audio.currentTime = 0;
  audio.play();
});

function devSetPosition() {
  const cell = document.querySelector('#set-position input').value;
  user.position = +cell;
  moveUser();
  action(user.position);
}

function devAddPosition() {
  user.position++;
  moveUser();
  action(user.position);
}
function devAddPosition2() {
  user.position = +user.position + 2;
  moveUser();
  action(user.position);
}

function addSound(path, volume = 1) {
  let audio = new Audio(path);
  audio.volume = volume;
  audio.play().then(() => {
    console.log('Audio played successfully');
  }).catch((error) => {
    console.error('Audio play failed:', error);
    // Здесь можно добавить логику восстановления или информировать пользователя
  });
}

function message(msg) {
  const gm = document.querySelector('.global-message');
  const text = gm.querySelector('.text');
  text.innerHTML = msg;
  gm.style.display = 'flex';
  setTimeout(() => {
    gm.style.display = 'none';
  }, 3000)
}
function sendChatMessage(event) {
  event.preventDefault();
  const textarea = event.srcElement[0];
  if (!textarea.value) return;
  socket.emit('chat-message', textarea.value);
  textarea.value = '';
}

socket.on('new-all-message', (message) => {
  const asideChat = document.querySelector('.aside-chat');
  asideChat.innerHTML += `
  <div class="message">
        <div class="author">
          <div class="avatar"></div>
          <div class="username">${message.username}</div>
        </div>
        <div class="text">${message.text}</div>
      </div>
      `;
  asideChat.scroll({
    top: 99999900,
    left: 0,
    behavior: "smooth",
  });
});

function settingsToggle() {
  const settingsMenu = document.querySelector('.settings-menu');
  settingsMenu.classList.toggle('open-settings');
  const username = localStorage.getItem("username");
  const settingsUsername = document.querySelector('#settings-username');
  settingsUsername.innerHTML = username;
}

function editUsername() {
  const setUsernameScreen = document.querySelector('.set-username-screen');
  const username = localStorage.getItem("username");
  setUsernameScreen.style.display = 'flex';
  // } else { socket.emit('set-username', username) }
  const nameUserInput = document.querySelector('#nameForm input');
  nameUserInput.value = username;

}

const currentPartyStatus = document.querySelector('.js-status');
const bigButton = document.querySelector('.js-big-button');
const partyScreen = document.querySelector('.start-game-screen');

const party = () => {
  if (bigButton.classList.contains('is-active')) {
    bigButton.classList.remove('is-active');
    partyScreen.classList.remove('is-active');
    // currentPartyStatus.innerHTML = '😢 Not Partying, you should be! 😢';
  } else {
    bigButton.classList.add('is-active');
    partyScreen.classList.add('is-active');
    // currentPartyStatus.innerHTML = '🎉 🍻 🕺 Partying 💃 🍻 🎉';
  }
}

bigButton.addEventListener('click', party);

const startButton = document.querySelector('.start-game-screen');
// bigButton.addEventListener('click',()=>{party(); startGame()} );как вызвать 2 функции в онклике

bigButton.addEventListener('click', startGame);

function startGame() {
  addSound('./audio/start.wav', 0.1);
  setTimeout(() => {
    startButton.style.display = 'none';
    const username = localStorage.getItem("username");
    socket.emit('start-game-signal', username);

  }, 1000);
  startButton.style.backgroundImage = "url(./images/starting.gif)";
  startButton.style.backgroundSize = 'cover';
}

socket.on('open-step', (gameInfo) => {
  const runBut = document.querySelector('#run');
  runBut.disabled = false;
  const skipBut = document.querySelector('#skip');
  skipBut.disabled = false;


  const timerPlace = document.querySelector('.bottom-panel .illustration');


  const setTimer = setInterval(() => {
    timerCounter++;
    log(timerCounter);
    timerPlace.innerHTML = `
<div class="timer">${timerCounter} </div>
`
    if (timerCounter > 5) {
      clearInterval(setTimer);
    }
  }, 1000);

})

socket.on('game-activation', (gameInfo) => {
  log(gameInfo);
  window.gameInfo = gameInfo;
  updateTheInterface();
  startButton.style.display = 'none';
  const userInList = document.querySelector('#x' + gameInfo.currentUserId);
  userInList.classList.add('active-step');
});

socket.on('force-front-restart', () => location.reload());// restart all-fronts if restart back

function updateTheInterface() {
  const gi = window.gameInfo;
  document.querySelector('#settings-username-btn').disabled = (gi.isGameStarted) ? true : false;

}

