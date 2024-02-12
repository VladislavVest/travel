socket.on('open-step', (gameInfo) => {

  const mySelf = getMySelf(gameInfo);
  if (mySelf.dead) {
    alert('autoskip');
    skip();
  }

  log('open-step', gameInfo);
  const runBut = document.querySelector('#run');
  runBut.disabled = false;
  setTimeout(() => {
    const skipBut = document.querySelector('#skip');
    skipBut.disabled = false;
  }, 2000)
  user.steps++;
  message('Твой ход', 'your-step');
  renderUserList(null, gameInfo);
  render();
  clearCells();
  stickOutYou();
  if (user.steps < 1) {
    document.querySelector('#run').disabled = true;
    // gagarin(10, skip);
  };

  const id = localStorage.getItem('socket-id');

});
