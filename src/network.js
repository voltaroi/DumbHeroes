export function createSocket(serverHost) {
    let socket = io("http://90.107.81.168:2001");
    return socket;
}

export function initNetwork(game) {
    const socket = createSocket();
    game.socket = socket;

    socket.on("RC_NewAccount", data => {
        game.onNewAccount && game.onNewAccount(data);
    });
    socket.on("RC_LoginSuccess", data => {
        game.onLoginSuccess && game.onLoginSuccess(data);
    });

    return socket;
}