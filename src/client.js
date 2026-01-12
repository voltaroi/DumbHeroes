import { initNetwork } from "./network.js";
import { Game } from "./game.js";

const game = new Game();

const loginScreen = document.createElement('div');
loginScreen.id = 'loginScreen';

const nameInput = document.createElement('input');
nameInput.type = 'text';
nameInput.id = 'nameInput';
nameInput.placeholder = 'Enter your name';

const loginButton = document.createElement('button');
loginButton.id = 'loginButton';
loginButton.textContent = 'Login';

const canvas = document.createElement('canvas');
canvas.id = 'gameCanvas';

loginScreen.appendChild(nameInput);
loginScreen.appendChild(loginButton);

const gameContainer = document.getElementById('gameContainer');
gameContainer.appendChild(loginScreen);
gameContainer.appendChild(canvas);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
initNetwork(game);

loginButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) return;

    game.socket.emit("RS_Login", { pseudo: name });
});

game.socket.on("RC_Login", ({ pseudo }) => {
    document.getElementById('loginScreen').style.display = 'none';

    let gameScreen = document.getElementById('gameScreen');
    if (!gameScreen) {
        gameScreen = document.createElement('div');
        gameScreen.id = 'gameScreen';
        document.body.appendChild(gameScreen);
    }

    gameScreen.style.display = 'block';
    gameScreen.innerHTML = `<h1>Welcome, ${pseudo}!</h1>`;
});

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
