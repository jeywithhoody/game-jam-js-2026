import { Scene, Button, SceneManager, Text } from 'phaser';
import { Timer } from '../util/Timer';
import { LevelGrid } from '../grid/LevelGrid';

export class Level extends Scene
{
    protected timer : Timer = null;
    private timerText : Text = null;
    protected levelGrid: LevelGrid = null;

    constructor(levelName: string)
    {
        super(levelName);
        this.timer = new Timer(400);
    }

    /**
     * Required assets :
     * robot, background, card
     */
    preload()
    {
        this.load.setPath('assets');

        //Background
        this.load.image('background', 'bg.png');

        //Robot and animations
        this.load.image('robot-front0000', 'robot-front0000.png');
        this.load.image('robot-front0003', 'robot-front0003.png');
        this.load.image('robot-front0006', 'robot-front0006.png');
        this.load.image('robot-front0009', 'robot-front0009.png');
        this.load.image('robot-profil0000', 'robot-profil0000.png');
        this.load.image('robot-profil0003', 'robot-profil0003.png');
        this.load.image('robot-profil0006', 'robot-profil0006.png');
        this.load.image('robot-profil0009', 'robot-profil0009.png');
        this.load.image('robot-back0000', 'robot-back0000.png');
        this.load.image('robot-back0003', 'robot-back0003.png');
        this.load.image('robot-back0006', 'robot-back0006.png');
        this.load.image('robot-back0009', 'robot-back0009.png');

        //Cards
        this.load.image('card-back', 'card-back.png');
        this.load.image('card-move-down-1', 'card-move-down-1.png');
        this.load.image('card-move-down-2', 'card-move-down-2.png');
        this.load.image('card-move-left-1', 'card-move-left-1.png');
        this.load.image('card-move-left-2', 'card-move-left-2.png');
        this.load.image('card-move-right-1', 'card-move-right-1.png');
        this.load.image('card-move-right-2', 'card-move-right-2.png');
        this.load.image('card-move-up-1', 'card-move-up-1.png');
        this.load.image('card-move-up-2', 'card-move-up-2.png');
    }

    create()
    {
        this.add.image(0, 0, 'background')
        .setOrigin(0)
        .setDisplaySize(this.scale.width, this.scale.height);
        this.timerText = this.add.text(0, 0, 'Timer : ' + this.timer.getTime());
        this.timer.reset();
    }

    update(time: number, delta: number)
    {
        this.timer.update();
        this.draw();
    }

    draw()
    {
        this.timerText.setText('Timer : ' + Math.ceil(this.timer.getTime() / 1000));
    }

    /**
     * Get the level grid
     */
    public getGrid(): LevelGrid {
        return this.levelGrid;
    }
}
