const log = console.log;

// var button = document.getElementById("button");
// var audio = document.getElementById("audio");
button.addEventListener("click", function() {
    audio.play();
});


// const startButton = document.querySelector('.start-game-screen');
// const startSound =()=>{
//   addSound('./audio/start.wav', 0.1);
//   startButton.style.display = 'none';
// }
// bigButton.addEventListener('click', startSound);








// bigButton.addEventListener('click', startGame);
// function startGame() {
//   addSound('./audio/start.wav', 0.1);
//   startButton.style.display = 'none';
// }




// const cells = document.querySelectorAll(".cell");
// cells[91 - 1].innerHTML = `
//     <span class="material-symbols-outlined fishka">
//          elderly
//     </span>
//     <span class="material-symbols-outlined fishka">
//   elderly_woman
//   </span>  
//   <span class="material-symbols-outlined fishka">
//   accessible
//   </span>
//   <span class="material-symbols-outlined fishka">
//   accessible_forward
//   </span>
// `;
// cells[90].classList.add("with-user");



// function moveUser() {
//     const cells = document.querySelectorAll(".cell");
//     cells.forEach((cell) => {
//         cell.innerHTML = "";
//         cell.classList.remove('with-user');
//     })
//     const currentCell = document.getElementById(user.position);
//     currentCell.innerHTML += `
//       <span class="material-symbols-outlined fishka">
//       elderly
//       </span>
//       `
//     currentCell.classList.add("with-user");
// }