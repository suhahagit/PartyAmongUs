import SpeechBubble from './SpeechBubble.js';
import Player from './Player.js';
import { DEFAULT_PLAYER_POS } from '../../Constants';

export default class BoardCanvas {
    constructor(canvas, context, theme) {
        this.IS_RUNNING = false;
        this.THEME = parseInt(theme);
        this.CANVAS = canvas;
        this.CONTEXT = context;
        this.CONTEXT.textBaseline = "hanging";
        this.PLAYERS = [];
        this.IMGS = [];
        this.drawingLoop = this.drawingLoop.bind(this);
        this.loadedIMGS = 0;
        this.loadImages();
    }

    isFinishedLoading() {
        return (this.loadedIMGS === 24 ? true : false);
    }

    loadImages() {
        for (let i = 0; i < 10; i++) {
            const img = new Image();
            img.src = `./img/spritePlayer${i}.png`;
            this.IMGS.push(img);
            img.onload = () => { this.loadedIMGS++; };
        }

        for (let i = 10; i < 24; i++) {
            const img = new Image();
            img.src = `./img/theme${i-10}.jpg`;
            this.IMGS.push(img);
            img.onload = () => { this.loadedIMGS++ };
        }
    }

    newPlayer(playerProps, pos) {
        const player = new Player(playerProps, this.CONTEXT, this.IMGS[playerProps.avatar]);
        player.targetPos = pos || DEFAULT_PLAYER_POS;
        this.PLAYERS.push(player);
    }

    changeTheme(theme) {
        this.THEME = parseInt(theme);
    }

    stop() {
        this.IS_RUNNING = false;
    }

    start() {
        this.IS_RUNNING = true;
        this.drawingLoop();
    }

    drawBubbleChat(player) {
        if (player.message) {
            this.CONTEXT.shadowOffsetX = 0;
            this.CONTEXT.shadowOffsetY = 0;
            this.speechBubble = new SpeechBubble(this.CONTEXT, player.y - 34, player.x - 56);
            this.speechBubble.setTargetPos(player.x, player.y);
            this.speechBubble.text = player.message;
            this.speechBubble.draw();
            player.timerMessage--;

            if (player.timerMessage === 0) {
                player.timerMessage = 500;
                player.message = null;
            }
        }
    }

    validateNMovePlayer(player) {
        player.movePlayer(player.targetPos.x, player.targetPos.y);
    }

    showPlayerName(player) {
        this.CONTEXT.font = "bold 17px monospace";
        this.CONTEXT.fillStyle = "rgba(255, 255, 255, 0.9)";
        this.CONTEXT.shadowColor = "black";
        this.CONTEXT.shadowOffsetX = 2;
        this.CONTEXT.shadowOffsetY = 2;
        this.CONTEXT.textAlign = "center";
        this.CONTEXT.fillText(player.userName, player.x + 25, player.y + 90);
    }

    drawingLoop() {
        if (this.isFinishedLoading())
        {
            this.CONTEXT.clearRect(0, 0, this.CANVAS.width, this.CANVAS.height);
            this.CONTEXT.drawImage(this.IMGS[this.THEME + 10], 0, 0);
            for (const player of this.PLAYERS) {
                this.showPlayerName(player);
                this.validateNMovePlayer(player);
                this.drawBubbleChat(player);
                player.render();
                player.update();
            }
        }
        else {
            this.CONTEXT.fillStyle = "rgb(255, 51, 51)";
            this.CONTEXT.shadowColor = "black";
            this.CONTEXT.shadowOffsetX = 2;
            this.CONTEXT.shadowOffsetY = 2;
            this.CONTEXT.font = 'italic 40px sans-serif';
            this.CONTEXT.textAlign = "center";
            this.CONTEXT.fillText('LOADING ...', 500, 300);
        }

        if (this.IS_RUNNING) {
            requestAnimationFrame(this.drawingLoop);
        }
    }
}