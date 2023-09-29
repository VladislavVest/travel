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
}

function render() {
  const xp = document.querySelector("#xp"); 
  xp.innerHTML = user.hitPoints;
  const moral = document.querySelector("#moral");
  moral.innerHTML = user.moral;
  // const descr = cellsDescription.description;
  // descr.innerHTML = descr.description;
}
render();


const gameField = [
  [0, 0, 96, 95, 94, 93, 92, 91, 90, 89],
  [79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
  [78, 77, 76, 75, 74, 73, 72, 71, 70, 69],
  [59, 60, 61, 62, 63, 64, 65, 66, 67, 68],
  [58, 57, 56, 55, 54, 53, 52, 51, 50, 49],
  [39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
  [38, 37, 36, 35, 34, 33, 32, 30, 28, 27],
  [17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  [16, 15, 14, 13, 12, 11, 10, 9, 0, 0],
  [1, 2, 3, 4, 5, 6, 7, 8, 0, 0]
]

const cellsDescription = [
  { number: 1, effect: [''], description: 'Старт' },
  { number: 2, effect: ['skip'], description: 'пропуск хода' },
  { number: 3, effect: ['addStep'], description: 'плюсход' },
  { number: 4, effect: [{ name: 'minusXp', n: 1 }], description: 'минус 1 хп' },
  { number: 5, effect: [{ name: 'minusXp', n: 1 }, 'skip'], description: 'миунус 1 хп, минус ход' },
  { number: 6, effect: [{ name: 'plusXp', n: 1 }, 'addStep'], description: 'плюс 1 хп' },
  { number: 7, effect: ['skip'], description: 'пропускхода' },
  { number: 8, effect: [{ name: 'minusXp', n: 1 }], description: 'минус 1 хп' },
  //
  { number: 9, effect: [{ name: 'minusXp', n: 2 }, 'skip'], description: 'миунус 2 хп, минус ход' },
  { number: 10, effect: [{ name: 'casino', n: 2 }, 'rotation'], description: 'казино ходов чёт:+1 к кубику на 2 хода, нечет -1' },
  { number: 11, effect: [{ name: 'minusMoral', n: 1 }], description: 'минус 1 мораль' },
  { number: 12, effect: [{ name: 'armor', n: 1 }, 'items'], description: 'защита от следующего негативного эффекта' },
  { number: 13, effect: [{ name: 'vampire', n: 1 }, 'jump'], description: 'вЫбери игрока и забери его хп себе, прыжок вперёд через поле' },
  { number: 14, effect: [{ name: 'empty', n: 1 }], description: 'тут нихрена нет' },
  { number: 15, effect: [{ name: 'empty', n: 1 }], description: 'тут нихрена нет' },
  { number: 16, effect: [{ name: 'minusXp', n: 1 }, { name: 'minusMoral', n: 1 }], description: 'Лабиринт - миунус 1 хп, минус мораль' },


]



const grid = document.querySelector(".grid");
log(grid);
gameField.forEach((row, i) => {
  log(row);
  row.forEach((cell, ii) => {
    const opisanie = cellsDescription.find(cdo => cdo.number == cell) || { description: '' };
    log(cell, opisanie);

    grid.innerHTML += `
    <div id="${cell}" class="cell" title="${opisanie.description}"></div>
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

cells[91 - 1].classList.add("with-user");


function moveUser() {
  cells.forEach((cell) => {
    cell.innerHTML = "";
    cell.classList.remove('with-user');
  })
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
  setTimeout(() => {
    user.position += number;
    moveUser();
    const opisanie = cellsDescription.find(cdo => cdo.number == user.position) || { effect: [] };
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


      }
    });
    render();
  }, 1600);


}


var button = document.getElementById("run");
var audio = document.getElementById("audio");
button.addEventListener("click", function () {
  audio.currentTime = 0;
  audio.play();
});







