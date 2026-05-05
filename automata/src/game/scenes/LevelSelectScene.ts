import { Scene } from 'phaser';
import SceneNames from './SceneName';

interface LevelOption {
    name: string;
    sceneName: string;
    description?: string;
}

interface LevelSelectConfig {
    isOverlay?: boolean;
}

export class LevelSelectScene extends Scene {
    private levels: LevelOption[] = [
        {
            name: 'Level 1: Lavomata',
            sceneName: SceneNames.Introduction,
            description: 'Sort and wash the laundry'
        },
        {
            name: 'Level 2: Restomata',
            sceneName: SceneNames.Level2,
            description: 'Automate a restaurant kitchen'
        }
    ];
    private isOverlay: boolean = false;

    constructor() {
        super(SceneNames.LevelSelect);
    }

    init(config: LevelSelectConfig) {
        this.isOverlay = config?.isOverlay ?? false;
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        if (this.isOverlay) {
            this.createOverlay();
        } else {
            this.createFullScreen();
        }
    }

    private createFullScreen(): void {
        const W = this.scale.width;
        const H = this.scale.height;

        // Add background
        this.add.image(0, 0, 'background')
            .setOrigin(0)
            .setDisplaySize(W, H);

        // Add title
        this.add.text(W / 2, 100, 'SELECT LEVEL', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0);

        // Create buttons for each level
        this.levels.forEach((level, index) => {
            const buttonY = 250 + index * 120;
            this.createLevelButton(level, buttonY);
        });
    }

    private createOverlay(): void {
        const W = this.scale.width;
        const H = this.scale.height;
        const container = this.add.container(0, 0).setDepth(50);

        // Dark backdrop — blocks clicks on scene beneath
        const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
            .setInteractive();
        container.add(backdrop);

        // Panel
        const panelW = 640;
        const panelH = 100 + this.levels.length * 110;
        const panel = this.add.rectangle(W / 2, H / 2, panelW, panelH, 0x111111, 1);
        panel.setStrokeStyle(3, 0x00ff00);
        container.add(panel);

        // Title
        const title = this.add.text(W / 2, H / 2 - panelH / 2 + 40, 'SELECT LEVEL', {
            fontSize: '38px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        container.add(title);

        // Create buttons for each level
        this.levels.forEach((level, index) => {
            const buttonY = H / 2 - panelH / 2 + 100 + index * 110;
            const levelBtn = this.add.rectangle(W / 2, buttonY, 460, 90, 0x037a00)
                .setStrokeStyle(2, 0xaaaaaa)
                .setInteractive({ useHandCursor: true });
            const levelText = this.add.text(W / 2, buttonY, level.name, {
                fontSize: '26px',
                color: '#ffffff',
                fontFamily: 'Arial',
            }).setOrigin(0.5, 0.5);
            levelBtn.on('pointerover', () => { levelBtn.setFillStyle(0x025c00); levelText.setColor('#ffffff'); });
            levelBtn.on('pointerout', () => { levelBtn.setFillStyle(0x037a00); levelText.setColor('#ffffff'); });
            levelBtn.on('pointerdown', () => {
                this.scene.get(SceneNames.SoundScene).playButtonClick();
                this.scene.start(level.sceneName);
            });
            container.add(levelBtn);
            container.add(levelText);
        });

        // Close button
        const closeBtn = this.add.text(W / 2, H / 2 + panelH / 2 - 40, '✕  CLOSE', {
            fontSize: '20px',
            color: '#aaaaaa',
            fontFamily: 'Arial',
        }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#aaaaaa'));
        closeBtn.on('pointerdown', () => {
            this.scene.get(SceneNames.SoundScene).playButtonClick();
            (this.scene.get(SceneNames.Start) as any).enableButtons();
            this.scene.stop();
        });
        container.add(closeBtn);
    }

    private createLevelButton(level: LevelOption, y: number): void {
        const buttonGroup = this.add.container(this.scale.width / 2, y);

        // Button background
        const button = this.add.rectangle(0, 0, 500, 100, 0x2d2d2d, 1);
        button.setInteractive({ useHandCursor: true });
        buttonGroup.add(button);

        // Level name text
        const nameText = this.add.text(0, -20, level.name, {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        buttonGroup.add(nameText);

        // Description text
        if (level.description) {
            const descText = this.add.text(0, 15, level.description, {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#cccccc',
                align: 'center'
            }).setOrigin(0.5);
            buttonGroup.add(descText);
        }

        // Button hover effects
        button.on('pointerover', () => {
            button.setFillStyle(0x8d8d8d, 1);
            nameText.setColor('#ffff00');
        });

        button.on('pointerout', () => {
            button.setFillStyle(0x2d2d2d, 1);
            nameText.setColor('#ffffff');
        });

        button.on('pointerup', () => {
            this.scene.get(SceneNames.SoundScene).playButtonClick();
            this.scene.start(level.sceneName);
        });
    }

    /**
     * Add a new level to the level select menu
     */
    public addLevel(name: string, sceneName: string, description?: string): void {
        this.levels.push({ name, sceneName, description });
    }
}
