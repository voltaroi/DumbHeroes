import { initNetwork } from "./network.js";
import { Game } from "./game.js";

const game = new Game();
initNetwork(game);
game.init();
