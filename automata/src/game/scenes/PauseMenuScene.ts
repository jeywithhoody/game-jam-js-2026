import { Scene, GameObjects, Input } from 'phaser';
import SceneNames from './SceneName';

export class PauseMenuScene extends Scene {
    private pauseGraphics: GameObjects.Graphics;
    private resumeButton: GameObjects.Container;
    private quitButton: GameObjects.Container;
    private settingsButton: GameObjects.Container;
    private masterVolumeSlider: GameObjects.Container;
    private sfxVolumeSlider: GameObjects.Container;
    private brightnessSlider: GameObjects.Container;
    private settingsPanel: GameObjects.Container;
    private showingSettings: boolean = false;
    private brightnessOverlay: GameObjects.Rectangle;

    constructor() {
        super(SceneNames.PauseMenu);
    }

    create() {
        // Create brightness overlay (initially transparent)
        this.brightnessOverlay = this.add.rectangle(
            this.scale.width / 2, this.scale.height / 2,
            this.scale.width, this.scale.height,
            0x000000, 0
        );
        this.brightnessOverlay.setDepth(199);

        // Pause overlay - semi-transparent black
        this.pauseGraphics = this.add.graphics();
        this.pauseGraphics.fillStyle(0x000000, 0.7);
        this.pauseGraphics.fillRect(0, 0, this.scale.width, this.scale.height);
        this.pauseGraphics.setDepth(200);

        // Create main menu
        this.createMainMenu();

        // Create settings panel (hidden by default)
        this.settingsPanel = this.add.container(0, 0);
        this.settingsPanel.setDepth(210);
        this.settingsPanel.setVisible(false);
        this.createSettingsPanel();

        // Handle Escape to resume
        this.input.keyboard.on('keydown-ESC', () => {
            this.resumeGame();
        });
    }

    private createMainMenu(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Title
        const title = this.add.text(centerX, centerY - 150, 'PAUSED', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setDepth(201);

        // Resume Button
        this.resumeButton = this.createButton(centerX, centerY - 30, 'RESUME (ESC)', () => {
            this.resumeGame();
        });

        // Settings Button
        this.settingsButton = this.createButton(centerX, centerY + 30, 'SETTINGS', () => {
            this.showSettings();
        });

        // Quit Button
        this.quitButton = this.createButton(centerX, centerY + 90, 'QUIT LEVEL', () => {
            this.quitLevel();
        });
    }

    private createSettingsPanel(): void {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Settings background
        const settingsBg = this.add.rectangle(
            centerX, centerY,
            500, 400,
            0x1a1a1a, 0.95
        );
        settingsBg.setStrokeStyle(3, 0x00ff00);
        this.settingsPanel.add(settingsBg);

        // Title
        const title = this.add.text(centerX, centerY - 150, 'SETTINGS', {
            fontSize: '32px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        this.settingsPanel.add(title);

        // Master Volume Label
        const masterLabel = this.add.text(centerX - 200, centerY - 80, 'Master Volume:', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.settingsPanel.add(masterLabel);

        // Master Volume Slider
        this.masterVolumeSlider = this.createSlider(
            centerX - 200, centerY - 50,
            this.sound.volume,
            (value) => {
                this.sound.volume = value;
            }
        );
        this.settingsPanel.add(this.masterVolumeSlider);

        // SFX Volume Label
        const sfxLabel = this.add.text(centerX - 200, centerY - 10, 'SFX Volume:', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.settingsPanel.add(sfxLabel);

        // SFX Volume Slider (stored in registry)
        const sfxVolume = this.registry.get('sfxVolume') || 1;
        this.sfxVolumeSlider = this.createSlider(
            centerX - 200, centerY + 20,
            sfxVolume,
            (value) => {
                this.registry.set('sfxVolume', value);
            }
        );
        this.settingsPanel.add(this.sfxVolumeSlider);

        // Brightness Label
        const brightnessLabel = this.add.text(centerX - 200, centerY + 60, 'Brightness:', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.settingsPanel.add(brightnessLabel);

        // Brightness Slider (stored in registry)
        const brightness = this.registry.get('brightness') || 1;
        this.brightnessSlider = this.createSlider(
            centerX - 200, centerY + 90,
            brightness,
            (value) => {
                this.registry.set('brightness', value);
                this.applyBrightness(value);
            }
        );
        this.settingsPanel.add(this.brightnessSlider);

        // Back Button
        const backButton = this.createButton(centerX, centerY + 160, 'BACK', () => {
            this.hideSettings();
        });
        this.settingsPanel.add(backButton);
    }

    private createButton(x: number, y: number, label: string, callback: () => void): GameObjects.Container {
        const container = this.add.container(x, y);
        container.setDepth(202);

        // Button background
        const bg = this.add.rectangle(0, 0, 200, 50, 0x00ff00, 0.2);
        bg.setStrokeStyle(2, 0x00ff00);
        container.add(bg);

        // Button text
        const text = this.add.text(0, 0, label, {
            fontSize: '18px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        container.add(text);

        // Make interactive
        bg.setInteractive({ useHandCursor: true });

        let isHovering = false;
        bg.on('pointerover', () => {
            isHovering = true;
            bg.setFillStyle(0x00ff00, 0.4);
            text.setColor('#000000');
        });

        bg.on('pointerout', () => {
            isHovering = false;
            bg.setFillStyle(0x00ff00, 0.2);
            text.setColor('#00ff00');
        });

        bg.on('pointerdown', () => {
            callback();
        });

        return container;
    }

    private createSlider(x: number, y: number, initialValue: number, onChange: (value: number) => void): GameObjects.Container {
        const container = this.add.container(x, y);

        // Slider track
        const track = this.add.rectangle(0, 0, 250, 10, 0x444444);
        track.setOrigin(0, 0.5);
        container.add(track);

        // Slider handle
        const handle = this.add.circle(initialValue * 250, 0, 8, 0x00ff00);
        handle.setOrigin(0.5);
        container.add(handle);

        // Value text
        const valueText = this.add.text(260, 0, `${Math.round(initialValue * 100)}%`, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        valueText.setOrigin(0, 0.5);
        container.add(valueText);

        // Make handle draggable
        handle.setInteractive({ draggable: true, useHandCursor: true });

        this.input.setDraggable(handle);

        const updateSlider = (newValue: number) => {
            const clamped = Math.max(0, Math.min(1, newValue));
            handle.x = clamped * 250;
            valueText.setText(`${Math.round(clamped * 100)}%`);
            onChange(clamped);
        };

        this.input.on('drag', (pointer: Input.Pointer, gameObject: any) => {
            if (gameObject === handle) {
                const localX = pointer.x - (x + track.getTopLeft().x);
                const newValue = localX / 250;
                updateSlider(newValue);
            }
        });

        track.setInteractive({ useHandCursor: true });
        track.on('pointerdown', (pointer: Input.Pointer) => {
            const localX = pointer.x - (x + track.getTopLeft().x);
            const newValue = localX / 250;
            updateSlider(newValue);
        });

        return container;
    }

    private showSettings(): void {
        this.showingSettings = true;
        this.settingsPanel.setVisible(true);
        this.resumeButton.setVisible(false);
        this.quitButton.setVisible(false);
        this.settingsButton.setVisible(false);
    }

    private hideSettings(): void {
        this.showingSettings = false;
        this.settingsPanel.setVisible(false);
        this.resumeButton.setVisible(true);
        this.quitButton.setVisible(true);
        this.settingsButton.setVisible(true);
    }

    private applyBrightness(brightness: number): void {
        // Apply brightness using overlay opacity
        // brightness 0 = dark (high opacity), brightness 1 = normal (no opacity)
        const alpha = Math.max(0, 1 - brightness); // Invert: 1=dark, 0=bright
        this.brightnessOverlay.setAlpha(alpha);
    }

    private resumeGame(): void {
        const levelSceneName = this.scene.manager.isPaused(SceneNames.Level1) ? SceneNames.Level1 : SceneNames.Level2;
        const levelScene = this.scene.get(levelSceneName) as any;
        levelScene?.resumeFromPause();
    }

    private quitLevel(): void {
        this.scene.stop(SceneNames.PauseMenu);
        const levelScene = this.scene.manager.isActive(SceneNames.Level1) || this.scene.manager.isPaused(SceneNames.Level1) ? SceneNames.Level1 : SceneNames.Level2;
        this.scene.stop(levelScene);
        const levelInfoScene = this.scene.get(SceneNames.LevelInfo) as any;
        levelInfoScene?.stopTimer();
        levelInfoScene?.setLevelMetadata(null);
        this.scene.stop(SceneNames.LevelInfo);
        this.scene.start(SceneNames.LevelSelect);
    }
}
