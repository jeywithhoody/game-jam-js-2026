import { Level } from './Level';
import SceneNames from './SceneName';
import { Level1Grid } from '../grid/Level1Grid';
import { LevelZoneScene } from './LevelZoneScene';
import { CardType, CardSpeed } from './MovementCardsScene';
import { Level1Metadata, LevelMetadata } from '../util/LevelMetadata';
import { LevelInfoScene } from './LevelInfoScene';


/**
 * (Level1 : Lavomata )
 * Level flow :
 * Placement initial Robo -> Déplacement -> Pile de vêtements -> Triage -> Déplacement -> Laveuse -> Déplacement -> Sécheuse -> Déplacement -> Panier à linge -> Déplacement -> Pliage -> Déplacement -> Mise en inventaire -> Déplacement -> Revenir position initial Robo
 * */

const zoneIdToActionIndex: Record<string, number> = {
    'clothes-pile': 0,
    'sorting-station': 1,
    'washer-put': 2,
    'washer-take': 3,
    'dryer-put': 4,
    'dryer-take': 5,
    'folding-station': 6,
    'basket': 7,
};

export class Level1 extends Level
{
    private levelMetadata: LevelMetadata = Level1Metadata;
    private completedActions: Set<string> = new Set();
    private isExecutingSequence: boolean = false;
    private washerSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private selectedWasherPosition: { x: number, y: number } | null = null;
    private sortingStationSprite: Phaser.GameObjects.Sprite | null = null;

    constructor()
    {
        super(SceneNames.Level1);
    }

    /**
     * Cards that make up the Level 1 deck.
     * DeckScene will shuffle these at level start.
     * - 5 Take cards  (clothes-pile, sorting, washer-take, dryer-take, basket)
     * - 3 Drop cards  (washer-put, dryer-put, folding-station)
     * - Movement cards covering all directions at speeds 1 & 2
     */
    private buildLevel1Cards(): Array<{ type: CardType; speed: CardSpeed }> {
        return [
            // Take cards (5 needed for each pick-up action)
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },
            { type: CardType.Take, speed: CardSpeed.One },

            // Drop cards (3 needed for each put-down action)
            { type: CardType.Drop, speed: CardSpeed.One },
            { type: CardType.Drop, speed: CardSpeed.One },
            { type: CardType.Drop, speed: CardSpeed.One },

            // Movement cards — Up
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.One },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveUp, speed: CardSpeed.Two },
            { type: CardType.MoveUp, speed: CardSpeed.Two },

            // Movement cards — Down
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.One },
            { type: CardType.MoveDown, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.Two },
            { type: CardType.MoveDown, speed: CardSpeed.Two },

            // Movement cards — Left
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.One },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },
            { type: CardType.MoveLeft, speed: CardSpeed.Two },

            // Movement cards — Right
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.One },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
            { type: CardType.MoveRight, speed: CardSpeed.Two },
        ];
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
    }

    create()
    {
        super.create();
        this.levelGrid = new Level1Grid();
        this.startX = this.levelMetadata.startPosition.x;
        this.startY = this.levelMetadata.startPosition.y;
        
        // Set up action zones from metadata
        this.setupActionZones();
        
        // Create robot sprite after grid is initialized
        this.createRobotSprite();
        
        // Initialize level info scene - launch first, then get
        this.scene.launch(SceneNames.LevelInfo);
        this.levelInfoScene = this.scene.get(SceneNames.LevelInfo) as LevelInfoScene;
        this.levelInfoScene.setLevelMetadata(this.levelMetadata);
        this.levelInfoScene.startTimer();
        
        // Initialize level zone scene with grid visuals
        this.levelZoneScene = new LevelZoneScene(this);
        this.levelZoneScene.initializeGridVisuals(this.levelGrid);
        this.washerSprites.forEach(sprite => {
            this.levelZoneScene!.getContainer().add(sprite);  // Add washer to container
        });
        this.levelZoneScene!.getContainer().add(this.robotSprite);  // Add robot above washer

        // Hand the Level 1 card list to DeckScene — it will shuffle them
        this.setupDeckCards(this.buildLevel1Cards());

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
     * Set up action zones for Level 1
     */
    private setupActionZones(): void {
        // Action zones based on Level1Grid layout
        // Zone locations: washer(2,0), sorting(1,1), dryer(3,1), basket(4,0), folding(2,2)

        this.actionZoneSystem.addZone('clothes-pile', {
            x: 0, y: 0,
            actionType: 'take',
            itemType: 'Dirty Clothes',
            name: 'Clothes Pile'
        });

        this.actionZoneSystem.addZone('sorting-station', {
            x: 1, y: 1,
            actionType: 'take',
            itemType: 'Sorted Clothes',
            name: 'Sorting Station'
        });

        this.actionZoneSystem.addZone('washer-put', {
            x: 2, y: 0,
            actionType: 'put',
            itemType: 'Clothes',
            name: 'Washing Machine (Drop)'
        });

        this.actionZoneSystem.addZone('washer-take', {
            x: 2, y: 0,
            actionType: 'take',
            itemType: 'Washed Clothes',
            name: 'Washing Machine (Take)',
            allowMultiple: true
        });

        this.actionZoneSystem.addZone('dryer-put', {
            x: 3, y: 1,
            actionType: 'put',
            itemType: 'Washed Clothes',
            name: 'Dryer (Drop)'
        });

        this.actionZoneSystem.addZone('dryer-take', {
            x: 3, y: 1,
            actionType: 'take',
            itemType: 'Dry Clothes',
            name: 'Dryer (Take)',
            allowMultiple: true
        });

        this.actionZoneSystem.addZone('folding-station', {
            x: 2, y: 2,
            actionType: 'put',
            itemType: 'Dry Clothes',
            name: 'Folding Station'
        });

        this.actionZoneSystem.addZone('basket', {
            x: 4, y: 0,
            actionType: 'take',
            itemType: 'Folded Clothes',
            name: 'Basket'
        });

        // Create washer sprite at the center of the washer action zone (2, 0)
        this.createWasherSprite(2, 0);
        this.createWasherSprite(3, 1);
        this.createSortingStationSprite(1, 1);
    }

    /**
     * Create the washer machine sprite at its grid position
     */
    private createWasherSprite(x: number, y: number): void {
        if (!this.levelGrid) return;
        
        // Get the world position for the washer at grid (2, 0)
        const worldPos = this.levelGrid.getWorldPosition(x, y);
        
        // Create washer sprite at absolute position (will be converted to relative when added to container)
        const washerSprite = this.add.sprite(
            this.levelZoneX + worldPos.x,
            this.levelZoneY + worldPos.y,
            'washer-machine-run1'
        );
        this.washerSprites.set(`${x},${y}`, washerSprite);
        console.log(this.washerSprites)
        washerSprite.setScale(0.3);
        washerSprite.setCrop(118, 49, 342, 314);
        washerSprite.setOrigin(0.75, 0.55);
        washerSprite.setDepth(90); // Below robot (100) but above grid visuals

        // Create animation for the washer machine
        this.anims.create({
            key: `washer-running-${x}-${y}`, // Unique key for each washer
            frames: [
                { key: 'washer-machine-run1' },
                { key: 'washer-machine-run2' },
                { key: 'washer-machine-run3' },
                { key: 'washer-machine-run5' },
                { key: 'washer-machine-run6' }
            ],
            frameRate: 8,
            repeat: 3  // Repeat 3 times when triggered
        });
    }

    private createSortingStationSprite(x: number, y: number): void {
        if (!this.levelGrid) return;
        
        // Get the world position for the sorting station at grid (1, 1)
        const worldPos = this.levelGrid.getWorldPosition(x, y);
        

        const clothSorting = this.add.sprite(
            this.levelZoneX + worldPos.x,
            this.levelZoneY + worldPos.y,
            'cloth-sorting0059');
        clothSorting.setCrop(477, 114, 322, 324);
        clothSorting.setDepth(50);
        clothSorting.setScale(0.55);
        clothSorting.setOrigin(0.33, 0.30);
        clothSorting.setDepth(80); // Below robot but above washer

        this.sortingStationSprite = clothSorting;
    }

    /**
     * Handle individual card played event (click)
     */
    private onCardPlayed(data: { cardType: CardType; cardSpeed: CardSpeed; cardIndex: number }): void {
        console.log(`Card played: ${data.cardType} (speed: ${data.cardSpeed})`);

        // Try to execute the card movement
        const success = this.playCard(data.cardType, data.cardSpeed as unknown as CardSpeed);

        if (success) {
            // Remove the card from hand after successful move
            this.cardScene.removeCardFromHand(data.cardIndex);
        } else {
            console.log('Move was invalid or robot is already moving');
        }
    }

    /**
     * Override playCard to handle Take/Drop actions and trigger washer animation
     */
    public playCard(cardType: CardType, cardSpeed: CardSpeed): boolean {
        // Call parent implementation
        const success = super.playCard(cardType, cardSpeed);

        // If it's a Drop action that succeeded, handle action zone effects
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

                    // Trigger washer animation when robot puts clothes in the washer
                    if (actionZone.zoneId === 'washer-put') {
                        this.animateWasher();
                    }
                }
            }
        }

        // Handle Take actions similarly
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
        // Position panel above the card scene area
        this.cardScene.showFailedPanel();

        // Add click to close functionality
        // overlay.on('pointerdown', () => {
        //     overlay.destroy();
        //     failedPanel.destroy();
        // });

        // Auto-hide after 2 seconds
        this.time.delayedCall(2000, () => {
            // overlay.destroy();
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
                if(!this.levelWon) {
                    this.showFailedPanel();
                }
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

        // Check for action zones at this position (no filter - just checking if zone exists)
        const actionZone = this.actionZoneSystem.canPerformAction(robotPos.x, robotPos.y);

        if (actionZone.can && actionZone.zoneId) {
            const result = this.actionZoneSystem.performAction(actionZone.zoneId);
            console.log(`Robot moved to (${robotPos.x}, ${robotPos.y}) - checking action zones`, actionZone, result);
            if (result.success) {
                console.log(`✓ ${result.message}`);
                this.completedActions.add(actionZone.zoneId);
                const moveIdx = zoneIdToActionIndex[actionZone.zoneId];
                if (moveIdx !== undefined) this.levelInfoScene?.markActionComplete(moveIdx);

                // Trigger washer animation when robot puts clothes in the washer
                if (actionZone.zoneId === 'washer-put' && actionZone.action === 'put') {
                    this.selectedWasherPosition = { x: robotPos.x, y: robotPos.y };
                    console.log('Triggering washer animation from movement completion');
                    console.log(`Selected washer position: (${this.selectedWasherPosition.x}, ${this.selectedWasherPosition.y})`);
                    console.log(`Washer sprites available: ${this.washerSprites}`);
                    this.animateWasher();
                }
                if (actionZone.zoneId === 'sorting-station' && actionZone.action === 'take') {
                    console.log('Triggering sorting station animation from movement completion');
                    this.animateSortingStation();
                }
            }
        }
    }

    /**
     * Animate the washer machine sprite
     */
    private animateWasher(): void {
        if (!this.selectedWasherPosition) return;
        const washer = this.washerSprites.get(`${this.selectedWasherPosition.x},${this.selectedWasherPosition.y}`);
        if (!washer) return;

        // Play the washer running animation
        washer.play(`washer-running-${this.selectedWasherPosition.x}-${this.selectedWasherPosition.y}`);
        this.scene.get(SceneNames.SoundScene).playMachineSound();
        this.scene.get(SceneNames.SoundScene).playWaterSplash();

        // Optional: Add a slight shake effect for more dynamism
        this.tweens.add({
            targets: washer,
            x: washer.x + 2,
            duration: 100,
            yoyo: true,
            repeat: 11,  // 12 total oscillations (3 seconds at 100ms each)
            ease: 'Sine.easeInOut'
        });
    }

    private animateSortingStation(): void {
        if (!this.sortingStationSprite) return;

        this.scene.get(SceneNames.SoundScene).playPhysicalTask();
        this.sortingStationSprite.play('cloth-sorting-station');
    }

    /**
     * Check if all win conditions are met
     */
    private checkWinCondition(): void {
        const robotPos = this.levelGrid.getRobotPosition();
        const atStartPosition = robotPos.x === this.startX && robotPos.y === this.startY;

        // Required actions for winning
        const requiredActions = [
            'clothes-pile',
            'sorting-station',
            'washer-put',
            'washer-take',
            'dryer-put',
            'dryer-take',
            'folding-station',
            'basket'
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
        this.levelWon = true;
        this.levelInfoScene?.stopTimer();
        this.scene.get(SceneNames.SoundScene).playLevelWin();

        const elapsedMs = this.levelInfoScene?.getElapsedMs() ?? 0;
        const totalSeconds = Math.floor(elapsedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        console.log(`🎉 Level completed in ${timeStr}!`);

        // Store high score
        this.registry.set('level1_best_time', totalSeconds);

        // Show win screen
        this.add.text(this.scale.width / 2, this.scale.height / 2, `LEVEL COMPLETE!\nTime: ${timeStr}`, {
            fontSize: '48px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(200);
    }

    update(time: number, delta: number)
    {
        super.update(time, delta);
    }

    draw()
    {
    }
}
