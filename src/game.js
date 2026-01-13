export class Game {
    constructor() {
        this.canvas = null;
        this.socket = null;
        this.movement = { up: false, down: false, left: false, right: false };
        this.map = null;
        this.cellSize = 128;
        this.camera = { x: 0, y: 0 }; 
        this.cameraTarget = { x: 0, y: 0 }; 
        this.cameraSmooth = 0.1;
        this.localPlayerId = null;
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
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const localPlayer = players[this.localPlayerId];
            if (localPlayer) {
                this.cameraTarget.x = localPlayer.position.left - this.canvas.width / 2;
                this.cameraTarget.y = localPlayer.position.top - this.canvas.height / 2;
                
                this.camera.x += (this.cameraTarget.x - this.camera.x) * this.cameraSmooth;
                this.camera.y += (this.cameraTarget.y - this.camera.y) * this.cameraSmooth;
            }
            
            this.drawMap();
            
            Object.values(players).forEach((player, index) => {
                console.log('Drawing player at:', player.position);
                
                const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
                ctx.fillStyle = colors[index % colors.length];
                const size = 20;
                ctx.fillRect(
                    player.position.left - this.camera.x,
                    player.position.top - this.camera.y,
                    size,
                    size
                );
            });
        });
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