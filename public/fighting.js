const yourDick = document.querySelector('.left .dick');
const yourPartnerDick = document.querySelector('.right .dick');
let yourDickPower = 50;
let yourPartnerDickPower = 50;
let fighter1 = {};
let fighter2 = {};

// Функция для открытия арены и инициализации боевых данных
function openArena(gameInfo) {
    console.log(gameInfo, 'problem');

    // Инициализация здоровья бойцов
    const xpFighter1Node = document.querySelector('#xp-fighter');
    const xpFighter2Node = document.querySelector('#xp-fighter-2');
    xpFighter1Node.innerHTML = 30;
    xpFighter2Node.innerHTML = 30;

    // Поиск бойцов по их ID
    fighter1 = gameInfo.connectedPlayers.find(u => u.id == gameInfo.fighting.activPlayer.id);
    fighter2 = gameInfo.connectedPlayers.find(u => u.id == gameInfo.fighting.passivPlayer.id);
    console.log(fighter1, fighter2, 'open arena');

    // Обновление имен бойцов на экране
    document.querySelector("#name-fighter-1").innerHTML = fighter1.username;
    document.querySelector("#name-fighter-2").innerHTML = fighter2.username;

    const myId = localStorage.getItem('socket-id');
    const isSpectator = gameInfo.fighting.activPlayer.id != myId && gameInfo.fighting.passivPlayer.id != myId;

    const fightingScreen = document.querySelector('.fighting-screen');
    const fightingScreenCard = document.querySelector('.fighting-center-card');
    const fightingScreenCardSpectator = document.querySelector('.fighting-center-card-spectator');

    // Установка режима зрителя, если текущий пользователь не является участником боя
    if (isSpectator) {
        fightingScreenCardSpectator.classList.add('spectator');
        fightingScreenCard.classList.add('spectator');
    }
    fightingScreen.style.display = 'flex';

    // Анимация изменения силы бойцов
    setInterval(() => {
        const rand1 = random(-50, 50);
        const rand2 = random(-50, 50);
        yourDickPower = Math.min(Math.max(yourDickPower + rand1, 10), 100);
        yourPartnerDickPower = Math.min(Math.max(yourPartnerDickPower + rand2, 10), 100);

        yourDick.style.transform = `scale(1,${yourDickPower / 30}) translate(0rem, -5rem)`;
        yourPartnerDick.style.transform = `scale(1,${yourPartnerDickPower / 30}) translate(0rem, -5rem)`;
    }, 1000);
}

// Функция для начала боя
function fighting(partnerId) {
    user.fightingStepFlag = true;
    clearInterval(setTimer);
    socket.emit('fighting-start', {
        activPlayerId: localStorage.getItem('socket-id'),
        passivPlayerId: partnerId,
    });
}

// Функция для получения результатов боя
function getFightingResult() {
    const mortalStrike = getSelectedRadioValue(document.querySelectorAll('input[type=radio][name="drone"]'));
    const protection = getSelectedRadioValue(document.querySelectorAll('input[type=radio][name="drone2"]'));

    return {
        mortalStrike,
        protection,
        yourDickPower,
        yourPartnerDickPower
    };
}

// Функция для выполнения атаки
function combat(element) {
    element.style.display = 'none';
    setTimeout(() => {
        element.style.display = 'block';
    }, Math.round(Math.random() * 4000 + 3000));

    const fightingData = getFightingResult();
    socket.emit('fighting-strike', fightingData);
}

// Обработчики сокетов
socket.on('open-arena', gameInfo => openArena(gameInfo));
socket.on('open-arena-hit-button', () => document.querySelector('#arena-hit-buttton').classList.remove('hide'));

socket.on('get-fighting-data', clb => {
    const fightingData = getFightingResult();
    clb(fightingData);
    addSound('./audio/hit.wav', 0.1);
});

socket.on('round-done', ({ roundResult, roundId }) => {
    console.log(roundResult, 'ROUND RESULT');
    const xpFighter1Node = document.querySelector('#xp-fighter');
    const xpFighter2Node = document.querySelector('#xp-fighter-2');
    let xpFighter1 = +xpFighter1Node.innerHTML;
    let xpFighter2 = +xpFighter2Node.innerHTML;

    roundResult.forEach(fighter => {
        let fighterNode, newXp, messageId;
        if (fighter.id === fighter1.id) {
            fighterNode = xpFighter1Node;
            newXp = xpFighter1 - fighter.damage;
            messageId = '-1';
        } else if (fighter.id === fighter2.id) {
            fighterNode = xpFighter2Node;
            newXp = xpFighter2 - fighter.damage;
            messageId = '-2';
        }

        if (fighter.isDamage) {
            fighterNode.innerHTML = newXp;
            addSound('./audio/hit.wav', 0.1);
            const message = `${fighter.id === fighter1.id ? fighter1.username : fighter2.username} Есть Пробитие, теряет ${fighter.damage} сантиметров`;
            socket.emit('master-message-once', { message, roundId });
            if (newXp <= 0) {
                const deathMessage = `${fighter.id === fighter1.id ? fighter1.username : fighter2.username} достойно принял кончину`;
                socket.emit('master-message-once', { deathMessage, roundId: roundId + messageId });
            }
        } else {
            const missMessage = `${fighter.id === fighter1.id ? fighter1.username : fighter2.username} по усам текло а в рот не попало`;
            socket.emit('master-message-once', { missMessage, roundId: roundId + messageId });
        }

        socket.emit('round-result', { xpFighter1, xpFighter2 });
    });

    if (xpFighter1 <= 0 || xpFighter2 <= 0) {
        socket.emit('end-boy', { newXpFighter1: xpFighter1, newXpFighter2: xpFighter2, fighterObject1: fighter1, fighterObject2: fighter2 });
    }

    const roundScreenNode = document.querySelector('.round-screen');
    roundScreenNode.classList.remove('hide');
    setTimeout(() => {
        roundScreenNode.classList.add('hide');
    }, 3000);
});

socket.on('start-new-round', () => {
    document.querySelector('input[type=radio][name="drone"]:checked').checked = false;
    document.querySelector('input[type=radio][name="drone2"]:checked').checked = false;
});

socket.on('end-of-the-fight', () => {
    const fightingScreen = document.querySelector('.fighting-screen');
    fightingScreen.style.display = 'none';
    if (user.hitPoints <= 0) {
        user.steps = -300;
        setTimeout(() => {
            skip();
        }, 3000);
    }
});
