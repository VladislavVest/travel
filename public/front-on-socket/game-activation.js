socket.on('game-activation', (gameInfo) => {
    log(gameInfo);
    window.gameInfo = gameInfo;
    updateTheInterface();
    startButton.style.display = 'none';
    const userInList = document.querySelector('#x' + gameInfo.currentUserId);
    userInList.classList.add('active-step');
  });

  