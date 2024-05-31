// Получение текущего пользователя
function getMySelf(gameInfo) {
    const myId = localStorage.getItem('socket-id');
    return gameInfo.connectedPlayers.find(player => player.id === myId) || null;
}

// Рендер списка пользователей
function renderUserList(userList, gameInfo) {
    window.gameInfo = gameInfo;
    log('RUN RENDER LIST11111111111111111111111111111111111', gameInfo);
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
        asideUserList.innerHTML = '';

        gameInfo.connectedUsers.forEach((u, i) => {
            const isActive = i == gameInfo.playerPointer;
            const isPlayer = gameInfo.connectedPlayers.some((p) => p.id == u.id);
            const playersIndexed = gameInfo.connectedPlayers.map((p, i) => {
                p.index = i;
                return p;
            })
            const player = playersIndexed.find((p) => p.id == u.id);

            if (isPlayer) u = gameInfo.connectedPlayers.filter((p) => p.id == u.id)[0]; // patch
            const isWinner = gameInfo.winners.some((p) => p.id == u.id);
            const you = gameInfo.currentUserId == u.id;
            const currentUser = localStorage.getItem('socket-id') == u.id;
            const easilyAccessiblePlayer = (user.position == u.position) && !currentUser

            const fightingBtn = `      <div class="button-group" style="width: 6rem">
            <button onclick="fighting('${u.id}')" type="button" class="btn btn-secondary btn-sm"> <img src="./images/fightButton.svg"
            title="Вызвать на boy" > </button>
            </div>
            `
            asideUserList.innerHTML += `
      <div class="user ${(currentUser) ? 'you-in-list' : ''} ${(isPlayer) ? 'player' : ''} ${u.dead ? 'dead' : ''}" id="x${u.id}">
           ${(isWinner) ? '<img class="winner" src="./images/final.jpg" alt="">' : ''} 
           <div class="username">
           ${player ? player.position : ''} &nbsp; 
           
           ${player ? chips[player.index] : ''}&nbsp; &nbsp; 
                ${u.username} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  
                 ${u.frontUser?.hitPoints || 30} см
           </div>
           ${(!you && easilyAccessiblePlayer && !user.fightingStepFlag) ? fightingBtn : ''}
      </div>
    `;
        });
    }
    //           <div class="avatar"></div> было  в шаблоне сверху

};



// Рендер текущего состояния пользователя
function render() {
    document.querySelector("#xp").innerHTML = user.hitPoints;
    document.querySelector("#moral").innerHTML = user.moral;
    document.querySelector("#armor").innerHTML = user.armor;
    document.querySelector("#steps").innerHTML = user.steps;
    document.querySelector("#weapon").innerHTML = user.weapon;
    document.querySelector("#dice").innerHTML = user.dice;

    const bombContainer = document.querySelector('#bomb-container');
    bombContainer.innerHTML = '';
    userBombs.forEach((b, i) => {
        bombContainer.innerHTML += `
            <div class="menu-bomb">
                <img src="./images/bomb.png" alt="anal destroyer">
                <span>${b.title}</span>
                <div class="button-group">
                    <button type="button" class="active" onclick="setBombmOnCell(${i})">
                        <img src="./images/trap.svg" alt="">
                    </button>
                </div>
            </div>
        `;
    });
}

// Обновление интерфейса
function updateTheInterface() {
    const gi = window.gameInfo;
    document.querySelector('#settings-username-btn').disabled = gi.isGameStarted;
}

// Установка имени пользователя
function setUserName() {
    const nameUser = document.querySelector('#nameForm input').value;
    localStorage.setItem("username", nameUser);
    setUsernameScreen.style.display = 'none';
    socket.emit('set-username', nameUser);
}

// Инициализация поля
function init() {
    const grid = document.querySelector('.grid');
    if (grid) {
        gameField.forEach(row => {
            row.forEach(cell => {
                const description = getCellDescription(cell);
                let classes = 'cell';
                description.effect.forEach(ef => {
                    if (ef.name === 'emptyHole') classes += ' empty-hole';
                    if (ef.name === 'armor') classes += ' armor';
                });
                grid.innerHTML += `
                    <div id="${cell}" class="${classes}" title="${description.description}"></div>
                `;
            });
        });
    }
}

// Анимация броска
function rollingAnimation() {
    illustration.style.backgroundImage = "url(./images/dice2.gif)";
}

// Результат броска
function rollingResult(number) {
    const images = {
        1: './images/num1.jpg',
        2: './images/num2.jpg',
        3: './images/num3.jpg'
    };
    illustration.style.backgroundImage = `url(${images[number]})`;
}

// Анимация действия
function actionAnimation(ill) {
    const images = {
        'skip-1': './images/skip1.gif',
        'add-step-1': './images/addstep1.jpg'
    };
    illustration.style.backgroundImage = `url(${images[ill]})`;
}

// Звук действия
function actionSound(sound) {
    const sounds = {
        'skip-1': './audio/skip-1.wav',
        'add-step-1': './audio/add-step-1.wav'
    };
    if (sounds[sound]) {
        addSound(sounds[sound], 0.1);
    }
}

// Выполнение хода
function run(n) {
    audio.currentTime = 0;
    user.steps--;
    audio.play();
    runButton.disabled = true;
    let number = Math.ceil(Math.random() * 3);
    if (n) number = n;
    socket.emit('rolling');
    setTimeout(() => {
        socket.emit('rolling-result', number);
        runButton.disabled = false;
    }, 1500);

    const opisanie = getCellDescription(user.position);
    let stop = false;
    opisanie.effect.forEach(ef => {
        if (typeof ef === 'string' && ef === 'reverse') {
            setTimeout(() => {
                user.position -= number;
                action(user.position);
            }, 1600);
            stop = true;
        }
    });

    if (!stop) {
        user.position += number;
        if (user.position > 94) user.position = 94;
        setTimeout(() => action(user.position), 1600);
    }
}

// Выполнение действия
async function action(n) {
    socket.emit('new-user-position', user);

    // Обработка бомб
    gameInfo.bombs.forEach(b => {
        if (user.position === b.position) {
            socket.emit('bomb-was-exploded', user);
            if (user.armor > 0) user.armor--;
            else if (b.bomb.name === 'damage' || b.bomb.name === 'mega-damage') user.hitPoints -= b.bomb.n;
            else if (b.bomb.name === 'amoral' || b.bomb.name === 'micro-amoral') user.moral -= b.bomb.n;
            else if (b.bomb.name === 'skip' || b.bomb.name === 'mega-skip') user.steps -= b.bomb.n;
            else if (b.bomb.name === 'reverse') {
                setTimeout(() => {
                    user.position -= b.bomb.n;
                    if (user.position < 1) user.position = 1;
                    action(user.position);
                }, 1600);
            }
        }
    });

    const opisanie = getCellDescription(n);
    descr.innerHTML = '';
    descr.style.backgroundImage = 'url(./images/glitch.gif)';
    await pause(1000);
    descr.style.backgroundImage = '';
    descr.innerHTML = opisanie.description;

    if (user.aids) {
        user.hitPoints--;
        const message = `${getUserName()} Заражен СПИДОМ, теряет 1 сантиметр`;
        socket.emit('master-message', message);
    }

    for (const ef of opisanie.effect) {
        if (typeof ef === 'object') {
            if (ef.name === 'minusXp') user.hitPoints -= ef.n;
            else if (ef.name === 'plusXp') user.hitPoints += ef.n;
            else if (ef.name === 'minusMoral') user.moral -= ef.n;
            else if (ef.name === 'plusMoral' || ef.name === 'plusMoral1') {
                user.moral += ef.n;
                socket.emit('new-user-position', user.position);
                if (ef.name === 'plusMoral1') addSound('./audio/rooster.wav', 0.1);
            }
            else if (ef.name === 'armor') {
                user.armor += ef.n;
                socket.emit('new-user-position', user.position);
                addSound('./audio/armor.mp3', 0.1);
            }
            else if (ef.name === 'emptyHole') user.position = ef.to;
            else if (ef.name === 'skip') user.steps--;
            else if (ef.name === 'fall') user.position = ef.to;
            else if (ef.name === 'final') final();
            else if (ef.name === 'addStep') user.steps += ef.n;
            else if (ef.name === 'AIDS') user.aids = true;

            if (ef.ill) {
                await pause(2000);
                actionAnimation(ef.ill);
            }
            actionSound(ef.sound);
        }
    }

    render();

    if (user.steps < 1) {
        document.querySelector('#run').disabled = true;
    }

    socket.emit('action-result', user);
}

// Финальная функция
function final() {
    socket.emit('winner', user);
    const winnerScreenNode = document.querySelector('.final-screen');
    winnerScreenNode.classList.remove("hide");
    setTimeout(() => {
        winnerScreenNode.classList.add("hide");
    }, 10000);
}

// Функции разработчика для установки позиции
function devSetPosition() {
    const cell = document.querySelector('#set-position input').value;
    user.position = +cell;
    moveUsers([user]);
    action(user.position);
}

function devAddPosition() {
    user.position++;
    moveUsers([user]);
    action(user.position);
}

function devAddPosition2() {
    user.position += 2;
    moveUsers([user]);
    action(user.position);
}

// Добавление звука
function addSound(path, volume = 1) {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(error => console.error('Audio play failed:', error));
}

// Отправка сообщения
function message(msg, effect) {
    const gm = document.querySelector('.global-message');
    const container = gm.querySelector('.text-container');
    const text = gm.querySelector('.text');
    text.innerHTML = msg;
    gm.style.display = 'flex';

    if (effect === 'your-step') {
        container.style.background = 'rgb(255 255 255 / 47%)';
        container.style.border = '5px green solid';
        text.style.color = '#004700';
        text.style.fontSize = '5rem';
        gm.style.transition = '.5s';
        setTimeout(() => {
            gm.style.transform = 'scale(3,3)';
            document.querySelector(".grid").style.borderColor = 'green';
        }, 1000);
    } else {
        gm.style.transform = 'scale(1)';
        container.style.background = 'rgb(255 255 255 / 47%)';
        container.style.border = '5px black solid';
        text.style.color = 'black';
        text.style.fontSize = '5rem';
    }

    setTimeout(() => {
        gm.style.display = 'none';
    }, 3000);
}

// Отправка сообщения в чат
function sendChatMessage(event) {
    event.preventDefault();
    const textarea = event.srcElement[0];
    if (!textarea.value) return;
    socket.emit('chat-message', textarea.value);
    textarea.value = '';
}

// Переключение настроек
function settingsToggle() {
    closeAllMenu('settings-menu');
    document.querySelector('.settings-menu').classList.toggle('open-menu');
    document.querySelector('#settings-username').innerHTML = localStorage.getItem("username");
}

// Переключение меню инвентаря
function staffToggle() {
    closeAllMenu('staff-menu');
    document.querySelector('.staff-menu').classList.toggle('open-menu');
}

// Закрытие всех меню кроме указанного
function closeAllMenu(dontTouch) {
    const settingsMenu = document.querySelector('.settings-menu');
    const staffMenu = document.querySelector('.staff-menu');
    if (dontTouch !== 'settings-menu') settingsMenu.classList.remove('open-menu');
    if (dontTouch !== 'staff-menu') staffMenu.classList.remove('open-menu');
}

// Редактирование имени пользователя
function editUsername() {
    const setUsernameScreen = document.querySelector('.set-username-screen');
    setUsernameScreen.style.display = 'flex';
    document.querySelector('#nameForm input').value = localStorage.getItem("username");
}

// Начало игры
function startGame() {
    addSound('./audio/start.wav', 0.1);
    setTimeout(() => {
        startButton.style.display = 'none';
        socket.emit('start-game-signal', localStorage.getItem("username"));
    }, 1000);
    startButton.style.backgroundImage = "url(./images/starting.gif)";
    startButton.style.backgroundSize = 'cover';
}

// Пропуск хода
function skip() {
    user.fightingStepFlag = false;
    socket.emit('skip-step', user);
    message('Ход завершён');
    document.querySelector('#run').disabled = true;
    document.querySelector('#skip').disabled = true;
    document.querySelector(".grid").style.borderColor = 'black';
}

// Проверка наличия имени пользователя в памяти
function checkUsernameInMemory() {
    const username = localStorage.getItem("username");
    if (!username) {
        setUsernameScreen.style.display = 'flex';
    } else {
        socket.emit('set-username', username);
    }
}

// Получение описания клетки
const getCellDescription = (cellNumber) => cellsDescription.find(cdo => cdo.number === cellNumber) || { effect: [], description: '' };

// Начало вечеринки
const party = () => {
    startGame();
    const bigButton = document.querySelector('.js-big-button');
    const partyScreen = document.querySelector('.start-game-screen');
    bigButton.classList.toggle('is-active');
    partyScreen.classList.toggle('is-active');
}

// Сброс игры
function reset() {
    socket.emit('reset');
}

// Перестройка игрового поля
function rebuildGameField(gameInfo) {
    moveUsers(gameInfo.connectedPlayers);
    addItemsOnMap(gameInfo);
}

// Очистка ячеек
function clearCells() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('you');
    });
}

// Перемещение пользователей
function moveUsers(players) {
    clearCells();
    players.forEach((p, i) => {
        const currentCell = document.getElementById(p.position);
        if (currentCell) {
            currentCell.innerHTML += chips[i];
            stickOutYou();
        }
    });
}

// Выделение текущего пользователя
function stickOutYou() {
    document.getElementById(user.position)?.classList.add("you");
}

// Добавление элементов на карту
function addItemsOnMap(gameInfo) {
    gameInfo.bombs.forEach(b => {
        const currentCell = document.getElementById(b.position);
        if (currentCell) {
            currentCell.innerHTML += `
                <img src="./images/bomb.png" class="cell-bomb">
            `;
        }
    });
}

// Установка таймера
let setTimer;
function gagarin(n, clb) {
    clearInterval(setTimer);
    const timerPlace = document.querySelector('.bottom-panel .illustration');
    setTimer = setInterval(() => {
        n--;
        timerPlace.innerHTML = `
            <div class="timer">${n}</div>
        `;
        if (n < 1) {
            clearInterval(setTimer);
            clb();
        }
    }, 1000);
}

// Установка бомбы на клетку
function setBombmOnCell(i) {
    const bomb = userBombs.splice(i, 1)[0];
    render();
    socket.emit('set-bomb-on-cell', { bomb });
}
