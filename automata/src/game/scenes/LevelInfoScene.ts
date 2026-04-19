import { Scene, GameObjects, Input } from 'phaser';
import { LevelMetadata } from '../util/LevelMetadata';

export class LevelInfoScene extends Scene {
    private levelMetadata: LevelMetadata;
    private infoContainer: GameObjects.Container;

    constructor() {
        super('LevelInfo');
    }

    /**
     * Set the level metadata to display
     */
    public setLevelMetadata(metadata: LevelMetadata): void {
        this.levelMetadata = metadata;
        if (this.scene.isActive()) {
            this.rebuildDisplay();
        }
    }

    create() {
        // Create background
        const bg = this.add.rectangle(
            0, 0,
            310, this.scale.height,
            0x1a3a2a, 1
        );
        bg.setOrigin(0, 0);
        bg.setDepth(0);

        // Create container for info
        this.infoContainer = this.add.container(10, 20);
        this.infoContainer.setDepth(10);

        if (this.levelMetadata) {
            this.rebuildDisplay();
        }
    }

    private rebuildDisplay(): void {
        // Clear old content
        this.infoContainer.removeAll(true);

        if (!this.levelMetadata) return;

        const metadata = this.levelMetadata;
        let yOffset = 0;
        const lineHeight = 20;
        const textConfig = { fontSize: '14px', color: '#00ff00', fontFamily: 'Arial' };
        const titleConfig = { fontSize: '16px', color: '#00ff00', fontFamily: 'Arial', fontStyle: 'bold' };
        const sectionConfig = { fontSize: '13px', color: '#00aa00', fontFamily: 'Arial', fontStyle: 'bold' };

        // Level title
        const titleText = this.add.text(0, yOffset, `Level ${metadata.levelNumber}`, titleConfig);
        this.infoContainer.add(titleText);
        yOffset += lineHeight + 5;

        // Level name
        const nameText = this.add.text(0, yOffset, metadata.levelName, { ...textConfig, fontSize: '15px' });
        this.infoContainer.add(nameText);
        yOffset += lineHeight + 10;

        // Description
        const descLines = this.wrapText(metadata.description, 35);
        descLines.forEach(line => {
            const descText = this.add.text(0, yOffset, line, textConfig);
            this.infoContainer.add(descText);
            yOffset += lineHeight;
        });
        yOffset += 10;

        // Objectives section
        const objTitle = this.add.text(0, yOffset, 'OBJECTIVES:', sectionConfig);
        this.infoContainer.add(objTitle);
        yOffset += lineHeight;

        metadata.objectives.forEach((obj, idx) => {
            const shortObj = obj.length > 30 ? obj.substring(0, 27) + '...' : obj;
            const objText = this.add.text(5, yOffset, `• ${shortObj}`, textConfig);
            this.infoContainer.add(objText);
            yOffset += lineHeight;
        });

        // Actions section
        yOffset += 10;
        const actTitle = this.add.text(0, yOffset, 'ACTIONS:', sectionConfig);
        this.infoContainer.add(actTitle);
        yOffset += lineHeight;

        metadata.actions.forEach((action, idx) => {
            const actionText = `${idx + 1}. ${action.action.toUpperCase()} @ ${action.location}`;
            const shortAction = actionText.length > 30 ? actionText.substring(0, 27) + '...' : actionText;
            const actText = this.add.text(5, yOffset, shortAction, textConfig);
            this.infoContainer.add(actText);
            yOffset += lineHeight;

            if (yOffset > this.scale.height - 100) {
                // Stop rendering if we run out of space
                return;
            }
        });
    }

    /**
     * Wrap text to fit within character limit
     */
    private wrapText(text: string, maxChars: number): string[] {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length > maxChars) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines;
    }
}
