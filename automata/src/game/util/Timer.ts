export class Timer
{
    private lastTime = Date.now();
    private currentRemainingTime = 0;
    constructor(private startingSeconds: number) {
        this.currentRemainingTime = this.startingSeconds;
    }

    reset() {
        this.currentRemainingTime = this.startingSeconds;
    }

    update() {
        const now = Date.now();
        this.currentRemainingTime = this.currentRemainingTime - (this.lastTime - now)
        this.lastTime = now;
    }

    getTime() {
        return this.currentRemainingTime;
    }
}
