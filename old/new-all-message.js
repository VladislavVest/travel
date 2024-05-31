socket.on('open-step', (gameInfo) => {
  const mySelf = getMySelf(gameInfo);

  // Если игрок мёртв или победил, автоматически пропускаем ход
  if (mySelf.dead || mySelf.winner) {
    setTimeout(skip, 1500);
    return;
  }

  const runButton = document.querySelector('#run');
  const skipButton = document.querySelector('#skip');

  // Проверяем, что кнопки существуют на странице
  if (runButton && skipButton) {
    runButton.disabled = false;

    // Активируем кнопку пропуска через 2 секунды
    setTimeout(() => {
      skipButton.disabled = false;
    }, 2000);

    user.steps++;
    message('Твой ход', 'your-step');
    renderUserList(null, gameInfo);
    render();
    clearCells();
    stickOutYou();

    // Отключаем кнопку "Run", если шагов меньше 1
    if (user.steps < 1) {
      runButton.disabled = true;
    }
  }
});
