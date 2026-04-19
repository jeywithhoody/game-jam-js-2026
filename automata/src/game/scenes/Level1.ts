import { Level } from './Level';
import { Scene, Button, SceneManager } from 'phaser';
import SceneNames from './SceneName';
import { Level1Grid } from '../grid/Level1Grid';
import { LevelZoneScene } from './LevelZoneScene';
import { MovementCardsScene, CardType, CardSpeed } from './MovementCardsScene';


/**
 * (Level1 : Lavomata )
 * Level flow :
 * Placement initial Robo -> Déplacement -> Pile de vêtements -> Triage -> Déplacement -> Laveuse -> Déplacement -> Sécheuse -> Déplacement -> Panier à linge -> Déplacement -> Pliage -> Déplacement -> Mise en inventaire -> Déplacement -> Revenir position initial Robo
 * */

export class Level1 extends Level
{
    private levelZoneScene: LevelZoneScene;
    private movementCardsScene: MovementCardsScene;

    constructor()
    {
        super(SceneNames.Level1)
    }

    /**
     * Required assets :
     * washer + other assets from Level class
     *
     */
    preload()
    {
        super.preload();
        this.load.setPath('assets');

        //Washer
        this.load.image('washer-machine-run1', 'washer-machine-run1.png');
        this.load.image('washer-machine-run2', 'washer-machine-run2.png');
        this.load.image('washer-machine-run3', 'washer-machine-run3.png');
        this.load.image('washer-machine-run5', 'washer-machine-run5.png');
        this.load.image('washer-machine-run6', 'washer-machine-run6.png');

    }

    create()
    {
        super.create();
        this.levelGrid = new Level1Grid();
        
        // Initialize level zone scene with grid visuals
        this.levelZoneScene = new LevelZoneScene(this);
        this.levelZoneScene.initializeGridVisuals(this.levelGrid);

        // Initialize movement cards scene
        this.movementCardsScene = new MovementCardsScene(this);
        
        // Set up a sample hand of cards
        this.movementCardsScene.setHand([
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two }
        ]);

        // Set up card play callback
        this.movementCardsScene.onCardPlay((cardType, cardSpeed, cardIndex) => {
            this.onCardPlayed({ cardType, cardSpeed, cardIndex });
        });
    }

    /**
     * Handle card played event
     */
    private onCardPlayed(data: { cardType: CardType; cardSpeed: CardSpeed; cardIndex: number }): void {
        console.log(`Card played: ${data.cardType} (speed: ${data.cardSpeed})`);

        // Try to execute the card movement
        const success = this.playCard(data.cardType, data.cardSpeed as unknown as CardSpeed);

        if (success) {
            // Remove the card from hand after successful move
            this.movementCardsScene.removeCardFromHand(data.cardIndex);
        } else {
            console.log('Move was invalid or robot is already moving');
        }
    }

    update(time: number, delta: number)
    {
        super.update(time, delta);
    }

    draw()
    {
    }
}
