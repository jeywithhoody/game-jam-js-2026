import { Scene, GameObjects, Input } from 'phaser';
import SceneNames from './SceneName';

export class SettingsScene extends Scene {
    private masterVolumeSlider: GameObjects.Container;
    private sfxVolumeSlider: GameObjects.Container;
    private brightnessSlider: GameObjects.Container;
    private previousScene: string = SceneNames.Start;

    constructor() {
        super(SceneNames.Settings);
    }

    init(data: { previousScene?: string }) {
        if (data?.previousScene) {
            this.previousScene = data.previousScene;
        }
    }

    create() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Dark overlay
        const overlay = this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.75);
        overlay.setDepth(200);

        // Settings background
        const settingsBg = this.add.rectangle(
            centerX, centerY,
            500, 400,
            0x1a1a1a, 0.95
        );
        settingsBg.setStrokeStyle(3, 0x025c00);
        settingsBg.setDepth(201);

        // Title
        const title = this.add.text(centerX, centerY - 150, 'SETTINGS', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        title.setDepth(202);

        // Master Volume Label
        const masterLabel = this.add.text(centerX - 200, centerY - 80, 'Master Volume:', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        masterLabel.setDepth(202);

        // Master Volume Slider
        this.masterVolumeSlider = this.createSlider(
            centerX - 200, centerY - 50,
            this.sound.volume,
            (value) => {
                this.sound.volume = value;
            }
        );
        this.masterVolumeSlider.setDepth(202);

        // SFX Volume Label
        const sfxLabel = this.add.text(centerX - 200, centerY - 10, 'SFX Volume:', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        sfxLabel.setDepth(202);

        // SFX Volume Slider (stored in registry)
        const sfxVolume = this.registry.get('sfxVolume') || 1;
        this.sfxVolumeSlider = this.createSlider(
            centerX - 200, centerY + 20,
            sfxVolume,
            (value) => {
                this.registry.set('sfxVolume', value);
            }
        );
        this.sfxVolumeSlider.setDepth(202);

        // Brightness Label
        const brightnessLabel = this.add.text(centerX - 200, centerY + 60, 'Brightness:', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        brightnessLabel.setDepth(202);

        // Brightness Slider (stored in registry)
        const brightness = this.registry.get('brightness') || 1;
        this.brightnessSlider = this.createSlider(
            centerX - 200, centerY + 90,
            brightness,
            (value) => {
                this.registry.set('brightness', value);
            }
        );
        this.brightnessSlider.setDepth(202);

        // Back Button
        const backButton = this.createButton(centerX, centerY + 160, 'BACK', () => {
            this.closeSettings();
        });
        backButton.setDepth(202);

        // Handle Escape to close
        this.input.keyboard.on('keydown-ESC', () => {
            this.closeSettings();
        });
    }

    private createButton(x: number, y: number, label: string, callback: () => void): GameObjects.Text {
        const btn = this.add.text(x, y, '✕  ' + label, {
            fontSize: '20px',
            color: '#aaaaaa',
            fontFamily: 'Arial',
        }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => btn.setColor('#ffffff'));
        btn.on('pointerout', () => btn.setColor('#aaaaaa'));
        btn.on('pointerdown', () => callback());

        return btn;
    }

    private createSlider(x: number, y: number, initialValue: number, onChange: (value: number) => void): GameObjects.Container {
        const container = this.add.container(x, y);

        // Slider track
        const track = this.add.rectangle(0, 0, 250, 10, 0x444444);
        track.setOrigin(0, 0.5);
        container.add(track);

        // Slider handle
        const handle = this.add.circle(initialValue * 250, 0, 8, 0x025c00);
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

    private closeSettings(): void {
        this.scene.stop(SceneNames.Settings);
        // Resume the previous scene if it was paused
        if (this.previousScene === SceneNames.PauseMenu) {
            this.scene.resume(SceneNames.PauseMenu);
        }
    }
}
