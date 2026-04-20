import { Scene, GameObjects, Geom } from 'phaser';

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

export class MovementCardsScene {

    public movementCardsContainer: GameObjects.Container;
    private handCards: Array<{ type: CardType; speed: CardSpeed }> = [];
    private cardSprites: GameObjects.Sprite[] = [];
    private scene: Scene;
    private containerWidth: number = 1255; // Width of the movement cards area
    private selectedCardIndex: number | null = null;
    private tempCardOrder: Array<{ type: CardType; speed: CardSpeed }> | null = null;
    private cardPositions: Array<{ x: number; y: number; index: number }> = [];
    private onCardReturnedToDeck: (() => void) | null = null;



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

    addMovementCard(imageKey: string) {
        const card = this.scene.add.sprite(0, 0, imageKey);
        card.setOrigin(0.5, 1); // Set origin to center the card at the bottom of the container
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
        this.handCards = cards;
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

    private renderHandInternal(cards: { type: CardType; speed: CardSpeed }[], selectedIndex: number | null) {
        // Remove old card sprites
        this.cardSprites.forEach(sprite => sprite.destroy());
        this.cardSprites = [];
        this.cardPositions = [];

        if (cards.length === 0) return;

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
}