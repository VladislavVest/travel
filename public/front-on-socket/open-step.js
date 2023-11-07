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
    message('Твой ход', 'your-step'); 
  });