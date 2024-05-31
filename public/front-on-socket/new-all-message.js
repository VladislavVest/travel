socket.on('new-all-message', (message) => {
  const asideChat = document.querySelector('.aside-chat');

  // Добавляем новое сообщение в чат, используя шаблонный литерал
  asideChat.innerHTML += `
  <div class="message ${message.style}">
      <div class="author">
          <div class="avatar"></div>
          <div class="username">${message.username}</div>
      </div>
      <div class="text">${message.text}</div>
  </div>
  `;

  // Скроллим чат к последнему сообщению
  asideChat.scroll({
      top: asideChat.scrollHeight,
      left: 0,
      behavior: "smooth",
  });
});
