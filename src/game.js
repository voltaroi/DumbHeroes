export class Game {
    constructor() {
        this.canvas = null;
        this.socket = null;
        this.movement = { up: false, down: false, left: false, right: false };
        this.map = null;
        this.cellSize = 128;
        this.camera = { x: 0, y: 0 };
        this.localPlayerId = null;
        this.playersPositions = {}; 
        this.smoothFactor = 0.15; 
        this.players = {}; 
    }

    init() {
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
        this.canvas = canvas;

        loginScreen.appendChild(nameInput);
        loginScreen.appendChild(loginButton);

        const gameContainer = document.getElementById('gameContainer');
        gameContainer.appendChild(loginScreen);
        gameContainer.appendChild(canvas);

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        loginButton.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (!name) return;

            this.socket.emit("RS_Login", { pseudo: name });
        });

        this.socket.on("RC_Login", ({ pseudo, map, cellSize }) => {
            document.getElementById('loginScreen').style.display = 'none';
            this.map = map;
            this.cellSize = cellSize;
            this.localPlayerId = this.socket.id;

            let gameScreen = document.getElementById('gameScreen');
            if (!gameScreen) {
                gameScreen = document.createElement('div');
                gameScreen.id = 'gameScreen';
                let gameName = document.getElementById('gameName');
                gameName = document.createElement('div');
                gameName.id = 'gameName';
                document.body.appendChild(gameScreen);
                document.body.appendChild(gameName);
            }

            gameScreen.style.display = 'block';
            
            this.setupKeyboardControls();
            this.movePlayer();
            this.drawMap();
        });

        this.initPlayer(this.name);
        this.movePlayer();
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    initPlayer(name) {
        this.socket.on("RC_Login", ({ pseudo }) => {
        const player = new Player(this.socket.id, pseudo);
        console.log('Player initialized:', player);
        return player;
        });
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            console.log('Key pressed:', e.code, e.key);
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.movement.up = true;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.movement.down = true;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.movement.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.movement.right = true;
            console.log('Movement:', this.movement);
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.movement.up = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.movement.down = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.movement.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.movement.right = false;
        });
    }

    movePlayer() {
        setInterval(() => {
            this.socket.emit("RS_Move", this.movement);
        }, 1000 / 60);

        this.socket.on("RC_UpdatePositions", (players) => {
            this.players = players;
            Object.keys(players).forEach(playerId => {
                const targetPos = players[playerId].position;
                
                if (!this.playersPositions[playerId]) {
                    this.playersPositions[playerId] = { left: targetPos.left, top: targetPos.top };
                }
            });
        });
        const render = () => {
            if (!this.players || Object.keys(this.players).length === 0) {
                requestAnimationFrame(render);
                return;
            }
            Object.keys(this.players).forEach(playerId => {
                const targetPos = this.players[playerId].position;
                
                if (this.playersPositions[playerId]) {
                    this.playersPositions[playerId].left += (targetPos.left - this.playersPositions[playerId].left) * this.smoothFactor;
                    this.playersPositions[playerId].top += (targetPos.top - this.playersPositions[playerId].top) * this.smoothFactor;
                }
            });
            if (this.localPlayerId && this.playersPositions[this.localPlayerId]) {
                this.camera.x = this.playersPositions[this.localPlayerId].left - this.canvas.width / 2;
                this.camera.y = this.playersPositions[this.localPlayerId].top - this.canvas.height / 2;
            }
            
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.drawMap();
            
            Object.values(this.players).forEach((player, index) => {
                const smoothPos = this.playersPositions[player.id] || player.position;
                
                const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
                ctx.fillStyle = colors[index % colors.length];
                const size = 20;
                ctx.fillRect(
                    smoothPos.left - this.camera.x,
                    smoothPos.top - this.camera.y,
                    size,
                    size
                );
            });
            
            requestAnimationFrame(render);
        };
        
        render();
    }

    drawMap() {
        if (!this.map || !this.canvas) return;
        
        const ctx = this.canvas.getContext('2d');
        
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                if (this.map[row][col] === 1) {
                    ctx.fillStyle = '#8B4513';
                    ctx.fillRect(
                        col * this.cellSize - this.camera.x,
                        row * this.cellSize - this.camera.y,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
    }
    
}


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