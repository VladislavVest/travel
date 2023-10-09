const log = console.log;

const img = document.createElement('img');

const socket = io();

const descr = document.querySelector("#descr");
// socket.emit("massage", "hellotest");
// // socket.on("data", (dt) => {
// //   alert(dt);
// // });
const user = {
  position: 1,
  hitPoints: 30,
  moral: 10,
  armor: 0,
}
const getCellDescription = (cellNumber) => cellsDescription.find(cdo => cdo.number == cellNumber) || { effect: [], description: '' };

function render() {
  const xp = document.querySelector("#xp");
  xp.innerHTML = user.hitPoints;
  const moral = document.querySelector("#moral");
  moral.innerHTML = user.moral;
  const armor = document.querySelector("#armor");
  armor.innerHTML = user.armor;
}
render();



const grid = document.querySelector(".grid");
log(grid);
gameField.forEach((row, i) => {
  log(row);
  row.forEach((cell, ii) => {
    // const opisanie = cellsDescription.find(cdo => cdo.number == cell) || { description: '', effect: [] };
    const opisanie = getCellDescription(cell);
    log(cell, opisanie);
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
log(cells);
cells[91 - 1].innerHTML = `
    <span class="material-symbols-outlined">
         elderly
    </span>
    <span class="material-symbols-outlined">
  elderly_woman
  </span>  
  <span class="material-symbols-outlined">
  accessible
  </span>
  <span class="material-symbols-outlined">
  accessible_forward
  </span>
`;

cells[90].classList.add("with-user");


function moveUser() {
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove('with-user');
  })
  log(user.position);
  const currentCell = document.getElementById(user.position);
  currentCell.innerHTML += `
<span class="material-symbols-outlined">
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
  log(number);
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
        log('do minysa', user.position);
        user.position -= number;
        log('posle minysa', user.position);
        action(user.position)
      }, 1600);
      stop = true;
    };
 })

if (!stop) {
  log('ne doljno but esli propysk');
  user.position += number;
  setTimeout(() => action(user.position), 1600);
}}


function action(n) {
  log(n)
  log('action', user.position)
  moveUser();
  // const opisanie = cellsDescription.find(cdo => cdo.number == user.position) || { effect: [] };
  const opisanie = getCellDescription(n);
  descr.innerHTML = opisanie.description;
  log('start process xp change', opisanie);
  opisanie.effect.forEach((ef) => {
    log(ef, typeof ef);
    if (typeof ef == 'string') {
    };
    if (typeof ef == 'object') {
      if (ef.name == 'minusXp') {
        user.hitPoints -= ef.n
      };
      if (ef.name == 'plusXp') {
        user.hitPoints += ef.n
      };
      if (ef.name == 'minusMoral') {
        user.moral -= ef.n
      };
      if (ef.name == 'plusMoral') {
        user.moral += ef.n
      };
      if (ef.name == 'fall') {
        user.position = ef.to;
        moveUser();
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
    }
  });
  render();
}


var button = document.getElementById("run");
var audio = document.getElementById("audio");
button.addEventListener("click", function () {
  audio.currentTime = 0;
  audio.play();
});

function devSetPosition() {
  const cell = document.querySelector('#set-position input').value;
  log(cell);
  user.position = cell;
  moveUser();
  action(user.position);
}

function devAddPosition() {
  user.position++;
  moveUser();
  action(user.position);
}
function devAddPosition2() {
  log(+user.position);
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



