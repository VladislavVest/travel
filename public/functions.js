function renderUserList(userList, gameInfo) {
    log('10.11.2023', userList, gameInfo);
    if (userList) {
        asideUserList.innerHTML = '';
        userList.forEach((user) => {
            asideUserList.innerHTML += `
      <div class="user" id="x${user.id}">
        <div class="avatar"></div>
        <div class="username">${user.username}</div>
      </div>
    `;
        });
    };
    if (gameInfo) {
        log('gameInfo logic');
        asideUserList.innerHTML = '';
        log('bagggggggggggggggggggggg', gameInfo);
        gameInfo.connectedUsers.forEach((user, i) => {
            const isActive = i == gameInfo.playerPointer;
            const isPlayer = gameInfo.connectedPlayers.some((p) => p.id == user.id);
            const currentUser = localStorage.getItem('socket-id') == user.id;
            asideUserList.innerHTML += `
      <div class="user ${(isActive) ? 'active-step' : ''} ${(isPlayer) ? 'player' : ''}" id="x${user.id}">
        <div class="avatar"></div>
        <div class="username">
        ${user.username}
        ${currentUser ? '(Это ты)' : ''}
        </div>
      </div>
    `;
        });
    }

};

function setUserName() {
    log('chek 1111');
    const nameUser = document.querySelector('#nameForm input').value;
    localStorage.setItem("username", nameUser);
    setUsernameScreen.style.display = 'none';
    socket.emit('set-username', username);
}

function render() {
    const xp = document.querySelector("#xp");
    xp.innerHTML = user.hitPoints;
    const moral = document.querySelector("#moral");
    moral.innerHTML = user.moral;
    const armor = document.querySelector("#armor");
    armor.innerHTML = user.armor;
    const steps = document.querySelector("#steps");
    steps.innerHTML = user.steps;
    const weapon = document.querySelector("#weapon");
    weapon.innerHTML = user.weapon;
    const dice = document.querySelector("#dice");
    dice.innerHTML = user.dice;
}

function init() {
    gameField.forEach((row, i) => {
        row.forEach((cell, ii) => {
            // const opisanie = cellsDescription.find(cdo => cdo.number == cell) || { description: '', effect: [] };
            const opisanie = getCellDescription(cell);
            let classes = 'cell';
            opisanie.effect.forEach((ef) => {
                if (ef.name == 'emptyHole') classes += ' empty-hole';
                if (ef.name == 'armor') classes += ' armor';
            });
            grid.innerHTML += `
        <div id="${cell}" class="${classes}" title="${opisanie.description}"></div>
        `
        })
    });

    const cells = document.querySelectorAll(".cell");
    cells[91 - 1].innerHTML = `
        <span class="material-symbols-outlined fishka">
             elderly
        </span>
        <span class="material-symbols-outlined fishka">
      elderly_woman
      </span>  
      <span class="material-symbols-outlined fishka">
      accessible
      </span>
      <span class="material-symbols-outlined fishka">
      accessible_forward
      </span>
    `;
    cells[90].classList.add("with-user");
};


function run() {
    audio.currentTime = 0;
    audio.play();
    illustration.style.backgroundImage = "url(./images/dice2.gif)";
    runButton.disabled = true;
    let number = Math.ceil(Math.random() * 3);
    switch (number) {
        case 1:
            setTimeout(() => {
                illustration.style.backgroundImage = "url(./images/num1.jpg)";
                runButton.disabled = false;
            }, 1500);
            break;
        case 2:
            setTimeout(() => {
                illustration.style.backgroundImage = "url(./images/num2.jpg)";
                runButton.disabled = false;
            }, 1500);
            break
        case 3:
            setTimeout(() => {
                illustration.style.backgroundImage = "url(./images/num3.jpg)";
                runButton.disabled = false;
            }, 1500);
            break;
    }
    const opisanie = getCellDescription(user.position);
    let stop = false;
    opisanie.effect.forEach((ef) => {
        if (typeof ef == 'string' && ef == 'reverse') {
            setTimeout(() => {
                user.position -= number;
                action(user.position)
            }, 1600);
            stop = true;
        };
    })

    if (!stop) {
        user.position += number;
        setTimeout(() => action(user.position), 1600);
    }
}

function action(n) {

    // moveUser();
    socket.emit('new-user-position', user.position);
    const opisanie = getCellDescription(n);
    descr.innerHTML = opisanie.description;
    opisanie.effect.forEach((ef) => {
        log(ef, typeof ef);
        if (typeof ef == 'string') {
        };
        if (typeof ef == 'object') {
            if (ef.name == 'minusXp') {
                if (user.armor > 0) user.armor--
                else user.hitPoints -= ef.n;
            };
            if (ef.name == 'plusXp') {
                user.hitPoints += ef.n
            };
            if (ef.name == 'minusMoral') {
                if (user.armor > 0) user.armor--
                else user.moral -= ef.n;
            };
            if (ef.name == 'plusMoral') {
                user.moral += ef.n
            };
            if (ef.name == 'fall') {
                user.position = ef.to;
                moveUser();
            }
            if (ef.name == 'vampire') {
            }
            if (ef.name == 'plusMoral1') {
                user.moral += ef.n
                moveUser();
                addSound('./audio/rooster.wav', 0.1);
            }
            if (ef.name == 'armor') {
                user.armor += ef.n
                moveUser();
                addSound('./audio/armor.mp3', 0.1);
            }
            if (ef.name == 'emptyHole') {
                user.position = ef.to;
                moveUser();
            }
            if (ef.name == 'skip') {
                if (user.armor > 0) user.armor--
                else user.steps -= ef.n;
            }
        }
    });
    render();
    //start timer to skip step
}

function devSetPosition() {
    const cell = document.querySelector('#set-position input').value;
    user.position = +cell;
    moveUser();
    action(user.position);
}

function devAddPosition() {
    user.position++;
    moveUser();
    action(user.position);
}

function devAddPosition2() {
    user.position = +user.position + 2;
    moveUser();
    action(user.position);
}

function addSound(path, volume = 1) {
    let audio = new Audio(path);
    audio.volume = volume;
    audio.play().then(() => {
        console.log('Audio played successfully');
    }).catch((error) => {
        console.error('Audio play failed:', error);
        // Здесь можно добавить логику восстановления или информировать пользователя
    });
}

function message(msg, effect) {
    const gm = document.querySelector('.global-message');
    const container = gm.querySelector('.text-container');
    const text = gm.querySelector('.text');
    text.innerHTML = msg;
    gm.style.display = 'flex';
    if (effect == 'your-step') {
        container.style.background = 'rgb(255 255 255 / 47%)';
        container.style.border = '5px green solid';
        text.style.color = '#004700';
        text.style.fontSize = '5rem';
        gm.style.transition = '.5s';
        setTimeout(() => {
            gm.style.transform = 'scale(3,3)';
            const grid = document.querySelector(".grid");
            grid.style.borderColor = 'green';
        }, 1000)
    } else {
        gm.style.transform = 'scale(1)';
        container.style.background = 'rgb(255 255 255 / 47%)';
        container.style.border = '5px black solid';
        text.style.color = 'black';
        text.style.fontSize = '5rem';
    }
    setTimeout(() => {
        gm.style.display = 'none';
    }, 3000)
}

function sendChatMessage(event) {
    event.preventDefault();
    const textarea = event.srcElement[0];
    if (!textarea.value) return;
    socket.emit('chat-message', textarea.value);
    textarea.value = '';
}

function settingsToggle() {
    const settingsMenu = document.querySelector('.settings-menu');
    settingsMenu.classList.toggle('open-settings');
    const username = localStorage.getItem("username");
    const settingsUsername = document.querySelector('#settings-username');
    settingsUsername.innerHTML = username;
}

function editUsername() {
    const setUsernameScreen = document.querySelector('.set-username-screen');
    const username = localStorage.getItem("username");
    setUsernameScreen.style.display = 'flex';
    // } else { socket.emit('set-username', username) }
    const nameUserInput = document.querySelector('#nameForm input');
    nameUserInput.value = username;
}

function startGame() {
    addSound('./audio/start.wav', 0.1);
    setTimeout(() => {
        startButton.style.display = 'none';
        const username = localStorage.getItem("username");
        socket.emit('start-game-signal', username);
    }, 1000);
    startButton.style.backgroundImage = "url(./images/starting.gif)";
    startButton.style.backgroundSize = 'cover';
}

function updateTheInterface() {
    const gi = window.gameInfo;
    document.querySelector('#settings-username-btn').disabled = (gi.isGameStarted) ? true : false;
}


function skip() {
    log('skip');
    socket.emit('skip-step');
    message('Ход завершён');
    document.querySelector('#run').disabled = true;
    document.querySelector('#skip').disabled = true;
    const grid = document.querySelector(".grid");
    grid.style.borderColor = 'black';
}

function checkUsernameInMemory() {
    const username = localStorage.getItem("username");
    if (!username) {
        setUsernameScreen.style.display = 'flex';
    } else { socket.emit('set-username', username) }
}

const getCellDescription = (cellNumber) => cellsDescription.find(cdo => cdo.number == cellNumber) || { effect: [], description: '' };

const party = () => {
    startGame();
    // const currentPartyStatus = document.querySelector('.js-status');
    const bigButton = document.querySelector('.js-big-button');
    const partyScreen = document.querySelector('.start-game-screen');
    if (bigButton.classList.contains('is-active')) {
        bigButton.classList.remove('is-active');
        partyScreen.classList.remove('is-active');
    } else {
        bigButton.classList.add('is-active');
        partyScreen.classList.add('is-active');
    }
}

function reset() {
    socket.emit('reset')
}

// function moveUser() {
//     const cells = document.querySelectorAll(".cell");
//     cells.forEach((cell) => {
//         cell.innerHTML = "";
//         cell.classList.remove('with-user');
//     })
//     const currentCell = document.getElementById(user.position);
//     currentCell.innerHTML += `
//       <span class="material-symbols-outlined fishka">
//       elderly
//       </span>
//       `
//     currentCell.classList.add("with-user");
// }

function moveUsers(players) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
        cell.innerHTML = "";
        cell.classList.remove('with-user');
    });
    players.forEach(p => {
        log('final etap',p);
        const currentCell = document.getElementById(p.position);
        currentCell.innerHTML += `
          <span class="material-symbols-outlined fishka">
          elderly
          </span>
          `
        currentCell.classList.add("with-user");
    });
}

