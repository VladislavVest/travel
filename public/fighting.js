const yourDick = document.querySelector('.left .dick');
const yourPartnerDick = document.querySelector('.right .dick');
// log(yourDick, yourPartnerDick);
let yourDickPower = 50;
let yourPartnerDickPower = 50;


function openArena(gameInfo) {

    const firstFighterUserName = gameInfo.connectedPlayers.find((u)=>u.id == gameInfo.fighting.activPlayer.id).username;
    const secondFighterUserName = gameInfo.connectedPlayers.find((u)=>u.id == gameInfo.fighting.passivPlayer.id).username;
    $("#name-fighter-2").innerHTML = secondFighterUserName;
    $("#name-fighter-1").innerHTML = firstFighterUserName;


    // log('JJJJJJJJJJJJJJJJJJJ', firstFighterUserName);

    const myId =  localStorage.getItem('socket-id');
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
        activPlayer: localStorage.getItem('socket-id'),
        passivPlayer: partnerId,
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
     

    const fightingData =  getFightingResult();


    socket.emit('fighting-strike', fightingData);

}

socket.on('open-arena', (gameInfo) => { 
    openArena(gameInfo);

})
socket.on('open-arena-hit-button',()=>{
   document.querySelector('#arena-hit-buttton').classList.remove ('hide');
});

socket.on('get-fighting-data',(clb)=>{
    log('get-fighting-data')
    const fightingData =  getFightingResult();

clb(fightingData);


})


