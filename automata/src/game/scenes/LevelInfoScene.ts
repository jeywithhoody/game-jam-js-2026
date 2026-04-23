import { Scene, GameObjects, Input } from 'phaser';
import { LevelMetadata } from '../util/LevelMetadata';

const padding = 10;
const panelPosition = { x: 40, y: 20 };
const panelSize = { width: 317, height: 544 };
const textZone = 90;

// Position: 51, 123
// Size: 317, 434
export class LevelInfoScene extends Scene {
    private levelMetadata: LevelMetadata;
    private infoContainer: GameObjects.Container;

    private timerText: GameObjects.Text | null = null;
    private elapsedMs: number = 0;
    private timerRunning: boolean = false;

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
        // const bg = this.add.rectangle(
        //     0, 0,
        //     310, this.scale.height,
        //     0x1a3a2a, 1
        // );
        // bg.setOrigin(0, 0);
        // bg.setDepth(0);

        // Create container for info
        this.infoContainer = this.add.container(panelPosition.x + padding, panelPosition.y + textZone + padding);
        this.infoContainer.setDepth(10);

        // Timer — bottom center of the info panel
        this.timerText = this.add.text(
            panelPosition.x + panelSize.width / 2,
            panelPosition.y + panelSize.height,
            '00:00',
            {
                fontSize: '32px',
                color: '#000000',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                stroke: '#ffffff',
                strokeThickness: 3,
            }
        );
        this.timerText.setOrigin(0.5, 1);
        this.timerText.setDepth(20);

        if (this.levelMetadata) {
            this.rebuildDisplay();
        }
    }

    // ── Timer ──────────────────────────────────────────────────────────────

    /** Start (or restart) the timer from zero. */
    public startTimer(): void {
        this.elapsedMs = 0;
        this.timerRunning = true;
        this.updateTimerDisplay();
    }

    /** Pause the timer. */
    public stopTimer(): void {
        this.timerRunning = false;
    }

    /** Resume the timer after a pause. */
    public resumeTimer(): void {
        this.timerRunning = true;
    }

    /** Advance the timer. Called automatically by Phaser's scene loop. */
    update(time: number, delta: number): void {
        if (!this.timerRunning) return;
        this.elapsedMs += delta;
        this.updateTimerDisplay();
    }

    /** Add a time penalty (e.g. when a card is drawn back to the deck). */
    public addPenaltySeconds(seconds: number): void {
        this.elapsedMs += seconds * 1000;
        this.updateTimerDisplay();
    }

    private updateTimerDisplay(): void {
        if (!this.timerText) return;
        const totalSeconds = Math.floor(this.elapsedMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        this.timerText.setText(`${mm}:${ss}`);
    }

    private rebuildDisplay(): void {
        // Clear old content
        this.infoContainer.removeAll(true);

        if (!this.levelMetadata) return;

        const metadata = this.levelMetadata;
        let yOffset = 0;
        const lineHeight = 18;
        const textConfig = { fontSize: '14px', color: '#000000', fontFamily: 'Arial' };
        const titleConfig = { fontSize: '20px', color: '#000000', fontFamily: 'Arial', fontStyle: 'bold' };
        const sectionConfig = { fontSize: '14px', color: '#000000', fontFamily: 'Arial', fontStyle: 'bold' };

        // Level title
        const titleText = this.add.text(0, yOffset, `Level ${metadata.levelNumber}`, titleConfig);
        this.infoContainer.add(titleText);
        yOffset += lineHeight + 2;

        // Level name
        const nameText = this.add.text(0, yOffset, metadata.levelName, { ...textConfig, fontSize: '13px' });
        this.infoContainer.add(nameText);
        yOffset += lineHeight + 5;

        // Description
        const descLines = this.wrapText(metadata.description, 30);
        descLines.forEach(line => {
            const descText = this.add.text(0, yOffset, line, textConfig);
            this.infoContainer.add(descText);
            yOffset += lineHeight - 2;
        });
        yOffset += 5;

        // Objectives section
        const objTitle = this.add.text(0, yOffset, 'OBJECTIVES:', sectionConfig);
        this.infoContainer.add(objTitle);
        yOffset += lineHeight - 2;

        metadata.objectives.forEach((obj, idx) => {
            if (yOffset > this.scale.height - 150) return; // Stop if running out of space
            const shortObj = obj.length > 28 ? obj.substring(0, 25) + '...' : obj;
            const objText = this.add.text(3, yOffset, `• ${shortObj}`, textConfig);
            this.infoContainer.add(objText);
            yOffset += lineHeight - 2;
        });

        // Actions section
        yOffset += 5;
        const actTitle = this.add.text(0, yOffset, 'ACTIONS:', sectionConfig);
        this.infoContainer.add(actTitle);
        yOffset += lineHeight - 2;

        metadata.actions.forEach((action, idx) => {
            if (yOffset > this.scale.height - 80) return; // Stop if running out of space
            const actionText = `${idx + 1}. ${action.action.toUpperCase()}`;
            const shortAction = actionText.length > 26 ? actionText.substring(0, 23) + '...' : actionText;
            const actText = this.add.text(3, yOffset, shortAction, textConfig);
            this.infoContainer.add(actText);
            yOffset += lineHeight - 3;
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
