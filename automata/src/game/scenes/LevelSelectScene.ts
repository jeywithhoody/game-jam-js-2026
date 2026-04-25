import { Scene } from 'phaser';
import SceneNames from './SceneName';

interface LevelOption {
    name: string;
    sceneName: string;
    description?: string;
}

export class LevelSelectScene extends Scene {
    private levels: LevelOption[] = [
        {
            name: 'Level 1: Lavomata',
            sceneName: SceneNames.Level1,
            description: 'Sort and wash the laundry'
        }
    ];

    constructor() {
        super(SceneNames.LevelSelect);
    }

    create() {
        // Add background
        this.add.image(0, 0, 'background')
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Add title
        this.add.text(this.scale.width / 2, 100, 'SELECT LEVEL', {
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
