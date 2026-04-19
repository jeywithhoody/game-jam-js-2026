import { Scene, GameObjects } from 'phaser';

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

export class MovementCardsScene {

    public movementCardsContainer: GameObjects.Container;
    private handCards: Array<{ type: CardType; speed: CardSpeed }> = [];
    private cardSprites: GameObjects.Sprite[] = [];
    private cardSpacing: number = 200; // Space between cards
    private scene: Scene;
    private containerWidth: number = 1255; // Width of the movement cards area
    private lineHeight: number = 150; // Height of each line



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

        const cardWidth = 240; // Cropped card width
        const cardHeight = 400; // Cropped card height
        const baseCardSpacing = -20; // Negative for overlapping cards
        const lineSpacing = 0; // Spacing between lines
        const padding = 10; // Padding from edges

        // Display 6 cards per line
        const cardsPerLine = 6;

        // Calculate number of lines
        const numLines = Math.ceil(this.handCards.length / cardsPerLine);

        // Calculate scale to fit everything in the container (1255 x 360)
        const neededWidth = cardsPerLine * cardWidth + (cardsPerLine - 1) * baseCardSpacing;
        const neededHeight = numLines * cardHeight + (numLines - 1) * lineSpacing;

        let scale = 1;
        if (neededWidth > this.containerWidth - (padding * 2)) {
            scale = Math.min(scale, (this.containerWidth - (padding * 2)) / neededWidth);
        }
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
            const cardsInThisLine = Math.min(cardsPerLine, this.handCards.length - cardIndex);

            // Calculate total width of this line
            const totalLineWidth = cardsInThisLine * scaledCardWidth + Math.max(0, (cardsInThisLine - 1) * scaledSpacing);
            
            // Center line horizontally within bounds
            const startX = padding + (this.containerWidth - 2 * padding - totalLineWidth) / 2;
            const startY = padding + lineIndex * (scaledCardHeight + scaledLineSpacing);

            // Ensure we stay within bounds
            const clampedStartY = Math.min(startY, 360 - scaledCardHeight);

            for (let i = 0; i < cardsInThisLine; i++) {
                const card = this.handCards[cardIndex];
                const imageKey = `card-${card.type}-${card.speed}.png`;
                const xPos = startX + i * (scaledCardWidth + scaledSpacing);
                
                // Clamp X position to ensure card stays within bounds
                const clampedXPos = Math.max(0, Math.min(xPos, this.containerWidth - scaledCardWidth));
                
                const sprite = this.scene.add.sprite(clampedXPos, clampedStartY, imageKey);
                sprite.setOrigin(0, 0);
                sprite.setCrop(170, 10, 240, 400);
                sprite.setScale(scale);
                sprite.setDepth(cardIndex + 1);
                this.movementCardsContainer.add(sprite);
                this.cardSprites.push(sprite);
                cardIndex++;
            }
        }
    }
}