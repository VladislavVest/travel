const socket = io(); // Initialize socket connection

// DOM elements
const asideUserList = document.querySelector('.aside-userlist');
const setUsernameScreen = document.querySelector('.set-username-screen');
const grid = document.querySelector(".grid");
const audio = document.getElementById("audio");
const illustration = document.querySelector(".illustration");
const runButton = document.querySelector("#run");
const startButton = document.querySelector('.start-game-screen');
const img = document.createElement('img');
const descr = document.querySelector("#descr");

// User state
let timerCounter = 0;
const user = {
    position: 1,
    hitPoints: 30,
    moral: 10,
    armor: 0,
    steps: 0,
    weapon: 2,
    dice: 0,
    fightingStepFlag: false
};
let gameInfo = {};

// Socket event listeners
socket.on('force-front-restart', () => location.reload()); // Restart all fronts if backend restarts

socket.on('rolling-all', () => rollingAnimation()); // Trigger rolling animation

socket.on('rolling-result-all', (number) => rollingResult(number)); // Display rolling result

socket.on("refresh-users-list", (userList) => renderUserList(userList)); // Render user list

socket.on('your-id', (id) => { localStorage.setItem('socket-id', id) }); // Store socket ID in local storage

socket.on('game-over', () => {
    log2('финальная заставка')
    const overScreenNode = document.querySelector('.game-over');
    overScreenNode.classList.remove("hide");
});

socket.on('game-over-for-one', async () => {
    const overOne = document.querySelector('.game-over-for-one');
    overOne.classList.remove("hide");
    overOne.style.backgroundImage = "url(./images/overcum2.gif)"; // Display initial image
    addSound('./audio/over1.mp3', 0.5);
    await pause(8000);
    overOne.style.backgroundImage = "url(./images/overcum3.gif)"; // Change image
    await pause(5000);
    overOne.style.backgroundImage = "url(./images/overcum4.gif)"; // Change image again
    await pause(15000);
    overOne.classList.add("hide");
});

socket.on('refresh-game-state', (_gameInfo) => {
    gameInfo = _gameInfo;
    renderUserList(null, gameInfo); // Render user list with game info

    log('9999999999999999', gameInfo, localStorage.getItem('socket-id'))
    const currentUser = gameInfo.connectedPlayers.find((u) => u.id == localStorage.getItem('socket-id'))
    log('KURRRRRRRRRRrrnet USER)', currentUser);

    if (currentUser && currentUser.frontUser.hitPoints) {
        user.hitPoints = currentUser.frontUser.hitPoints;
    }

    render();

    if (gameInfo.isGameStarted) {
        const partyScreen = document.querySelector('.start-game-screen');
        if (partyScreen) {
            partyScreen.style.display = 'none';
        }
    }
    
    rebuildGameField(gameInfo); // Rebuild game field with updated game info
});

socket.on('bomb-exploaded-for-all', async ({ exploadedBombs, user }) => {
    const animationNode = document.querySelector('.animation-container');
    const imageNode = animationNode.querySelector('img');
    imageNode.src = './images/bombbefore.gif'; // Initial bomb image
    animationNode.style.display = 'flex';
    await pause(3000);
    imageNode.src = './images/bombafter.gif'; // Bomb after explosion image
    await pause(3500);
    animationNode.style.display = 'none';
});

// Initial render and setup
render();
init();
checkUsernameInMemory();
