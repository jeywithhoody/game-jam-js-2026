import { Scene, Button, SceneManager, Text, Sprite, Tweens } from 'phaser';
import { Timer } from '../util/Timer';
import { LevelGrid } from '../grid/LevelGrid';
import { CardType, CardSpeed } from './MovementCardsScene';

export class Level extends Scene
{
    protected timer : Timer = null;
    private timerText : Text = null;
    protected levelGrid: LevelGrid = null;
    protected robotSprite: Sprite = null;
    protected levelZoneX: number = 445;
    protected levelZoneY: number = 65;
    private isMoving: boolean = false;

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
        
        // Create robot sprite in the level zone
        this.createRobotSprite();
    }

    protected createRobotSprite(): void {
        if (!this.levelGrid) return;
        
        const robotPos = this.levelGrid.getRobotPosition();
        const worldPos = this.levelGrid.getWorldPosition(robotPos.x, robotPos.y);
        
        // Create robot sprite at its grid position
        this.robotSprite = this.add.sprite(
            this.levelZoneX + worldPos.x,
            this.levelZoneY + worldPos.y,
            'robot-profil0000'
        );
        this.robotSprite.setOrigin(0.5, 0.5);
        this.robotSprite.setDisplaySize(40, 60);
        this.robotSprite.setDepth(100);
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

    /**
     * Handle card play - move robot based on card type and speed
     */
    public playCard(cardType: CardType, cardSpeed: CardSpeed): boolean {
        if (this.isMoving || !this.levelGrid || !this.robotSprite) {
            return false;
        }

        const direction = this.cardTypeToDirection(cardType);
        if (!direction) return false;

        const distance = cardSpeed === 1 ? 1 : 2;

        // Validate move
        if (!this.levelGrid.canMove(direction, distance)) {
            console.warn(`Cannot move ${direction} by ${distance}`);
            return false;
        }

        // Execute move
        this.isMoving = true;
        this.levelGrid.moveRobot(direction, distance);

        // Animate robot
        this.animateRobotMovement(direction);

        return true;
    }

    /**
     * Convert card type to grid direction
     */
    private cardTypeToDirection(cardType: CardType): 'up' | 'down' | 'left' | 'right' | null {
        switch (cardType) {
            case CardType.MoveUp:
                return 'up';
            case CardType.MoveDown:
                return 'down';
            case CardType.MoveLeft:
                return 'left';
            case CardType.MoveRight:
                return 'right';
            default:
                return null;
        }
    }

    /**
     * Animate robot sprite movement with tween
     */
    private animateRobotMovement(direction: 'up' | 'down' | 'left' | 'right'): void {
        if (!this.robotSprite || !this.levelGrid) return;

        const robotPos = this.levelGrid.getRobotPosition();
        const worldPos = this.levelGrid.getWorldPosition(robotPos.x, robotPos.y);
        const targetX = this.levelZoneX + worldPos.x;
        const targetY = this.levelZoneY + worldPos.y;

        // Update robot sprite direction
        this.updateRobotDirection(direction);

        // Tween to new position
        this.tweens.add({
            targets: this.robotSprite,
            x: targetX,
            y: targetY,
            duration: 400,
            ease: 'Linear',
            onComplete: () => {
                this.isMoving = false;
                this.onRobotMovementComplete();
            }
        });
    }

    /**
     * Update robot sprite direction
     */
    private updateRobotDirection(direction: 'up' | 'down' | 'left' | 'right'): void {
        if (!this.robotSprite) return;

        // Map direction to robot sprite
        // For now, we'll use profil for left/right (flip x for right)
        // and back for up, front for down
        switch (direction) {
            case 'up':
                this.robotSprite.setTexture('robot-back0000');
                this.robotSprite.setFlipX(false);
                break;
            case 'down':
                this.robotSprite.setTexture('robot-front0000');
                this.robotSprite.setFlipX(false);
                break;
            case 'left':
                this.robotSprite.setTexture('robot-profil0000');
                this.robotSprite.setFlipX(true);
                break;
            case 'right':
                this.robotSprite.setTexture('robot-profil0000');
                this.robotSprite.setFlipX(false);
                break;
        }
    }

    /**
     * Called when robot movement animation completes
     */
    protected onRobotMovementComplete(): void {
        // Check if robot is on an action zone
        const robotPos = this.levelGrid.getRobotPosition();
        const actionZone = this.levelGrid.getActionZoneAt(robotPos.x, robotPos.y);

        if (actionZone) {
            console.log(`Robot landed on ${actionZone.actionType} zone: ${actionZone.itemType}`);
            // Subclasses can override this to handle actions
        }
    }
}
