import { Scene, GameObjects, Input } from 'phaser';

export enum CardType {
    MoveLeft = 'move-left',
    MoveUp = 'move-up',
    MoveDown = 'move-down',
    MoveRight = 'move-right'
}

export enum CardSpeed {
    One = 1,
    Two = 2
}

function getCardName(type: CardType, speed: CardSpeed) {
    return `card-${type}-${speed}.png`
}

export const Cards: Record<CardType, Record<CardSpeed, string>> = {
    'move-down': {
        '1': getCardName(CardType.MoveDown, 1),
        '2': getCardName(CardType.MoveDown, 2)
    },
    'move-up': {
        '1': getCardName(CardType.MoveUp, 1),
        '2': getCardName(CardType.MoveUp, 2)
    },
    'move-left': {
        '1': getCardName(CardType.MoveLeft, 1),
        '2': getCardName(CardType.MoveLeft, 2)
    },
    'move-right': {
        '1': getCardName(CardType.MoveRight, 1),
        '2': getCardName(CardType.MoveRight, 2)
    }
}

type CardPlayCallback = (cardType: CardType, cardSpeed: CardSpeed, cardIndex: number) => void;
type CardSequenceCallback = (cards: Array<{ type: CardType; speed: CardSpeed }>) => Promise<void>;

export class MovementCardsScene {

    public movementCardsContainer: GameObjects.Container;
    private handCards: Array<{ type: CardType; speed: CardSpeed }> = [];
    private cardSprites: GameObjects.Sprite[] = [];
    private cardSpacing: number = 200;
    private scene: Scene;
    private cardPlayCallback: CardPlayCallback | null = null;
    private sequenceCallback: CardSequenceCallback | null = null;
    private goButton: GameObjects.Container;
    private draggedCard: { index: number; originalX: number; sprite: GameObjects.Sprite; startX: number } | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        // Position container at the bottom center of the screen, with some padding
        const containerY = this.scene.cameras.main.height - 380;
        this.movementCardsContainer = this.scene.add.container(440, containerY);
        this.movementCardsContainer.setDepth(100);
        
        // Debug: Add a visible background to verify container is positioned correctly
        const bg = this.scene.add.rectangle(0, 0, 1255, 360, 0x222222, 0.5);
        bg.setOrigin(0, 0);
        this.movementCardsContainer.add(bg);

        // Create Go button
        this.createGoButton();
    }

    private createGoButton(): void {
        const goButtonX = 1100;
        const goButtonY = 50;

        this.goButton = this.scene.add.container(goButtonX, goButtonY);
        this.goButton.setDepth(150);

        // Button background
        const btnBg = this.scene.add.rectangle(0, 0, 120, 80, 0x00aa00, 0.8);
        btnBg.setStrokeStyle(3, 0x00ff00);
        this.goButton.add(btnBg);

        // Button text
        const btnText = this.scene.add.text(0, -10, 'GO', {
            fontSize: '28px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        btnText.setOrigin(0.5);
        this.goButton.add(btnText);

        // Card count indicator
        const countText = this.scene.add.text(0, 20, '0 cards', {
            fontSize: '12px',
            color: '#000000',
            fontFamily: 'Arial'
        });
        countText.setOrigin(0.5);
        this.goButton.add(countText);

        // Make interactive
        btnBg.setInteractive({ useHandCursor: true });
        
        btnBg.on('pointerover', () => {
            btnBg.setFillStyle(0x00ff00, 0.9);
            btnText.setColor('#ffffff');
            countText.setColor('#ffffff');
        });

        btnBg.on('pointerout', () => {
            btnBg.setFillStyle(0x00aa00, 0.8);
            btnText.setColor('#000000');
            countText.setColor('#000000');
        });

        btnBg.on('pointerdown', () => {
            this.executeCardSequence();
        });

        this.movementCardsContainer.add(this.goButton);
    }

    addMovementCard(imageKey: string) {
        const card = this.scene.add.sprite(0, 0, imageKey);
        card.setOrigin(0.5, 1);
        this.movementCardsContainer.add(card);
    }

    addCardToHand(type: CardType, speed: CardSpeed) {
        this.handCards.push({ type, speed });
        this.renderHand();
    }

    removeCardFromHand(index: number) {
        if (index >= 0 && index < this.handCards.length) {
            this.handCards.splice(index, 1);
            this.renderHand();
        }
    }

    clearHand() {
        this.handCards = [];
        this.renderHand();
    }

    setHand(cards: Array<{ type: CardType; speed: CardSpeed }>) {
        this.handCards = [...cards];
        this.renderHand();
    }

    /**
     * Set callback for individual card play events
     */
    public onCardPlay(callback: CardPlayCallback): void {
        this.cardPlayCallback = callback;
    }

    /**
     * Set callback for card sequence execution
     */
    public onCardSequence(callback: CardSequenceCallback): void {
        this.sequenceCallback = callback;
    }

    preload() {
        this.scene.load.setPath('assets');
        for (const type of Object.values(CardType)) {
            for (const speed of [1, 2]) {
                const cardKey = `card-${type}-${speed}.png`;
                this.scene.load.image(cardKey, cardKey);
            }
        }
    }

    private renderHand() {
        // Remove old card sprites
        this.cardSprites.forEach(sprite => sprite.destroy());
        this.cardSprites = [];

        if (this.handCards.length === 0) return;

        // Calculate total width needed
        const totalWidth = (this.handCards.length - 1) * this.cardSpacing;
        const startX = -this.cardSpacing - 30;

        // Update card count on button
        const goButtonChild = this.goButton.getAll('type', 'Text')[1] as GameObjects.Text;
        if (goButtonChild) {
            goButtonChild.setText(`${this.handCards.length} card${this.handCards.length !== 1 ? 's' : ''}`);
        }

        // Add cards to container
        this.handCards.forEach((card, index) => {
            const imageKey = `card-${card.type}-${card.speed}.png`;
            const sprite = this.scene.add.sprite(startX + index * this.cardSpacing, 0, imageKey);
            sprite.setOrigin(0, 0);
            sprite.setCrop(170, 10, 240, 400);
            sprite.setScale(1.1);
            sprite.setDepth(index + 1);
            
            // Store card data for later
            (sprite as any).cardIndex = index;
            (sprite as any).cardData = card;
            
            // Make card interactive and draggable
            sprite.setInteractive({ useHandCursor: true });
            this.scene.input.setDraggable(sprite, true);
            
            // Pointer down - track start of drag or single click
            sprite.on('pointerdown', (pointer: Input.Pointer) => {
                if (!this.draggedCard) {
                    this.draggedCard = {
                        index: index,
                        originalX: sprite.x,
                        sprite: sprite,
                        startX: pointer.x
                    };
                    sprite.setAlpha(0.7);
                    sprite.setDepth(1000); // Bring to front while dragging
                }
            });

            // Drag handler - update position
            this.scene.input.on('drag', (pointer: Input.Pointer, gameObject: any) => {
                if (gameObject === sprite && this.draggedCard) {
                    const deltaX = pointer.x - this.draggedCard.startX;
                    sprite.x = this.draggedCard.originalX + deltaX;
                }
            });

            // Drag end - reorder if needed
            this.scene.input.on('dragend', (pointer: Input.Pointer, gameObject: any) => {
                if (gameObject === sprite && this.draggedCard) {
                    const newIndex = this.calculateNewCardIndex(sprite);
                    if (newIndex !== this.draggedCard.index && newIndex >= 0 && newIndex < this.handCards.length) {
                        this.reorderCards(this.draggedCard.index, newIndex);
                    }
                    this.draggedCard = null;
                    this.renderHand();
                }
            });

            // Single click to play card
            sprite.on('pointerup', (pointer: Input.Pointer) => {
                // Only trigger if we didn't drag far
                if (this.draggedCard === null && Math.abs(pointer.x - (pointer.prevPosition?.x ?? pointer.x)) < 10) {
                    this.onCardClicked(card, index);
                }
            });
            
            this.movementCardsContainer.add(sprite);
            this.cardSprites.push(sprite);
        });
    }

    /**
     * Calculate new card index based on sprite position
     */
    private calculateNewCardIndex(sprite: GameObjects.Sprite): number {
        let closest = 0;
        let closestDist = Infinity;

        for (let i = 0; i < this.cardSprites.length; i++) {
            const dist = Math.abs(sprite.x - this.cardSprites[i].x);
            if (dist < closestDist) {
                closestDist = dist;
                closest = i;
            }
        }

        return closest;
    }

    /**
     * Reorder cards in hand
     */
    private reorderCards(fromIndex: number, toIndex: number): void {
        if (fromIndex === toIndex) return;

        const card = this.handCards[fromIndex];
        this.handCards.splice(fromIndex, 1);
        this.handCards.splice(toIndex, 0, card);
    }

    /**
     * Execute the card sequence left to right
     */
    private async executeCardSequence(): Promise<void> {
        if (this.handCards.length === 0) {
            console.log('No cards to execute');
            return;
        }

        console.log(`Executing ${this.handCards.length} cards in sequence`);

        if (this.sequenceCallback) {
            await this.sequenceCallback([...this.handCards]);
        }
    }

    private onCardClicked(card: { type: CardType; speed: CardSpeed }, index: number): void {
        // Call the registered callback if set
        if (this.cardPlayCallback) {
            this.cardPlayCallback(card.type, card.speed, index);
        }
    }

    /**
     * Get the hand cards
     */
    public getHand(): Array<{ type: CardType; speed: CardSpeed }> {
        return this.handCards;
    }
}