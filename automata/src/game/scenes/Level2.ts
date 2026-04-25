import { Level } from './Level';
import SceneNames from './SceneName';
import { Level2Grid } from '../grid/Level2Grid';
import { LevelZoneScene } from './LevelZoneScene';
import { CardType, CardSpeed } from './MovementCardsScene';
import { Level2Metadata, LevelMetadata } from '../util/LevelMetadata';
import { LevelInfoScene } from './LevelInfoScene';

/**
 * Level2 : Restomata - Restaurant Automation
 * Level flow:
 * Take ingredients -> Prep at station -> Cook on stove -> Plate meal -> Serve to customer -> 
 * Dispose waste in trash -> Wash dirty dishes -> Return to starting position
 */

const zoneIdToActionIndex: Record<string, number> = {
    'ingredient-storage': 0,
    'prep-station-put': 1,
    'prep-station-take': 2,
    'stove-put': 3,
    'stove-take': 4,
    'plate-station-put': 5,
    'plate-station-take': 6,
    'serving-counter': 7,
    'trash-zone': 8,
    'sink': 9,
    'finish': 10
};

export class Level2 extends Level {
    private levelMetadata: LevelMetadata = Level2Metadata;
    private completedActions: Set<string> = new Set();
    private isExecutingSequence: boolean = false;

    constructor() {
        super(SceneNames.Level2);
    }

    /**
     * Cards that make up the Level 2 deck (53 total).
     * - 7 Take cards (ingredient-storage, prep-station-take, stove-take, plate-station-take, sink)
     * - 6 Drop cards (prep-station-put, stove-put, plate-station-put, serving-counter, trash-zone)
     * - Movement cards covering all directions at speeds 1 & 2 (40 cards total)
     */
    private buildLevel2Cards(): Array<{ type: CardType; speed: CardSpeed }> {
        return [
            // Take cards (7 total for more complex flow)
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },

            // Drop cards (6 total for more interactions)
            { type: CardType.Drop, speed: CardSpeed.One },
            { type: CardType.Drop, speed: CardSpeed.One },
            { type: CardType.Drop, speed: CardSpeed.One },
            { type: CardType.Drop, speed: CardSpeed.One },
            { type: CardType.Drop, speed: CardSpeed.One },
            { type: CardType.Drop, speed: CardSpeed.One },

            // Movement cards — Up (10 cards)
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveUp, speed: CardSpeed.Two },

            // Movement cards — Down (10 cards)
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.Two },

            // Movement cards — Left (10 cards)
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },

            // Movement cards — Right (10 cards)
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
        ];
    }

    /**
     * Required assets: same as Level class
     */
    preload() {
        super.preload();
        this.load.setPath('assets');
    }

    create() {
        super.create();
        this.levelGrid = new Level2Grid();
        this.startX = this.levelMetadata.startPosition.x;
        this.startY = this.levelMetadata.startPosition.y;

        // Set up action zones from metadata
        this.setupActionZones();

        // Create robot sprite after grid is initialized
        this.createRobotSprite();

        // Initialize level info scene
        this.scene.launch(SceneNames.LevelInfo);
        this.levelInfoScene = this.scene.get(SceneNames.LevelInfo) as LevelInfoScene;
        this.levelInfoScene.setLevelMetadata(this.levelMetadata);
        this.levelInfoScene.startTimer();

        // Initialize level zone scene with grid visuals
        this.levelZoneScene = new LevelZoneScene(this);
        this.levelZoneScene.initializeGridVisuals(this.levelGrid);
        this.levelZoneScene!.getContainer().add(this.robotSprite);

        // Hand the Level 2 card list to DeckScene
        this.setupDeckCards(this.buildLevel2Cards());

        // Set up card play callback for individual card clicks
        this.cardScene.onCardPlay((cardType, cardSpeed, cardIndex) => {
            this.onCardPlayed({ cardType, cardSpeed, cardIndex });
        });

        // Set up card sequence callback for Go button
        this.cardScene.onCardSequence(async (cards) => {
            await this.executeCardSequence(cards);
        });
    }

    /**
     * Set up action zones for Level 2
     */
    private setupActionZones(): void {
        // Ingredient storage at (1, 0) - take action
        this.actionZoneSystem.addZone('ingredient-storage', {
            x: 1, y: 0,
            actionType: 'take',
            itemType: 'Raw Ingredients',
            name: 'Ingredient Storage'
        });

        // Prep station at (2, 1) - put and take actions
        this.actionZoneSystem.addZone('prep-station-put', {
            x: 2, y: 1,
            actionType: 'put',
            itemType: 'Ingredients',
            name: 'Prep Station (Drop)'
        });

        this.actionZoneSystem.addZone('prep-station-take', {
            x: 2, y: 1,
            actionType: 'take',
            itemType: 'Prepared Ingredients',
            name: 'Prep Station (Take)',
            allowMultiple: true
        });

        // Stove at (3, 2) - put and take actions
        this.actionZoneSystem.addZone('stove-put', {
            x: 3, y: 2,
            actionType: 'put',
            itemType: 'Ingredients',
            name: 'Stove (Drop)'
        });

        this.actionZoneSystem.addZone('stove-take', {
            x: 3, y: 2,
            actionType: 'take',
            itemType: 'Cooked Food',
            name: 'Stove (Take)',
            allowMultiple: true
        });

        // Plate station at (2, 3) - put and take actions
        this.actionZoneSystem.addZone('plate-station-put', {
            x: 2, y: 3,
            actionType: 'put',
            itemType: 'Food',
            name: 'Plate Station (Drop)'
        });

        this.actionZoneSystem.addZone('plate-station-take', {
            x: 2, y: 3,
            actionType: 'take',
            itemType: 'Plated Meal',
            name: 'Plate Station (Take)',
            allowMultiple: true
        });

        // Serving counter at (1, 4) - put action
        this.actionZoneSystem.addZone('serving-counter', {
            x: 1, y: 4,
            actionType: 'put',
            itemType: 'Meal',
            name: 'Serving Counter'
        });

        // Trash zone at (3, 4) - put action
        this.actionZoneSystem.addZone('trash-zone', {
            x: 3, y: 4,
            actionType: 'put',
            itemType: 'Waste',
            name: 'Trash Zone'
        });

        // Sink at (1, 5) - take action
        this.actionZoneSystem.addZone('sink', {
            x: 1, y: 5,
            actionType: 'take',
            itemType: 'Dirty Dishes',
            name: 'Sink'
        });
    }

    /**
     * Handle individual card played event (click)
     */
    private onCardPlayed(data: { cardType: CardType; cardSpeed: CardSpeed; cardIndex: number }): void {
        console.log(`Card played: ${data.cardType} (speed: ${data.cardSpeed})`);

        const success = this.playCard(data.cardType, data.cardSpeed as unknown as CardSpeed);

        if (success) {
            this.cardScene.removeCardFromHand(data.cardIndex);
        } else {
            console.log('Move was invalid or robot is already moving');
        }
    }

    /**
     * Override playCard to handle Take/Drop actions
     */
    public playCard(cardType: CardType, cardSpeed: CardSpeed): boolean {
        const success = super.playCard(cardType, cardSpeed);

        // Handle Drop actions
        if (success && cardType === CardType.Drop) {
            const robotPos = this.levelGrid.getRobotPosition();
            const actionZone = this.actionZoneSystem.canPerformAction(robotPos.x, robotPos.y, 'put');

            if (actionZone.can && actionZone.zoneId) {
                const result = this.actionZoneSystem.performAction(actionZone.zoneId);
                if (result.success) {
                    console.log(`✓ ${result.message}`);
                    this.completedActions.add(actionZone.zoneId);
                    const dropIdx = zoneIdToActionIndex[actionZone.zoneId];
                    if (dropIdx !== undefined) this.levelInfoScene?.markActionComplete(dropIdx);
                }
            }
        }

        // Handle Take actions
        if (success && cardType === CardType.Take) {
            const robotPos = this.levelGrid.getRobotPosition();
            const actionZone = this.actionZoneSystem.canPerformAction(robotPos.x, robotPos.y, 'take');

            if (actionZone.can && actionZone.zoneId) {
                const result = this.actionZoneSystem.performAction(actionZone.zoneId);
                if (result.success) {
                    console.log(`✓ ${result.message}`);
                    this.completedActions.add(actionZone.zoneId);
                    const takeIdx = zoneIdToActionIndex[actionZone.zoneId];
                    if (takeIdx !== undefined) this.levelInfoScene?.markActionComplete(takeIdx);
                }
            }
        }

        return success;
    }

    /**
     * Show failed panel when a card fails
     */
    private showFailedPanel(): void {
        this.scene.get(SceneNames.SoundScene).playFail();
        this.cardScene.showFailedPanel();

        this.time.delayedCall(2000, () => {
            this.cardScene.hideFailedPanel();
        });
    }

    /**
     * Execute a sequence of cards (from Go button)
     */
    private async executeCardSequence(cards: Array<{ type: CardType; speed: CardSpeed }>): Promise<void> {
        if (this.isExecutingSequence) {
            console.log('Already executing a sequence');
            return;
        }

        this.isExecutingSequence = true;
        console.log(`Starting sequence with ${cards.length} cards`);

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            console.log(`Executing card ${i + 1}/${cards.length}: ${card.type}`);

            const success = this.playCard(card.type, card.speed);

            if (!success) {
                console.log(`Card ${i + 1} failed, stopping sequence`);
                this.showFailedPanel();
                break;
            }

            // Wait for movement to complete
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (!this.isMoving) {
                        clearInterval(checkInterval);
                        resolve(null);
                    }
                }, 50);
            });

            // Small delay between cards
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Remove all cards from hand
        this.cardScene.clearHand();
        this.isExecutingSequence = false;

        // Check win condition
        this.checkWinCondition();
    }

    /**
     * Called when robot movement animation completes
     */
    protected onRobotMovementComplete(): void {
        const robotPos = this.levelGrid.getRobotPosition();

        const actionZone = this.actionZoneSystem.canPerformAction(robotPos.x, robotPos.y);

        if (actionZone.can && actionZone.zoneId) {
            const result = this.actionZoneSystem.performAction(actionZone.zoneId);
            console.log(`Robot moved to (${robotPos.x}, ${robotPos.y}) - checking action zones`, actionZone, result);
            if (result.success) {
                console.log(`✓ ${result.message}`);
                this.completedActions.add(actionZone.zoneId);
                const moveIdx = zoneIdToActionIndex[actionZone.zoneId];
                if (moveIdx !== undefined) this.levelInfoScene?.markActionComplete(moveIdx);
            }
        }
    }

    /**
     * Check if all win conditions are met
     */
    private checkWinCondition(): void {
        const robotPos = this.levelGrid.getRobotPosition();
        const atStartPosition = robotPos.x === this.startX && robotPos.y === this.startY;

        // Required actions for winning (all restaurant tasks)
        const requiredActions = [
            'ingredient-storage',
            'prep-station-put',
            'prep-station-take',
            'stove-put',
            'stove-take',
            'plate-station-put',
            'plate-station-take',
            'serving-counter',
            'trash-zone',
            'sink'
        ];

        const allActionsCompleted = requiredActions.every(action => this.completedActions.has(action));

        if (allActionsCompleted && atStartPosition) {
            const moveIdx = zoneIdToActionIndex['finish'];
            if (moveIdx !== undefined) this.levelInfoScene?.markActionComplete(moveIdx);
            this.levelWon();
        }
    }

    /**
     * Handle level win
     */
    private levelWon(): void {
        this.levelInfoScene?.stopTimer();
        this.scene.get(SceneNames.SoundScene).playLevelWin();

        const elapsedMs = this.levelInfoScene?.getElapsedMs() ?? 0;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        console.log(`🎉 Level 2 completed in ${timeStr}!`);

        // Store high score
        this.registry.set('level2_best_time', totalSeconds);

        // Show win screen with notification about next level
        const winText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 40, `LEVEL COMPLETE!\nTime: ${timeStr}`, {
            fontSize: '48px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(200);

        // Show transition message
        const transitionText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 80, `Moving to Level 3 in 5 seconds...`, {
            fontSize: '24px',
            color: '#ffff00',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5).setDepth(200);

        // Transition to Level 3 after 5 seconds
        this.time.delayedCall(5000, () => {
            this.scene.stop();
            // When Level 3 exists, uncomment this:
            // this.scene.start(SceneNames.Level3);
            // For now, go back to level select
            this.scene.start(SceneNames.LevelSelect);
        });
    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }

    draw() {
    }
}
