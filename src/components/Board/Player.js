import Sprite from './Sprite.js';

export default class Player extends Sprite {
    static ANIMATION_TYPE = { IDLE: 0, WALK: 1, DANCE: 4, SPAWN: 5 };
    static DIRECTION = { RIGHT: 0, LEFT: 2 };
    static PLAYER_SIZE = { width: 85, height: 85 };
    static SOUNDS = {
        "message": new Audio('./sounds/message.wav'),
        "spawn": new Audio('./sounds/spawn.wav')
    };

    constructor(playerProps, context, image) {
        super({
            x: playerProps.x,
            y: playerProps.y,
            context: context,
            image: image,
        });

        this.width = Player.PLAYER_SIZE.width;
        this.height = Player.PLAYER_SIZE.height;
        this.playerId = playerProps.playerId;
        this.userName = playerProps.userName;
        this.avatar = playerProps.avatar;
        this.theme = playerProps.theme;
        this.dir = Player.DIRECTION.LEFT;
        this.message = playerProps.playerMessage;
        this.row = Player.ANIMATION_TYPE.IDLE;
        this.timerMessage = 500;
        this.tickCount = 0;
        this.spawned = true;
        this.disableSpawn();
    }

    disableSpawn() {
        setTimeout(() => {this.spawned = false}, 600);
    }

    sendMessage(message) {
        message = message.trim();
        if (message) {
            if (message === '/dance') {
                message = null;
                this.movePlayer(null);
            }
            else {
                Player.SOUNDS.message.play();
                this.message = message;
                this.timerMessage = 500;
            }
        }
    }

    movePlayer(targetX, targetY) {
        if (this.spawned) {
            if (this.getAnimationType() !== Player.ANIMATION_TYPE.SPAWN) {
                Player.SOUNDS.spawn.play();
                this.animateSpawn();
            }
            else if (targetX !== this.x || targetY !== this.y) {
                this.spawned = false;
                this.animateWalk();
            }

            return;
        }
        else if (targetX === null) {
            if (this.getAnimationType() !== Player.ANIMATION_TYPE.DANCE) {
                this.animateDance();
            }
            return;
        }

        if (this.getAnimationType() === Player.ANIMATION_TYPE.DANCE && targetX === this.x)
            return;

        if (this.x > targetX) {
            if (this.dir !== Player.DIRECTION.LEFT) {
                if (this.getAnimationType() !== (Player.ANIMATION_TYPE.WALK + Player.DIRECTION.LEFT)) {
                    this.dir = Player.DIRECTION.LEFT;
                    this.animateWalk();
                }
            }
            else if (this.getAnimationType() === (Player.ANIMATION_TYPE.IDLE + Player.DIRECTION.RIGHT) || this.getAnimationType() === (Player.ANIMATION_TYPE.IDLE + Player.DIRECTION.LEFT))
                this.animateWalk();

            this.x--;
        }
        else if (this.x < targetX) {
            if (this.dir !== Player.DIRECTION.RIGHT) {
                if (this.getAnimationType() !== (Player.ANIMATION_TYPE.WALK + Player.DIRECTION.RIGHT)) {
                    this.dir = Player.DIRECTION.RIGHT;
                    this.animateWalk();
                }
            }
            else if (this.getAnimationType() === (Player.ANIMATION_TYPE.IDLE + Player.DIRECTION.RIGHT) || this.getAnimationType() === (Player.ANIMATION_TYPE.IDLE + Player.DIRECTION.LEFT))
                this.animateWalk();

            this.x++;
        }
        else if (this.x === targetX && this.y === targetY) {
            if (this.getAnimationType() !== (Player.ANIMATION_TYPE.IDLE + Player.DIRECTION.RIGHT) && this.getAnimationType() !== (Player.ANIMATION_TYPE.IDLE + Player.DIRECTION.LEFT))
                this.animateIdle();
        }

        if (this.y > targetY)
            this.y--;
        else if (this.y < targetY)
            this.y++;
    }

    animateWalk() {
        this.frames = 13;
        this.frameIndex = 0;
        this.row = 1 + this.dir;
        this.ticksPerFrame = 4;
    }

    animateDance() {
        this.frames = 25;
        this.frameIndex = 0;
        this.row = 4;
        this.ticksPerFrame = 4;
    }

    animateIdle() {
        this.frames = 1;
        this.frameIndex = 0;
        this.row = 0 + this.dir;
        this.ticksPerFrame = 1;
    }

    animateSpawn() {
        this.frames = 7;
        this.frameIndex = 0;
        this.row = 5;
        this.ticksPerFrame = 4;
    }

    getAnimationType() {
        return this.row;
    }
}