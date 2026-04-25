import { Scene, GameObjects, Input } from 'phaser';
import SceneNames from './SceneName';

export class PauseMenuScene extends Scene {
    private pauseGraphics: GameObjects.Graphics;
    private resumeButton: GameObjects.Container;
    private restartButton: GameObjects.Container;
    private quitButton: GameObjects.Container;
    private settingsButton: GameObjects.Container;

    constructor() {
        super(SceneNames.PauseMenu);
    }

    create() {
        // Pause overlay - semi-transparent black
        this.pauseGraphics = this.add.graphics();
        this.pauseGraphics.fillStyle(0x000000, 0.7);
        this.pauseGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
        this.pauseGraphics.setDepth(200);

        // Create main menu
        this.createMainMenu();

        // Handle Escape to resume
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
    }

    private createMainMenu(): void {
        const w = this.scale.width;
        const h = this.scale.height;
        const centerY = h / 2;

        const panelW = w * 0.8;
        const panelH = h * 0.75;
        const panelX = w / 2;
        const panelY = centerY;

        // Outer panel background
        const panelBg = this.add.rectangle(panelX, panelY, panelW, panelH, 0x111111, 0.95);
        panelBg.setStrokeStyle(2, 0x00ff00);
        panelBg.setDepth(201);

        // Divider line between left and right halves
        const divider = this.add.graphics();
        divider.lineStyle(2, 0x00ff00, 0.5);
        divider.beginPath();
        divider.moveTo(panelX, panelY - panelH / 2 + 20);
        divider.lineTo(panelX, panelY + panelH / 2 - 20);
        divider.strokePath();
        divider.setDepth(201);

        // ── LEFT SIDE – buttons ──────────────────────────────────────────
        const leftX = panelX - panelW / 4;

        const title = this.add.text(leftX, centerY - 160, 'PAUSED', {
            fontSize: '42px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setDepth(202);

        this.resumeButton = this.createButton(leftX, centerY - 70, 'RESUME (ESC)', () => {
            this.resumeGame();
        });

        this.restartButton = this.createButton(leftX, centerY - 10, 'RESTART LEVEL', () => {
            this.restartLevel();
        });

        this.settingsButton = this.createButton(leftX, centerY + 50, 'SETTINGS', () => {
            this.scene.launch(SceneNames.Settings, { previousScene: SceneNames.PauseMenu });
            this.scene.pause(SceneNames.PauseMenu);
        });

        this.quitButton = this.createButton(leftX, centerY + 110, 'QUIT LEVEL', () => {
            this.quitLevel();
        });

        // ── RIGHT SIDE – controls image ─────────────────────────────
        const rightX = panelX + panelW / 4;

        const controlsImage = this.add.image(rightX, centerY, 'controls');
        controlsImage.setScale(0.5);
        controlsImage.setDepth(202);
    }



    private createButton(x: number, y: number, label: string, callback: () => void): GameObjects.Container {
        const container = this.add.container(x, y);
        container.setDepth(202);

        // Button background (same style as StartScene)
        const bg = this.add.rectangle(0, 0, 200, 50, 0x037a00, 1);
        bg.setStrokeStyle(2, 0xaaaaaa);
        container.add(bg);

        // Button text
        const text = this.add.text(0, 0, label, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        container.add(text);

        // Make interactive
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            bg.setFillStyle(0x025c00);
            text.setColor('#ffffff');
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(0x037a00);
            text.setColor('#ffffff');
        });

        bg.on('pointerdown', () => {
            callback();
        });

        return container;
    }





    private resumeGame(): void {
        this.scene.stop(SceneNames.Settings);
        const levelSceneName = this.scene.manager.isPaused(SceneNames.Level1) ? SceneNames.Level1 : SceneNames.Level2;
        const levelScene = this.scene.get(levelSceneName) as any;
        levelScene?.resumeFromPause();
    }

    private restartLevel(): void {
        const levelSceneName = this.scene.manager.isPaused(SceneNames.Level1) ? SceneNames.Level1 : SceneNames.Level2;
        this.scene.stop(SceneNames.PauseMenu);
        this.scene.stop(SceneNames.LevelInfo);
        this.scene.stop(levelSceneName);
        this.scene.start(levelSceneName);
    }

    private quitLevel(): void {
        this.scene.stop(SceneNames.PauseMenu);
        const levelScene = this.scene.manager.isActive(SceneNames.Level1) || this.scene.manager.isPaused(SceneNames.Level1) ? SceneNames.Level1 : SceneNames.Level2;
        this.scene.stop(levelScene);
        const levelInfoScene = this.scene.get(SceneNames.LevelInfo) as any;
        levelInfoScene?.stopTimer();
        levelInfoScene?.setLevelMetadata(null);
        this.scene.stop(SceneNames.LevelInfo);
        this.scene.start(SceneNames.Start);
    }
}
