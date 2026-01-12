export class Game {
    constructor() {
        this.canvas = null;
        this.socket = null;
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
            gameName.innerHTML = `<h1>Welcome, ${pseudo}!</h1>`;
        });

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
}