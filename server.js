const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

app.use(express.static(__dirname));

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

server.listen(2001, () => {
    console.log('Server running on http://127.0.0.1:2001');
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
    }
};

let playerList = {};

setTimeout(() => {
    Object.values(playerList).forEach(player => {
        switch(true){
            case player.movement.up:
                player.position.top -= 5;
                break;
            case player.movement.down:
                player.position.top += 5;
                break;
            case player.movement.left:
                player.position.left -= 5;
                break;
            case player.movement.right:
                player.position.left += 5;
                break;
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
});

// Exemple d'un message reçus venant d'un autre serveur
// server.on('RC_GetNumPlayer', function(data){ });

// Exemple d'une boucle créer coté serveur pour par exemple actualisé la position des joueurs
// setTimeout(AutoSave, 1000/30); //se fait 30 fois par seconde