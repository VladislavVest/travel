function fighting() {
const fightingScreen = document.querySelector('.fighting-screen');
fightingScreen.style.display = 'flex';
clearInterval(setTimer);

};


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