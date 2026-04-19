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
    private cardSpacing: number = 180; // Space between cards
    private scene: Scene;



    constructor(scene: Scene) {
        this.scene = scene;
        // Position container at the bottom center of the screen, with some padding
        const containerY = this.scene.cameras.main.height - 150;
        this.movementCardsContainer = this.scene.add.container(this.scene.cameras.main.width / 4, containerY);
        
        // Debug: Add a visible background to verify container is positioned correctly
        const bg = this.scene.add.rectangle(0, 0, 500, 250, 0x222222);
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

        // Calculate total width needed
        const totalWidth = (this.handCards.length - 1) * this.cardSpacing;
        const startX = -totalWidth / 2;

        // Add cards to container
        this.handCards.forEach((card, index) => {
            const imageKey = `card-${card.type}-${card.speed}.png`;
            const sprite = this.scene.add.sprite(0 + index * this.cardSpacing, -120, imageKey);
            sprite.setOrigin(0, 0);
            // Crop to show only the card (from the 1920x1080 image)
            sprite.setCrop(170, 10, 240, 400);
            // Set display size to make it visible
            sprite.setDisplaySize(1920, 1080);
            this.movementCardsContainer.add(sprite);
            this.cardSprites.push(sprite);
        });
    }
}