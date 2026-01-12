import { initNetwork } from "./network";
import { Game } from "./game";


const canvas = document.getElementById('gameCanvas');
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

initNetwork(game);

