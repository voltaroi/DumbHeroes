export function createSocket(serverHost) {
    let socket;
    try {
        const serverPort = 2001;
        if (window.location && window.location.hostname) {
            const proto =
                window.location.protocol === "https:" ? "https:" : "http:";
            socket = io(`${proto}//${window.location.hostname}:${serverPort}`);
        } else {
            socket = io("http://localhost:2001");
        }
    } catch (e) {
        socket = io("http://localhost:2001");
    }
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
    socket.emit("RS_Login", { pseudo: data.pseudo });

    return socket;
}