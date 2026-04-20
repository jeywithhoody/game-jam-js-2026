import { Scene, GameObjects, Geom } from 'phaser';

export class DeckScene {
    private scene: Scene;
    private deckContainer: GameObjects.Container;
    private cardCount: number = 30; // Number of cards in the deck
    private cardBackImage: string = 'card-back';
    private onCardClick: (() => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createDeck();
    }

    /**
     * Set callback when a card is clicked
     */
    public setOnCardClick(callback: () => void) {
        this.onCardClick = callback;
    }

    private createDeck() {
        // Create container positioned at bottom left with padding
        const padding = 50;
        const containerX = padding;
        const containerY = this.scene.cameras.main.height - padding;

        this.deckContainer = this.scene.add.container(containerX, containerY);


        // Draw gray rectangle background
        const rectWidth = 250;
        const rectHeight = 340;
        const bgRect = this.scene.add.rectangle(30, -10, rectWidth, rectHeight, 0x666666);
        bgRect.setOrigin(0, 1); // Origin at top-left corner
        this.deckContainer.add(bgRect);

        // Create a pile of cards (stacked effect)
        this.createCardPile();
    }

    private createCardPile() {
        // Create stacked card effect with slight offset
        const stackOffset = 4; // Offset between cards for depth

        // Display only the top few cards for visual effect
        const visibleCards = Math.min(5, this.cardCount);

        for (let i = 0; i < visibleCards; i++) {
            const offsetX = i * stackOffset -315;
            const offsetY = i * stackOffset -360;
            
            const card = this.scene.add.sprite(offsetX, offsetY, this.cardBackImage);
            card.setOrigin(0, 0); // Origin at bottom-left
            // Crop to show only the card (from the 1920x1080 image, similar to MovementCardsScene)
            card.setCrop(170, 10, 240, 400);
            //card.setDisplaySize(1920, 1080);
            card.setDepth(i); // Layer cards on top of each other
            card.setScale(1.5); // Scale down for better fit
            
            // Make the top card interactive
            if (i === visibleCards - 1) {
                // Set interactive zone to match the crop dimensions (240x400)
                const hitArea = new Geom.Rectangle(170, 10, 240, 400);
                card.setInteractive(hitArea, Geom.Rectangle.Contains);
                card.on('pointerdown', () => this.handleCardClick());
            }
            
            this.deckContainer.add(card);
        }

        // Add text showing card count
        const countText = this.scene.add.text(75, -15, `${this.cardCount}`, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        });
        countText.setOrigin(0.5, 0.5);
        this.deckContainer.add(countText);
    }

    /**
     * Draw a card from the deck
     */
    public drawCard() {
        if (this.cardCount > 0) {
            this.cardCount--;
            this.refreshDeckDisplay();
            return true;
        }
        return false;
    }

    /**
     * Handle card click event
     */
    private handleCardClick() {
        if (this.drawCard() && this.onCardClick) {
            this.onCardClick();
        }
    }

    /**
     * Add cards back to the deck
     */
    public addCards(count: number) {
        this.cardCount += count;
        this.refreshDeckDisplay();
    }

    /**
     * Set the card count
     */
    public setCardCount(count: number) {
        this.cardCount = Math.max(0, count);
        this.refreshDeckDisplay();
    }

    /**
     * Get current card count
     */
    public getCardCount(): number {
        return this.cardCount;
    }

    /**
     * Refresh the deck display after changes
     */
    private refreshDeckDisplay() {
        // Clear container and rebuild
        this.deckContainer.removeAll(true);
        this.createCardPile();
    }
}
