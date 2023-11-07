socket.on('new-all-message', (message) => {
    const asideChat = document.querySelector('.aside-chat');
    asideChat.innerHTML += `
    <div class="message">
          <div class="author">
            <div class="avatar"></div>
            <div class="username">${message.username}</div>
          </div>
          <div class="text">${message.text}</div>
        </div>
        `;
    asideChat.scroll({
      top: 99999900,
      left: 0,
      behavior: "smooth",
    });
  });