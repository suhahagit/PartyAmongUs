export default class Sprite {
    constructor(options) {
        this.context = options.context;
        this.image = options.image;
        this.x = options.x;
        this.y = options.y;
        this.width = options.width;
        this.height = options.height;
        this.frames = options.frames;
        this.frameIndex = options.frameIndex;
        this.row = options.row;
        this.ticksPerFrame = options.ticksPerFrame;
        this.tickCount = options.tickCount;
    }

    update() {
        this.tickCount += 1;
        if (this.tickCount > this.ticksPerFrame) {
            this.tickCount = 0;
            if (this.frameIndex < this.frames - 1)
                this.frameIndex += 1;
            else
                this.frameIndex = 0;
        }
    }

    render() {
        this.context.drawImage(
            this.image,
            this.frameIndex * this.width,
            this.row * this.height,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}