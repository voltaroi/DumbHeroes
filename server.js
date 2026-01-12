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

io.on('connection',function(socket){
    console.log('A user connected');
    console.log(socket.id);
    console.log(socket.handshake.address);

    //Exemple d'une requête que le serveur peut recevoir
    socket.on('RS_CreateAccount', function(data){

        //Exemple d'une requête que le serveur va envoier au client
        socket.emit('RC_AccountCreationError', { message: 'Pseudo already taken' });
    });

    //Exemple pour se login (sans aucune vérification)
    socket.on('RS_Login', function(data){
        socket.emit('RC_Login', {});
    });
});

// Exemple d'un message reçus venant d'un autre serveur
// server.on('RC_GetNumPlayer', function(data){ });

// Exemple d'une boucle créer coté serveur pour par exemple actualisé la position des joueurs
// setTimeout(AutoSave, 1000/30); //se fait 30 fois par seconde