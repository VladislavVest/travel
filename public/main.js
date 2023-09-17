const log = console.log;



/* <span class="material-symbols-outlined">
  elderly_woman
  </span>  */

const socket = io();
// socket.emit("massage", "hellotest");
// // socket.on("data", (dt) => {
// //   alert(dt);
// // });

const cells = document.querySelectorAll(".cell");
log(cells);
cells[91 - 1].innerHTML = `
    <span class="material-symbols-outlined">
         elderly
    </span>
`;