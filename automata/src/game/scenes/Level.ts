import { Scene, Utils, Button, SceneManager, Text, Sprite, Tweens } from 'phaser';
import { Timer } from '../util/Timer';
import { LevelGrid } from '../grid/LevelGrid';
import { DeckScene } from './DeckScene';
import { CardType, CardSpeed, MovementCardsScene } from './MovementCardsScene';
import { ActionZoneSystem } from '../util/ActionZoneSystem';
import SceneNames from './SceneName';


//TODO : create Take and Drop association (Need 1 Take for 1 Drop)
//TODO : not drop when not the right Take
export class Level extends Scene
{
    protected timer : Timer = null;
    protected cardScene: MovementCardsScene;
    private timerText : Text = null;
    private deckScene: DeckScene;

    protected levelGrid: LevelGrid = null;
    protected robotSprite: Sprite = null;
    protected levelZoneX: number = 445;
    protected levelZoneY: number = 65;
    protected isRobotMoving: boolean = false;
    protected actionZoneSystem: ActionZoneSystem = null;
    protected startX: number = 0;
    protected startY: number = 0;

    constructor(levelName: string)
    {
        super(levelName);
        this.timer = new Timer(400);
        this.actionZoneSystem = new ActionZoneSystem();
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
        this.load.image('robot-profile-left0000', 'robot-profile-left0000.png');
        this.load.image('robot-profile-left0003', 'robot-profile-left0003.png');
        this.load.image('robot-profile-left0006', 'robot-profile-left0006.png');
        this.load.image('robot-profile-left0009', 'robot-profile-left0009.png');
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
        this.load.image('failed-panel', 'failed-panel.png');
    }

    create()
    {
        this.add.image(0, 0, 'background')
        .setOrigin(0)
        .setDisplaySize(this.scale.width, this.scale.height);
        
        // Position timer text better (top center)
        this.timerText = this.add.text(this.scale.width / 2, 30, 'Timer: 400s', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.timerText.setOrigin(0.5, 0);
        this.timerText.setDepth(50);
        
        this.timer.reset();
        this.draw();

        // Set up pause menu (Escape key)
        this.input.keyboard.on('keydown-ESC', () => {
            this.pauseGame();
        });

        // Initialize deck scene after assets are loaded
        this.deckScene = new DeckScene(this);

        // Set up callback for when deck card is clicked
        this.deckScene.setOnCardClick(() => this.drawNewCards());

        // Initialize movement cards scene
        this.cardScene = new MovementCardsScene(this);

         this.cardScene.setOnCardReturnedToDeck(() => {
            this.deckScene.addCards(1);
        });
    }

    /**
     * Draw new random movement cards when deck is clicked
     */
    private drawNewCards() {
        const cardTypes = Object.values(CardType);
        const cardSpeeds: CardSpeed[] = [CardSpeed.One, CardSpeed.Two];

        // Generate random cards (let's say 3-5 cards)

        for (let i = 0; i < 1; i++) {
            const type = Utils.Array.GetRandom(cardTypes) as CardType;
            const speed = Utils.Array.GetRandom(cardSpeeds) as CardSpeed;
            // Add the new card to the existing hand
            this.cardScene.addCardToHand(type, speed);
        }
    }

    /**
     * Pause the game and show pause menu
     */
    protected pauseGame(): void {
        this.scene.pause();
        this.scene.launch(SceneNames.PauseMenu);
    }

    /**
     * Handle pause menu resume (called by PauseMenuScene)
     */
    public resumeFromPause(): void {
        this.scene.resume();
        this.scene.stop(SceneNames.PauseMenu);
    }

    /**
     * Get the isMoving state
     */
    public get isMoving(): boolean {
        return this.isRobotMoving;
    }

    protected createRobotSprite(): void {
        if (!this.levelGrid) return;
        
        const robotPos = this.levelGrid.getRobotPosition();
        const worldPos = this.levelGrid.getWorldPosition(robotPos.x, robotPos.y);
        
        // Create robot sprite at its grid position (absolute position with offset)
        this.robotSprite = this.add.sprite(
            this.levelZoneX + worldPos.x,
            this.levelZoneY + worldPos.y,
            'robot-profil0000'
        );
        this.robotSprite.setOrigin(0.45, 0.25);
        this.robotSprite.setCrop(40, 40, 149, 205);
        this.robotSprite.setScale(0.6, 0.6);
        this.robotSprite.setDepth(100);
    }

    update(time: number, delta: number)
    {
        this.timer.update();
        this.draw();
    }

    draw()
    {
        this.timerText.setText('Timer: ' + Math.ceil(this.timer.getTime() / 1000) + 's');
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
        if (this.isRobotMoving || !this.levelGrid || !this.robotSprite) {
            return false;
        }

        const isMovement = cardType !== CardType.Drop && cardType !== CardType.Take

        if(!isMovement) {

            const { x, y } = this.levelGrid.getRobotPosition();
            const actionZone = this.levelGrid.getActionZoneAt(x, y);

            if(actionZone === undefined) {
                return false;
            }

            if(cardType === CardType.Take && actionZone.actionType !== 'take') {
                return false;
            }

            if(cardType === CardType.Drop && actionZone.actionType !== 'put') {
                return false;
            }

            return true;
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
        this.isRobotMoving = true;
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
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this.isRobotMoving = false;
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
                this.robotSprite.setCrop(27, 10, 173, 224);
                this.robotSprite.setOrigin(0.45, 0.25);
                break;
            case 'down':
                this.robotSprite.setTexture('robot-front0000');
                this.robotSprite.setFlipX(false);
                this.robotSprite.setCrop(16, 19, 193, 213);
                this.robotSprite.setOrigin(0.45, 0.25);
                break;
            case 'left':
                this.robotSprite.setTexture('robot-profile-left0000');
                this.robotSprite.setFlipX(false);
                this.robotSprite.setCrop(40, 40, 149, 205);
                this.robotSprite.setOrigin(0.45, 0.25);
                break;
            case 'right':
                this.robotSprite.setTexture('robot-profil0000');
                this.robotSprite.setFlipX(false);
                this.robotSprite.setCrop(40, 40, 149, 205);
                this.robotSprite.setOrigin(0.45, 0.25);
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
