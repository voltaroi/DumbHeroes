export class Game {
    constructor() {
        this.canvas = null;
        this.socket = null;
        this.movement = { up: false, down: false, left: false, right: false };
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

        this.socket.on("RC_Login", ({ pseudo }) => {
            document.getElementById('loginScreen').style.display = 'none';

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
            
            Object.values(players).forEach((player, index) => {
                console.log('Drawing player at:', player.position);
                const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
                ctx.fillStyle = colors[index % colors.length];
                const size = 20; 
                ctx.fillRect(player.position.left, player.position.top, size, size);
            });
        });
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