const yourDick = document.querySelector('.left .dick');
const yourPartnerDick = document.querySelector('.right .dick');
log(yourDick, yourPartnerDick);
let yourDickPower = 50;
let yourPartnerDickPower = 50;

function openArena() {
    const fightingScreen = document.querySelector('.fighting-screen');
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
   
    log(partnerId, 'ID С КЕМ ФАЙТ');


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
function combat() {
    var radios = document.querySelectorAll('input[type=radio][name="drone"]');
    var radios2 = document.querySelectorAll('input[type=radio][name="drone2"]');


    const mortalStrike = getSelectedRadioValue(radios);
    log(mortalStrike, yourDickPower, 'YDARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');
    const protection = getSelectedRadioValue(radios2);
    log(protection, yourPartnerDickPower, 'DEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFf');

    const fightingData = {
        mortalStrike,
        protection,
        yourDickPower,
        yourPartnerDickPower
    }


    socket.emit('fighting-strike', fightingData);

}

socket.on('open-arena', (gameInfo) => { 
    openArena();
})