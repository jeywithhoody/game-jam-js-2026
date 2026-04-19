export class Timer
{
    private lastTime = Date.now();
    private currentRemainingTime = 0;
    constructor(private startingSeconds: number) {
        this.currentRemainingTime = this.startingSeconds;
    }

    reset() {
        this.currentRemainingTime = this.startingSeconds;
        return this;
    }

    update() {
        const now = Date.now();
        this.currentRemainingTime = this.currentRemainingTime - (now - this.lastTime);
        this.lastTime = now;
        return this;
    }

    getTime() {
        return this.currentRemainingTime;
    }
}
