socket.on('open-step', (gameInfo) => {

  log('open-step', gameInfo);
  const mySelf = getMySelf(gameInfo);
  log(mySelf);
  if (mySelf.dead) {
    setTimeout(() => {
      alert('autoskip');
      skip();
    }, 1500)

  }///////////////////////////////////////////////////////////////////////ПРОЛОГИРОВАТЬ!!!!!!!!!!!!!!!!111 не работает возомжно ошибка в майселф

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
