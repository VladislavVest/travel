const yourDick = document.querySelector('.left .dick');
const yourPartnerDick = document.querySelector('.right .dick');
// log(yourDick, yourPartnerDick);
let yourDickPower = 50;
let yourPartnerDickPower = 50;
let fighter1 = {}
let fighter2 = {}
function openArena(gameInfo) {
    log(gameInfo, 'problem');

    fighter1 = gameInfo.connectedPlayers.find((u) => u.id == gameInfo.fighting.activPlayer.id);
    fighter2 = gameInfo.connectedPlayers.find((u) => u.id == gameInfo.fighting.passivPlayer.id);
    log(fighter1, fighter2,'open arenaaaaaaaa');

    $("#name-fighter-1").innerHTML = fighter1.username;
    $("#name-fighter-2").innerHTML = fighter2.username;
    $("#id-fighter-1").innerHTML = fighter1.id;
    $("#id-fighter-2").innerHTML = fighter2.id;


    // log('JJJJJJJJJJJJJJJJJJJ', firstFighterUserName);

    const myId = localStorage.getItem('socket-id');
    const isSpectator = gameInfo.fighting.activPlayer.id != myId && gameInfo.fighting.passivPlayer.id != myId;
    // log('SPECTATOR', gameInfo.fighting.activPlayer.id != myId, gameInfo.fighting.passivPlayer.id != myId);
    // log('SPECTATOR', gameInfo.fighting.activPlayer.id, myId, gameInfo.fighting.passivPlayer.id , myId);
    // log(myId,gameInfo);
    const fightingScreen = document.querySelector('.fighting-screen');
    const fightingScreenCard = document.querySelector('.fighting-center-card');
    const fightingScreenCardSpectator = document.querySelector('.fighting-center-card-spectator');

    if (isSpectator) fightingScreenCardSpectator.classList.add('spectator');

    if (isSpectator) fightingScreenCard.classList.add('spectator');
    fightingScreen.style.display = 'flex';
    setInterval(() => {
        const rand1 = random(-50, 50);
        const rand2 = random(-50, 50);
        // log(rand1, 'DICKKKKKKKKKKKKKKKKKKKKKKK');
        yourDickPower += rand1;
        yourPartnerDickPower += rand2;
        if (yourDickPower < 10) yourDickPower = 10;
        if (yourPartnerDickPower < 10) yourPartnerDickPower = 10;
        if (yourDickPower > 100) yourDickPower = 100;
        if (yourPartnerDickPower > 100) yourPartnerDickPower = 100;
        // log( yourDickPower + "% !important",'yourDick.style.height!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
        // log( yourPartnerDickPower + "% !important",' yourPartnerDick.style.height!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

        yourDick.style.transform = `scale(1,${yourDickPower / 30}) translate(0rem, -5rem) `;
        yourPartnerDick.style.transform = `scale(1,${yourPartnerDickPower / 30}) translate(0rem, -5rem)`;
    }, 1000)
}


function fighting(partnerId) {

    clearInterval(setTimer);
    socket.emit('fighting-start', {
        activPlayerId: localStorage.getItem('socket-id'),
        passivPlayerId: partnerId,
    });

    // log(partnerId, 'ID С КЕМ ФАЙТ');


};

// fighting(); 
// log('FIGHTING USER POS', user.position, gameInfo, user);
// const otherPlayers = gameInfo.connectedPlayers.filter(fighter => gameInfo.currentUserId !== fighter.id);
// log('OTHER PLAYERS', otherPlayers);
// const easilyAccessiblePlayers = otherPlayers.filter(fighter => user.position == fighter.position);
// log('FIGHTTTTTTTTTTTTTTTT', easilyAccessiblePlayers);
// gameInfo.currentUserId==fighter.id
// user.position
// {
//     "id": "A8Tj7Q2ouwa3Y22AAAAG",
//     "username": "13e3",
//     "position": 0
// }
function getFightingResult() {
    var radios = document.querySelectorAll('input[type=radio][name="drone"]');
    var radios2 = document.querySelectorAll('input[type=radio][name="drone2"]');


    const mortalStrike = getSelectedRadioValue(radios);
    const protection = getSelectedRadioValue(radios2);

    const fightingData = {
        mortalStrike,
        protection,
        yourDickPower,
        yourPartnerDickPower
    }
    return fightingData;
}


function combat() {


    const fightingData = getFightingResult();


    socket.emit('fighting-strike', fightingData);

}

socket.on('open-arena', (gameInfo) => {
    openArena(gameInfo);

})
socket.on('open-arena-hit-button', () => {
    document.querySelector('#arena-hit-buttton').classList.remove('hide');
});

socket.on('get-fighting-data', (clb) => {
    log('get-fighting-data')
    const fightingData = getFightingResult();

    clb(fightingData);



})
addSound('./audio/hit.wav', 0.1);

socket.on('round-done', ({roundResult,roundId}) => {
    log(roundResult, 'ROUND RESULTTTT');
    const xpFighter1Node = document.querySelector('#xp-fighter');
    const xpFighter2Node = document.querySelector('#xp-fighter-2');
    const xpFighter1 = +xpFighter1Node.innerHTML;
    const xpFighter2 = +xpFighter2Node.innerHTML;

    roundResult.forEach(fighter => {
        if (fighter.id == fighter1.id && fighter.isDamage) {
            const newXpFighter1 = xpFighter1 - fighter.damage;
            xpFighter1Node.innerHTML = newXpFighter1;
            addSound('./audio/hit.wav', 0.1);
            const fighterObject = gameInfo.connectedUsers.find((p) => p.id = fighter.id);
            const message = `${fighterObject.username} Есть Пробитие, теряет ${fighter.damage} сантиметров`
            socket.emit('master-message-once', {message, roundId});
          
            socket.emit('round-result', {xpFighter1,xpFighter2});

        }
        if (fighter.id == fighter2.id && fighter.isDamage) {
            const newXpFighter2 = xpFighter2 - fighter.damage;
            xpFighter2Node.innerHTML = newXpFighter2;
            addSound('./audio/hit.wav', 0.1);
            const fighterObject = gameInfo.connectedUsers.find((p) => p.id = fighter.id);
            const message = `${fighterObject.username} Есть Пробитие, теряет ${fighter.damage} сантиметров`
            socket.emit('master-message-once', {message, roundId});

            socket.emit('round-result', {xpFighter1,xpFighter2});

        }


    });


    log('XPPPP', xpFighter1, xpFighter2);

    const roundScreenNode = document.querySelector('.round-screen');
    roundScreenNode.classList.remove('hide');
    setTimeout(() => {
        roundScreenNode.classList.add('hide');
    }, 3000)

});
socket.on('start-new-round',()=>{
    var radios = document.querySelector("#huey");
    var radios2 = document.querySelector("#huey3");
    radios.checked = true;
    radios2.checked = true;

// radios.click();
// radios2.click();

})




