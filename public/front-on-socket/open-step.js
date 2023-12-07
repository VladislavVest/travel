socket.on('open-step', (gameInfo) => {
  const runBut = document.querySelector('#run');
  runBut.disabled = false;
  const skipBut = document.querySelector('#skip');
  skipBut.disabled = false;
  user.steps++;
  message('Твой ход', 'your-step');
  renderUserList(null, gameInfo);
  render();
  clearCells();
  stickOutYou();
  if (user.steps < 1) {
    document.querySelector('#run').disabled = true;
    gagarin(10, skip);
  };
});
