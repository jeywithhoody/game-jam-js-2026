import { Scene, GameObjects, Geom } from 'phaser';
import { CardType, CardSpeed } from './MovementCardsScene';

export type DrawnCard = { type: CardType; speed: CardSpeed };

export class DeckScene {
    private scene: Scene;
    private deckContainer: GameObjects.Container;
    /** Cards loaded from a level-specific deck (shuffled). When set, these are the source of truth. */
    private cards: DrawnCard[] = [];
    private initialCards: DrawnCard[] = [];
    /** Fallback count used when no card data is provided (legacy / random-deck mode). */
    private fallbackCount: number = 30;
    private cardBackImage: string = 'card-back';
    private onCardDraw: ((card: DrawnCard | null) => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createDeck();
    }

    /**
     * Load a specific set of cards into the deck and shuffle them.
     * Call this at level creation time to replace the default random deck.
     */
    public setCards(cards: DrawnCard[]): void {
        this.cards = [...cards];
        this.initialCards = [...cards];
        this.fallbackCount = 0;
        this.shuffle();
        this.refreshDeckDisplay();
    }

    private shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    private get totalCount(): number {
        return this.cards.length + this.fallbackCount;
    }

    /**
     * Set callback when a card is drawn from the deck.
     * The card argument contains type/speed when the deck has card data,
     * or null in fallback (random) mode.
     */
    public setOnCardClick(callback: (card: DrawnCard | null) => void) {
        this.onCardDraw = callback;
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
        this.fillCardPile();

        // Add text showing card count
        const countText = this.scene.add.text(75, -15, `${this.totalCount}`, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        });
        countText.setOrigin(0.5, 0.5);
        this.deckContainer.add(countText);
    }

    public resetCardPile() {
        this.cards = [...this.initialCards];
        this.fillCardPile();
        this.fallbackCount = 0;
        this.shuffle();
    }

    private fillCardPile() {
        // Create stacked card effect with slight offset
        const stackOffset = 4; // Offset between cards for depth

        // Display only the top few cards for visual effect
        const visibleCards = Math.min(5, this.totalCount);

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
    }

    /**
     * Draw a card from the deck.
     * Returns the card data if the deck has card-mode data, null in fallback mode.
     * Returns undefined if the deck is empty.
     */
    public drawCard(): DrawnCard | null | undefined {
        if (this.cards.length > 0) {
            const card = this.cards.pop()!;
            this.refreshDeckDisplay();
            return card;
        } else if (this.fallbackCount > 0) {
            this.fallbackCount--;
            this.refreshDeckDisplay();
            return null; // null = drawn successfully but no card data
        }
        return undefined; // deck empty
    }

    /**
     * Handle card click event
     */
    private handleCardClick() {
        const result = this.drawCard();
        if (result !== undefined && this.onCardDraw) {
            this.onCardDraw(result);
        }
    }

    /**
     * Add a specific card back to the bottom of the deck (card-mode).
     */
    public addCard(card: DrawnCard): void {
        this.cards.unshift(card);
        this.refreshDeckDisplay();
    }

    /**
     * Add cards back to the deck by count (fallback/legacy mode).
     */
    public addCards(count: number) {
        this.fallbackCount += count;
        this.refreshDeckDisplay();
    }

    /**
     * Set the card count (fallback mode only).
     */
    public setCardCount(count: number) {
        this.fallbackCount = Math.max(0, count);
        this.refreshDeckDisplay();
    }

    /**
     * Get current card count
     */
    public getCardCount(): number {
        return this.totalCount;
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
