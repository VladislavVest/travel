socket.on('game-activation', (gameInfo) => {
  log(gameInfo);
  window.gameInfo = gameInfo;
  updateTheInterface();
  startButton.style.display = 'none';
  renderUserList(null, gameInfo);
  // const userInList = document.querySelector('#x' + gameInfo.currentUserId);
  // userInList.classList.add('active-step');
  for (let i = 0; i < 2; i++) {
    const rand = random(0, 7);
    userBombs.push(bombs[rand]);
}
render();
});

