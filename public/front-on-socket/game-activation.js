// Слушатель для события "game-activation"
socket.on('game-activation', (gameInfo) => {
  log(gameInfo); // Логируем полученную информацию о игре
  window.gameInfo = gameInfo; // Сохраняем информацию о игре в глобальной переменной
  updateTheInterface(); // Обновляем интерфейс
  startButton.style.display = 'none'; // Скрываем кнопку старта
  renderUserList(null, gameInfo); // Отрисовываем список пользователей

  // Добавляем случайные бомбы пользователю
  for (let i = 0; i < 2; i++) {
    const rand = random(0, bombs.length - 1); // Генерируем случайное число в пределах длины массива bombs
    userBombs.push(bombs[rand]); // Добавляем бомбу в массив userBombs
  }

  render(); // Отрисовываем обновления на экране
});
