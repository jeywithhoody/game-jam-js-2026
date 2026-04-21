import { Scene, GameObjects, Geom, Input } from 'phaser';

//TODO : add posssibility to reshuffle cards
//TODO : create a card dictionary (have particular number that adapts to level)

export enum CardType {
    MoveLeft = 'move-left',
    MoveUp = 'move-up',
    MoveDown = 'move-down',
    MoveRight = 'move-right',
    Take = 'take',
    Drop = 'drop',
}

export enum CardSpeed {
    One = 1,
    Two = 2
}

function getCardName(type: CardType, speed: CardSpeed) {
    return `card-${type}-${speed}.png`
}

interface CardInfo {
    path: string;
    cropZone: CropZone;
}

interface CropZone {
    x: number;
    y: number;
    w: number;
    h: number;
}

export const Cards: Record<CardType, Record<CardSpeed, CardInfo>> = {
    'move-down': {
        '1': { path: getCardName(CardType.MoveDown, 1), cropZone: { x: 940, y: 40, w: 167, h: 228 } },
        '2': { path: getCardName(CardType.MoveDown, 2), cropZone: { x: 760, y: 40, w: 167, h: 228 }  },
    },
    'move-up': {
        '1': { path: getCardName(CardType.MoveUp, 1), cropZone: { x: 1300, y: 40, w: 167, h: 228 }},
        '2': { path: getCardName(CardType.MoveUp, 2), cropZone: { x: 1120, y: 40, w: 167, h: 228 } },
    },
    'move-left': {
        '1': { path: getCardName(CardType.MoveLeft, 1), cropZone: { x: 40, y: 40, w: 171, h: 232 } },
        '2': { path: getCardName(CardType.MoveLeft, 2), cropZone: { x: 220, y: 40, w: 171, h: 232 } },
    },
    'move-right': {
        '1': { path: getCardName(CardType.MoveRight, 1), cropZone: { x: 400, y: 40, w: 169, h: 230 } },
        '2': { path: getCardName(CardType.MoveRight, 2), cropZone: { x: 580, y: 40, w: 169, h: 230 }  }
    },
    'take': {
        '1': { path: getCardName(CardType.Take, 1), cropZone: { x: 1480, y: 40, w: 165, h: 227 } },
        '2': { path: getCardName(CardType.Take, 2), cropZone: { x: 1480, y: 40, w: 165, h: 227 } },
    },
    'drop': {
            '1': { path: getCardName(CardType.Drop, 1), cropZone: { x: 1660, y: 40, w: 165, h: 227 } },
            '2': { path: getCardName(CardType.Drop, 2), cropZone: { x: 1660, y: 40, w: 165, h: 227 } },
    }
}

type CardPlayCallback = (cardType: CardType, cardSpeed: CardSpeed, cardIndex: number) => void;
type CardSequenceCallback = (cards: Array<{ type: CardType; speed: CardSpeed }>) => Promise<void>;

export class MovementCardsScene {

    public movementCardsContainer: GameObjects.Container;
    private handCards: Array<{ type: CardType; speed: CardSpeed }> = [];
    private cardSprites: GameObjects.Sprite[] = [];
    private cardSpacing: number = 200;
    private cardPlayCallback: CardPlayCallback | null = null;
    private cardPositions: Array<{ x: number; y: number; index: number }> = [];
    private sequenceCallback: CardSequenceCallback | null = null;
    private goButton: GameObjects.Container;
    private draggedCard: { index: number; originalX: number; sprite: GameObjects.Sprite; startX: number } | null = null;
    private scene: Scene;
    private containerWidth: number = 1255; // Width of the movement cards area
    private selectedCardIndex: number | null = null;
    private tempCardOrder: Array<{ type: CardType; speed: CardSpeed }> | null = null;
    private cardPositions: Array<{ x: number; y: number; index: number }> = [];
    private onCardReturnedToDeck: (() => void) | null = null;
    private failedPanel: GameObjects.Image | null = null;
  
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

        this.failedPanel = this.scene.add.sprite(520, -160, 'failed-panel');
        this.failedPanel.setCrop(439, 694, 1259, 367);
        this.failedPanel.setDepth(10000); // Very high depth to ensure visibility
        this.failedPanel.setVisible(false);
        console.log('Failed panel created with crop (439, 694, 1259, 367)');
        this.movementCardsContainer.add(this.failedPanel);

        // Create Go button
        this.createGoButton();

        // Set up keyboard listeners for card movement
        this.scene.input.keyboard?.on('keydown-LEFT', () => {
            if (this.selectedCardIndex !== null && this.tempCardOrder !== null && this.selectedCardIndex > 0) {
                // Move card left (swap with previous)
                const temp = this.tempCardOrder[this.selectedCardIndex];
                this.tempCardOrder[this.selectedCardIndex] = this.tempCardOrder[this.selectedCardIndex - 1];
                this.tempCardOrder[this.selectedCardIndex - 1] = temp;
                this.selectedCardIndex--;
                this.renderHandWithSelection();
            }
        });

        this.scene.input.keyboard?.on('keydown-RIGHT', () => {
            if (this.selectedCardIndex !== null && this.tempCardOrder !== null && this.selectedCardIndex < this.tempCardOrder.length - 1) {
                // Move card right (swap with next)
                const temp = this.tempCardOrder[this.selectedCardIndex];
                this.tempCardOrder[this.selectedCardIndex] = this.tempCardOrder[this.selectedCardIndex + 1];
                this.tempCardOrder[this.selectedCardIndex + 1] = temp;
                this.selectedCardIndex++;
                this.renderHandWithSelection();
            }
        });

        this.scene.input.keyboard?.on('keydown-ENTER', () => {
            if (this.selectedCardIndex !== null && this.tempCardOrder !== null) {
                // Validate the movement
                this.handCards = [...this.tempCardOrder];
                this.selectedCardIndex = null;
                this.tempCardOrder = null;
                this.renderHand();
            }
        });

        this.scene.input.keyboard?.on('keydown-ESC', () => {
            // Cancel the movement
            this.selectedCardIndex = null;
            this.tempCardOrder = null;
            this.renderHand();
        });

        this.scene.input.keyboard?.on('keydown-X', () => {
            if (this.selectedCardIndex !== null && this.tempCardOrder !== null) {
                // Remove the card from the hand completely
                this.tempCardOrder.splice(this.selectedCardIndex, 1);
                
                // Apply the change and clear selection
                this.handCards = [...this.tempCardOrder];
                this.selectedCardIndex = null;
                this.tempCardOrder = null;
                this.renderHand();
                
                // Notify that a card was returned to the deck
                if (this.onCardReturnedToDeck) {
                    this.onCardReturnedToDeck();
                }
            }
        });
    }

    /**
     * Set callback when a card is returned to the deck
     */
    public setOnCardReturnedToDeck(callback: () => void) {
        this.onCardReturnedToDeck = callback;
    }

    private createGoButton(): void {
        const goButtonX = 1350;
        const goButtonY = 25;

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

    public showFailedPanel() {
        this.failedPanel?.setVisible(true);
    }

    public hideFailedPanel() {
        this.failedPanel?.setVisible(false);
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


    private renderHand() {
        this.renderHandInternal(this.handCards, null);
    }

    private renderHandWithSelection() {
        if (this.tempCardOrder) {
            this.renderHandInternal(this.tempCardOrder, this.selectedCardIndex);
        }
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

    private renderHandInternal(cards: { type: CardType; speed: CardSpeed }[], selectedIndex: number | null) {
        // Remove old card sprites
        this.cardSprites.forEach(sprite => sprite.destroy());
        this.cardSprites = [];
        this.cardPositions = [];

        if (cards.length === 0) return;

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

        // Get crop zone from the first card to calculate average dimensions
        const firstCardType = cards[0].type;
        const firstCardSpeed = cards[0].speed;
        const firstCropZone = Cards[firstCardType][firstCardSpeed].cropZone;
        
        const cardWidth = firstCropZone.w;  // Use actual crop zone width
        const cardHeight = firstCropZone.h; // Use actual crop zone height
        const baseCardSpacing = -5; // Negative for overlapping cards
        const lineSpacing = -50; // Negative for overlapping rows
        const padding = 5; // Minimal padding from edges
        const minScale = 0.3; // Minimum scale to avoid cards being too small

        // Start with max 10 cards per line, calculate scale needed
        let cardsPerLine = 10;
        let scale = 1;

        // Try to fit 10 cards, reduce if scale gets too small
        for (let tryCards = 10; tryCards >= 1; tryCards--) {
            const neededWidth = tryCards * cardWidth + (tryCards - 1) * baseCardSpacing;
            let tryScale = 1;
            
            if (neededWidth > this.containerWidth - (padding * 2)) {
                tryScale = (this.containerWidth - (padding * 2)) / neededWidth;
            }

            if (tryScale >= minScale) {
                cardsPerLine = tryCards;
                scale = tryScale;
                break;
            }
        }

        // Calculate number of lines
        const numLines = Math.ceil(cards.length / cardsPerLine);

        // Recalculate scale based on height too
        const neededHeight = numLines * cardHeight + (numLines - 1) * lineSpacing;
        if (neededHeight > 360 - (padding * 2)) {
            scale = Math.min(scale, (360 - (padding * 2)) / neededHeight);
        }

        const scaledCardWidth = cardWidth * scale;
        const scaledCardHeight = cardHeight * scale;
        const scaledSpacing = baseCardSpacing * scale;
        const scaledLineSpacing = lineSpacing * scale;

        // Position cards - top to bottom, left to right
        // Ensure all cards stay within bounds (0, 0) to (1255, 360)
        let cardIndex = 0;
        for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
            const cardsInThisLine = Math.min(cardsPerLine, cards.length - cardIndex);

            // Start from left edge
            const startX = padding;
            const startY = padding + lineIndex * (scaledCardHeight + scaledLineSpacing);

            for (let i = 0; i < cardsInThisLine; i++) {
                const card = cards[cardIndex];
                const currentCardIndex = cardIndex; // Capture current index for callbacks
                console.log('Card index:', cardIndex, 'Card:', card);
                const cropZone = Cards[card.type][card.speed].cropZone;
                const xPos = startX + i * (scaledCardWidth + scaledSpacing);
                
                
                const sprite = this.scene.add.sprite(xPos, startY, 'cards-combined');
                sprite.setCrop(cropZone.x, cropZone.y, cropZone.w, cropZone.h);
                // Set origin after crop to position correctly: origin at crop zone's top-left
                sprite.setOrigin(cropZone.x / 1920, cropZone.y / 1080); // Normalize to image size
                sprite.setScale(0.8);
                sprite.setDepth(cardIndex + 1);
                
                // Create precise hit area for this card (based on crop zone scaled by 0.8)
                sprite.setInteractive(
                    new Geom.Rectangle(cropZone.x, cropZone.y, cropZone.w, cropZone.h),
                    Geom.Rectangle.Contains
                );
                
                // Store position info
                this.cardPositions.push({ x: xPos, y: startY, index: cardIndex });
                
                // Highlight selected card
                if (cardIndex === selectedIndex) {
                    sprite.setScale(0.90); // Larger scale when selected
                    sprite.setDepth(2000); // Bring to front
                    // sprite.setTint(0x00ff00); // Green tint when selected
                    sprite.setTint(0xe8f0ff);
                }
                
                // Add hover effects
                sprite.on('pointerover', () => {
                    if (this.selectedCardIndex !== currentCardIndex) {
                        sprite.setScale(0.81); // Increase scale by 15%
                        sprite.setDepth(5000); // Bring to front on hover
                        sprite.setTint(0xaaaaaa); // Light gray tint on hover
                    }
                });
                
                sprite.on('pointerout', () => {
                    if (this.selectedCardIndex !== currentCardIndex) {
                        sprite.setScale(0.8); // Reset scale
                        sprite.setDepth(currentCardIndex + 1); // Reset depth
                        sprite.clearTint();
                    }
                });
                
                // Card selection on click
                sprite.on('pointerup', () => {
                    sprite.clearTint();
                    if (this.selectedCardIndex === null) {
                        // Select this card - copy from current rendered cards
                        this.selectedCardIndex = currentCardIndex;
                        this.tempCardOrder = [...cards];
                        this.renderHandWithSelection();
                    } else if (this.selectedCardIndex === currentCardIndex) {
                        // Deselect this card
                        this.selectedCardIndex = null;
                        this.tempCardOrder = null;
                        this.renderHand();
                    } else {
                        // Select a different card
                        this.selectedCardIndex = currentCardIndex;
                        this.renderHandWithSelection();
                    }
                });
                
                this.movementCardsContainer.add(sprite);
                this.cardSprites.push(sprite);
                cardIndex++;
            }
        }
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
