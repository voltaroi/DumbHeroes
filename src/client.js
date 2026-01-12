//import { initNetwork } from "./network";
//import { Game } from "./game";


const canvas = document.getElementById('gameCanvas');
const nameInput = document.getElementById('nameInput');
const loginButton = document.getElementById('loginButton');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

loginButton.addEventListener('click', () => {
    const name = nameInput.value;
});

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

//initNetwork(game);



