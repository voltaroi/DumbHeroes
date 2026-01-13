const express = require('express');
const app = express();
const path = require('path');

const io = require('socket.io')(2001, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

/* ================= MAP ================= */

let mapSelected;

const CELL_SIZE = 96;

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,1,0,1,1,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,1,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,1,0,1,1,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,1],
    [1,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,0,1,0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const map2 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,0,1],
    [1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

init();

function init() {
    let rand = Math.random();
    if (rand < 0.5) {
        mapSelected = map;
    } else {
        mapSelected = map2;
    }
}

/* ================= PLAYER ================= */

class Player {
    constructor(id, pseudo) {
        this.id = id;
        this.pseudo = pseudo;

        this.position = { left: 288, top: 288 };
        this.size = { width: 17, height: 17 };

        this.movement = { up: false, down: false, left: false, right: false };

        this.health = 100;
        this.mana = 100;

        this.hero = "";
        this.isDashing = false;
        this.dashCooldown = 0;
    }
}

/* ================= COLLISION ================= */

function isColliding(x, y, size) {
    const left = Math.floor(x / CELL_SIZE);
    const right = Math.floor((x + size.width - 1) / CELL_SIZE);
    const top = Math.floor(y / CELL_SIZE);
    const bottom = Math.floor((y + size.height - 1) / CELL_SIZE);

    if (
        left < 0 || right >= mapSelected[0].length ||
        top < 0 || bottom >= mapSelected.length
    ) return true;

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            if (mapSelected[row][col] === 1) return true;
        }
    }

    return false;
}

/* ================= GAME LOOP ================= */

const playerList = {};

setInterval(() => {
    let numPlayers = Object.keys(playerList).length;
    let numPlayerDead = 0;
    Object.values(playerList).forEach(player => {
        if(player.life <= 0){
             numPlayerDead += 1;
            return;
        }
        let speed = player.isDashing ? 25 : 5;

        let newX = player.position.left;
        let newY = player.position.top;

        if (player.movement.left) newX -= speed;
        if (player.movement.right) newX += speed;
        if (player.movement.up) newY -= speed;
        if (player.movement.down) newY += speed;

        if (!isColliding(newX, player.position.top, player.size)) {
            player.position.left = newX;
        }

        if (!isColliding(player.position.left, newY, player.size)) {
            player.position.top = newY;
        }

        if (player.dashCooldown > 0) {
            player.dashCooldown -= 50;
        }
    });

    if(numPlayers - 1 === numPlayerDead && numPlayers > 1){
        console.log("Resetting game...");
        Object.values(playerList).forEach(player => {
            player.position = { left: 288, top: 288 };
            player.health = 100;
            player.mana = 100;
            player.isDashing = false;
            player.dashCooldown = 0;
        });

        init();
    }

    io.emit('RC_UpdatePositions', playerList);
}, 50);

/* ================= SOCKET ================= */

io.on('connection', socket => {
    console.log('User connected:', socket.id);

    socket.on('RS_Login', data => {
        let canLogin = true;

        Object.values(playerList).forEach(p => {
            if (p.pseudo === data.pseudo) canLogin = false;
        });

        if (!canLogin) {
            socket.emit('RC_LoginError', { message: 'Pseudo already taken' });
            return;
        }

        const player = new Player(socket.id, data.pseudo);

        const rand = Math.random();
        if (rand < 0.25) player.hero = "Teophile";
        else if (rand < 0.5) player.hero = "Albert";
        else if (rand < 0.75) player.hero = "Didier";
        else player.hero = "Norbert";

        playerList[socket.id] = player;

        socket.emit('RC_Login', {
            id: socket.id,
            pseudo: player.pseudo,
            hero: player.hero,
            map: mapSelected,
            cellSize: CELL_SIZE
        });

        console.log('Player logged in:', player.pseudo);
    });

    socket.on('RS_Move', data => {
        if (playerList[socket.id]) {
            playerList[socket.id].movement = data;
        }
    });

    socket.on('RS_Dash', () => {
        const player = playerList[socket.id];
        if (!player) return;

        if (
            player.dashCooldown <= 0 &&
            (player.movement.up || player.movement.down || player.movement.left || player.movement.right)
        ) {
            player.isDashing = true;
            player.dashCooldown = 2000;

            setTimeout(() => {
                if (playerList[socket.id]) {
                    playerList[socket.id].isDashing = false;
                }
            }, 300);
        }
    });

    socket.on('disconnect', () => {
        delete playerList[socket.id];
        console.log('User disconnected:', socket.id);
    });
});

console.log('Server running on port 2001');
