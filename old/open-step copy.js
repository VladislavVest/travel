  
  socket.on('open-step', (gameInfo) => {
    const mySelf = getMySelf(gameInfo);
    if (mySelf.dead || mySelf.winner) {
      setTimeout(() => {
        skip();
      }, 1500);
    } else {
      const runButton = document.querySelector('#run');
      const skipButton = document.querySelector('#skip');
      if (runButton && skipButton) {
        runButton.disabled = false;
        setTimeout(() => {
          skipButton.disabled = false;
        }, 2000);
        user.steps++;
        message('Твой ход', 'your-step');
        renderUserList(null, gameInfo);
        render();
        clearCells();
        stickOutYou();
        if (user.steps < 1) {
          runButton.disabled = true;
        }
      }
    }
  });