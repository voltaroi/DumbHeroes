const app = require('express')();

const fs = require('fs');
const path = require('path');

const io = require('socket.io')(2001, { // Port utiliser pour se serveur
    cors: {
        origin: "http://90.107.81.168", // Ip du serveur
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

class Player {
    constructor(id, pseudo){
        this.id = id;
        this.pseudo = pseudo;
    }
};

let playerList = {};

io.on('connection',function(socket){
    console.log('A user connected');
    console.log(socket.id);
    console.log(socket.handshake.address);

    socket.on('RS_Login', function(data){
        canLogin = true;
        playerList.forEach(player => {
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
        console.log('Player move: ' + data.direction);
    });
});

// Exemple d'un message reçus venant d'un autre serveur
// server.on('RC_GetNumPlayer', function(data){ });

// Exemple d'une boucle créer coté serveur pour par exemple actualisé la position des joueurs
// setTimeout(AutoSave, 1000/30); //se fait 30 fois par seconde