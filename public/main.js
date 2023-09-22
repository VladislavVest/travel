const log = console.log;

const img = document.createElement('img');


const socket = io();
// socket.emit("massage", "hellotest");
// // socket.on("data", (dt) => {
// //   alert(dt);
// // });

const gameField = [
  [0, 0, 96, 95, 94, 93, 92, 91, 90, 90],
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
///peredelat 37 dobavit
const grid = document.querySelector(".grid");
log(grid);
gameField.forEach((row, i) => {
  log(row);
  row.forEach((cell, ii) => {
    grid.innerHTML += `
    <div id="${cell}" class="cell"></div>
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

cells[89 - 1].innerHTML = `
<div>
      <img class="dice" src="./images/dice.gif" alt="">
     
    </div>
`





cells[91 - 1].classList.add("with-user");


const user = {
  position: 1,
}



// setInterval(() => {
//   user.position++;
//   log(user);
//   moveUser();
// }, 1000)

function moveUser() {
  const currentCell = document.getElementById(user.position);
  currentCell.innerHTML += `
<span class="material-symbols-outlined">
elderly
</span>
`
}

