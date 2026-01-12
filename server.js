const app = require('express')();

const fs = require('fs');
const path = require('path');

const io = require('socket.io')(2001, {
    cors: {
        origin: "http://127.0.0.1",
        methods: ["GET", "POST"],
    }
});

//Pour que le serveur ce connecte a un autre serveur
// const clientio = require('socket.io-client');
// let server = clientio("http://90.107.81.168:2000");

app.get('/', function(req,res){

    const options = {
        root: path.join(__dirname)
    }
    var fileName = 'index.html';
    res.sendFile(fileName,options);

});

let map = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,1],
    [1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1],
    [1,0,1,1,0,0,0,0,1,1],
    [1,0,0,1,0,0,1,0,1,1],
    [1,0,0,1,0,0,1,0,0,1],
    [1,1,0,1,1,0,1,0,0,1],
    [1,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1],
];

class Player {
    constructor(id, pseudo){
        this.id = id;
        this.pseudo = pseudo;
        this.position = { top: 0, left: 0 };
        this.movement = { up: false, down: false, left: false, right: false };
        this.health = 100;
        this.mana = 100;
        this.size = { width: 5, height: 5};
        this.heroes = "";
        this.isDashing = false;
        this.dashCooldown = 0;
    }
};

function isColliding(x, y, size) {
    const cellSize = 32;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    const gridW = Math.floor((x + size.width) / cellSize);
    const gridH = Math.floor((y + size.height) / cellSize);
    
    if (gridX < 0 || gridY < 0 || gridW >= map[0].length || gridH >= map.length) {
        return true;
    }
    
    for (let row = gridY; row <= gridH; row++) {
        for (let col = gridX; col <= gridW; col++) {
            if (map[row] && map[row][col] === 1) {
                return true;
            }
        }
    }
    
    return false;
}

let playerList = {};

setTimeout(() => {
    Object.values(playerList).forEach(player => {
        let newX = player.position.left;
        let newY = player.position.top;
        let speed = player.isDashing ? 25 : 5;
        
        switch(true){
            case player.movement.up:
                newY -= speed;
                break;
            case player.movement.down:
                newY += speed;
                break;
            case player.movement.left:
                newX -= speed;
                break;
            case player.movement.right:
                newX += speed;
                break;
        }
        
        if (!isColliding(newX, newY, player.size)) {
            player.position.left = newX;
            player.position.top = newY;
        }
        
        if (player.dashCooldown > 0) {
            player.dashCooldown -= 50;
        }
    });
    io.emit('RC_UpdatePositions', playerList);
}, 50);

io.on('connection',function(socket){
    console.log('A user connected');
    console.log(socket.id);
    console.log(socket.handshake.address);

    socket.on('RS_Login', function(data){
        canLogin = true;
        Object.values(playerList).forEach(player => {
            if(player.pseudo === data.pseudo){
                canLogin = false;
            }
        });

        if(canLogin){
            let newPlayer = new Player(socket.id, data.pseudo);
            let rand = Math.random();
            switch(true){
                case rand < 0.25:
                    newPlayer.hero = "Teophile"
                    break;
                case rand < 0.5:
                    newPlayer.hero = "Albert"
                    break;
                case rand < 0.75:
                    newPlayer.hero = "Didier"
                    break;
                default:
                    newPlayer.hero = "Norbert"
                    break;
            }
            playerList[socket.id] = newPlayer;
            socket.emit('RC_Login', { id: socket.id, pseudo: data.pseudo });
            console.log('Player logged in: ' + data.pseudo);
        } else {
            socket.emit('RC_LoginError', { message: 'Pseudo already taken' });
            console.log('Login error: Pseudo already taken - ' + data.pseudo);
        }
    });

    socket.on('disconnect', function(){
        console.log('A user disconnected');
        delete playerList[socket.id];
    });

    socket.on('RS_Move', function(data){
        playerList.forEach(player => {
            if(player.id !== socket.id){
                player.movement.up += data.up;
                player.movement.down += data.down;
                player.movement.left += data.left;
                player.movement.right += data.right;
            }
        });
    });

    socket.on('RS_Attack', function(){
        
    });

    socket.on('RS_Dash', function(){
        const player = playerList[socket.id];
        if (player && player.dashCooldown <= 0 && (player.movement.up || player.movement.down || player.movement.left || player.movement.right)) {
            player.isDashing = true;
            player.dashCooldown = 2000;
            
            setTimeout(() => {
                if (playerList[socket.id]) {
                    playerList[socket.id].isDashing = false;
                }
            }, 300);
            
            console.log('Player dashing: ' + player.pseudo);
        }
    });
});

// Exemple d'un message reçus venant d'un autre serveur
// server.on('RC_GetNumPlayer', function(data){ });

// Exemple d'une boucle créer coté serveur pour par exemple actualisé la position des joueurs
// setTimeout(AutoSave, 1000/30); //se fait 30 fois par seconde