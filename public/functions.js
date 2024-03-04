function getMySelf(gameInfo) {
    const myId = localStorage.getItem('socket-id');
    let mySelf = null;
    gameInfo.connectedPlayers.forEach((player) => {
        if (player.id == myId) mySelf = player;
    })
    return mySelf
}




function renderUserList(userList, gameInfo) {
    // log('RUN RENDER LIST',gameInfo);
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

            const fightingBtn = `<button onclick="fighting('${u.id}')" type="button" class="btn btn-secondary btn-sm">Fight</button>`
            asideUserList.innerHTML += `
      <div class="user ${(currentUser) ? 'you-in-list' : ''} ${(isPlayer) ? 'player' : ''} ${u.dead ? 'dead' : ''}" id="x${u.id}">
           ${(isWinner) ? '<img class="winner" src="./images/final.jpg" alt="">' : ''} 
           <div class="username">
           ${player ? player.position : ''} &nbsp; 
           
           ${player ? chips[player.index] : ''}&nbsp; &nbsp; 
                ${u.username} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  
                 ${u.frontUser?.hitPoints || 30} см
           </div>
           ${(!you && easilyAccessiblePlayer) ? fightingBtn : ''}
      </div>
    `;
        });
    }
    //           <div class="avatar"></div> было  в шаблоне сверху

};


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

    const bombContainer = document.querySelector('#bomb-container');
    bombContainer.innerHTML = '';
    userBombs.forEach((b, i) => {
        bombContainer.innerHTML += `
        <div class="menu-bomb">
         <img src="./images/bomb.png" alt="anal destroyer">
         <span> ${b.title} </span>
         <div class="button-group"><button type="button" class="active" onclick="setBombmOnCell(${i})"> <img src="./images/trap.svg" alt=""></button></div>
        </div>
        `
    });
};

function updateTheInterface() {
    const gi = window.gameInfo;
    document.querySelector('#settings-username-btn').disabled = (gi.isGameStarted) ? true : false;
};


function setUserName() {
    const nameUser = document.querySelector('#nameForm input').value;
    localStorage.setItem("username", nameUser);
    setUsernameScreen.style.display = 'none';
    socket.emit('set-username', username);
};



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
};

function rollingAnimation() {
    illustration.style.backgroundImage = "url(./images/dice2.gif)";
}

function rollingResult(number) {
    switch (number) {
        case 1:
            illustration.style.backgroundImage = "url(./images/num1.jpg)";
            break;
        case 2:
            illustration.style.backgroundImage = "url(./images/num2.jpg)";
            break
        case 3:
            illustration.style.backgroundImage = "url(./images/num3.jpg)";
            break;
    }
}

function actionAnimation(ill) {
    switch (ill) {
        case 'skip-1':
            illustration.style.backgroundImage = "url(./images/skip1.gif)";
            break;
        case 'add-step-1':
            illustration.style.backgroundImage = "url(./images/addstep1.jpg)";
            break;
    }
};

function actionSound(sound) {
    switch (sound) {
        case 'skip-1':
            addSound('./audio/skip-1.wav', 0.1);
            break;
        case 'add-step-1':
            addSound('./audio/add-step-1.wav', 0.1);

    }
}


function run(n) {
    audio.currentTime = 0;
    user.steps--;
    audio.play();
    // illustration.style.backgroundImage = "url(./images/dice2.gif)";
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
        if (user.position > 94) user.position = 94;
        setTimeout(() => action(user.position), 1600);
    }
};

async function action(n) {

    // moveUser();
    socket.emit('new-user-position', user);

    // { bomb: { name: 'damage', n: 1, title: '- 1 HP' }, position: 4 }
    gameInfo.bombs.forEach((b) => {
        if (user.position == b.position) {
            socket.emit('bomb-was-exploded', user);

            if (b.bomb.name == 'damage') {
                if (user.armor > 0) user.armor--
                else user.hitPoints -= b.bomb.n;
            };
            if (b.bomb.name == 'mega-damage') {
                if (user.armor > 0) user.armor--
                else user.hitPoints -= b.bomb.n;
            };
            if (b.bomb.name == 'amoral') {
                if (user.armor > 0) user.armor--
                else user.moral -= b.bomb.n;
            };
            if (b.bomb.name == 'micro-amoral') {
                if (user.armor > 0) user.armor--
                else user.moral -= b.bomb.n;
            };
            if (b.bomb.name == 'skip') {
                if (user.armor > 0) user.armor--
                else user.steps -= b.bomb.n;
            };
            if (b.bomb.name == 'mega-skip') {
                if (user.armor > 0) user.armor--
                else user.steps -= b.bomb.n;
            };
            // if (b.bomb.name == 'slow') {
            //     if (user.armor > 0) user.armor--
            //     else user.steps -= b.bomb.n;
            // };
            if (b.bomb.name == 'reverse') {
                if (user.armor > 0) user.armor--
                else setTimeout(() => {
                    user.position -= b.bomb.n;
                    if (user.position < 1) user.position = 1;
                    action(user.position)
                }, 1600);                                            //проверить очередность кода после сет таймаута 
            };

        }



    });



    const opisanie = getCellDescription(n);
    descr.innerHTML = '';
    descr.style.backgroundImage = 'url(./images/glitch.gif)';
    await pause(1000);
    descr.style.backgroundImage = '';
    descr.innerHTML = opisanie.description;
    opisanie.effect.forEach(async (ef) => {
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
                socket.emit('new-user-position', user.position);
                ;
            }
            if (ef.name == 'vampire') {
            }
            if (ef.name == 'plusMoral1') {
                user.moral += ef.n
                socket.emit('new-user-position', user.position);
                ;
                addSound('./audio/rooster.wav', 0.1);
            }
            if (ef.name == 'armor') {
                user.armor += ef.n
                socket.emit('new-user-position', user.position);
                ;
                addSound('./audio/armor.mp3', 0.1);
            }
            if (ef.name == 'emptyHole') {
                user.position = ef.to;
                socket.emit('new-user-position', user.position);
                ;
            }
            if (ef.name == 'skip') {
                if (user.armor > 0) user.armor--
                else user.steps--;

            };

            if (user.position > 94) user.position = 94;
            if (ef.name == 'final') final();

            if (ef.name == 'addStep') {
                user.steps += ef.n;
            };

            if (ef.ill) {
                await pause(2000);
                actionAnimation(ef.ill);
            };
            actionSound(ef.sound);
        }
        // if (user.position < 9) {
        //     user.position = 88;
        // }
    });
    render();
    //start timer to skip step
    if (user.steps < 1) {
        document.querySelector('#run').disabled = true;
        // gagarin(10, skip);
    }

    socket.emit('action-result', user);
}

function final() {
    alert("Вы победили!!!");
    socket.emit('winner', user);
}



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
    user.position = +user.position + 2;
    moveUsers([user]);
    action(user.position);
}

function addSound(path, volume = 1) {
    let audio = new Audio(path);
    audio.volume = volume;
    audio.play().then(() => {
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
    closeAllMenu('settings-menu');
    const settingsMenu = document.querySelector('.settings-menu');
    settingsMenu.classList.toggle('open-menu');
    const username = localStorage.getItem("username");
    const settingsUsername = document.querySelector('#settings-username');
    settingsUsername.innerHTML = username;
}
function staffToggle() {
    closeAllMenu('staff-menu');
    const staffMenu = document.querySelector('.staff-menu');
    staffMenu.classList.toggle('open-menu');
}
function closeAllMenu(dontTouch){
    const settingsMenu = document.querySelector('.settings-menu');
    const staffMenu = document.querySelector('.staff-menu');
    if (dontTouch != 'settings-menu') settingsMenu.classList.remove('open-menu');
    if (dontTouch != 'staff-menu')staffMenu.classList.remove('open-menu');


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



function skip() {
    // clearInterval(setTimer);
    socket.emit('skip-step', user);
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
};

function reset() {
    socket.emit('reset')
};

function rebuildGameField(gameInfo) {
    moveUsers(gameInfo.connectedPlayers);
    addItemsOnMap(gameInfo);
};

function clearCells() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
        cell.innerHTML = "";
        cell.classList.remove('you');
    });

};


function moveUsers(players) {
    clearCells();
    players.forEach((p, i) => {
        const currentCell = document.getElementById(p.position);
        currentCell.innerHTML += chips[i];
        // currentCell.classList.add("you");
    });
    stickOutYou();
};


function stickOutYou() {
    // clearCells();
    const cell = document.getElementById(user.position);
    // log(cell);
    cell.classList.add("you");

};


function addItemsOnMap(gameInfo) {
    gameInfo.bombs.forEach((b) => {
        log('fix bomb', b)
        const currentCell = document.getElementById(b.position); ///////////////////setbomb on cell
        currentCell.innerHTML += `
   <img src="./images/bomb.png" class="cell-bomb">
   `
    });

};

let setTimer;

function gagarin(n, clb) {
    clearInterval(setTimer);
    const timerPlace = document.querySelector('.bottom-panel .illustration');
    setTimer = setInterval(() => {
        n--;
        timerPlace.innerHTML = `
  <div class="timer">${n} </div>
  `
        if (n < 1) {
            clearInterval(setTimer);
            clb();
        }
    }, 1000);
};

function setBombmOnCell(i) {
    const bomb = userBombs.splice(i, 1)[0];
    render();
    socket.emit('set-bomb-on-cell', { bomb });
}