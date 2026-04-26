import { Scene, GameObjects, Geom } from 'phaser';
import SceneNames from './SceneName';

export class StartScene extends Scene {
    private robot: GameObjects.Sprite;
    private creditsOverlay: GameObjects.Container;
    private buttons: GameObjects.Image[] = [];

    constructor() {
        super(SceneNames.Start);
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('game-start', 'game-start.png');
        this.load.image('play-btn', 'play-btn.png');
        this.load.image('credits-btn', 'credits-btn.png');
        this.load.image('credits-panel', 'credits-panel.png');
        this.load.image('robot-profil0000', 'robot-profil0000.png');
        this.load.image('robot-profil0003', 'robot-profil0003.png');
        this.load.image('robot-profil0006', 'robot-profil0006.png');
        this.load.image('robot-profil0009', 'robot-profil0009.png');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.events.on("shutdown", () => {
          this.buttons.forEach((btn) => {
            btn.off("pointerover");
            btn.off("pointerout");
            btn.off("pointerdown");
          });
          this.buttons = [];
        });

        // Background
        this.add.image(0, 0, 'game-start')
            .setOrigin(0, 0)
            .setDisplaySize(W, H);

        // Robot walk animation (right-facing profile)
        this.anims.create({
            key: 'robot-start-walk',
            frames: [
                { key: 'robot-profil0000' },
                { key: 'robot-profil0003' },
                { key: 'robot-profil0006' },
                { key: 'robot-profil0009' },
            ],
            frameRate: 8,
            repeat: -1,
        });

        this.robot = this.add.sprite(-120, H * 0.78, 'robot-profil0000');
        this.robot.setCrop(40, 40, 149, 205);
        this.robot.setScale(0.8);
        this.robot.setDepth(10);
        this.robot.play('robot-start-walk');
        this.spawnRobot(false);

        // Play button
        const playBtn = this.add.image(W / 2, H * 0.55, 'play-btn')
            .setCrop(792, 657, 407, 110)
            .setDepth(20)
            .setInteractive({
                hitArea: new Geom.Rectangle(W / 2 - 407 / 2, H * 0.55 + 110 / 2 , 407, 110),
                hitAreaCallback: Geom.Rectangle.Contains,
                useHandCursor: true,
            });
        playBtn.on('pointerover', () => playBtn.setAlpha(0.90));
        playBtn.on('pointerout', () => playBtn.setAlpha(1));
        playBtn.on('pointerdown', () => {
            this.scene.get(SceneNames.SoundScene).playButtonClick();
            this.buttons.forEach((btn) => btn.disableInteractive());
            this.scene.launch(SceneNames.LevelSelect, { isOverlay: true });
        });
       this.buttons.push(playBtn);

        // Settings button
        const settingsBtn = this.add.image(W / 2, H * 0.55, 'settings-btn')
            .setCrop(790, 773, 407, 120)
            .setDepth(50)
            .setInteractive({
                hitArea: new Geom.Rectangle(W / 2 - 407 / 2, H * 0.65 + 120 / 2, 407, 120),
                hitAreaCallback: Geom.Rectangle.Contains,
                useHandCursor: true,
            });
        settingsBtn.on('pointerover', () => settingsBtn.setAlpha(0.90));
        settingsBtn.on('pointerout', () => settingsBtn.setAlpha(1));
        settingsBtn.on('pointerdown', () => {
            this.scene.get(SceneNames.SoundScene).playButtonClick();
            this.scene.launch(SceneNames.Settings, { previousScene: SceneNames.Start });
        });
        this.buttons.push(settingsBtn);

        // Credits button
        const creditsBtn = this.add.image(W / 2, H * 0.55, 'credits-btn')
            .setCrop(789, 892, 408, 120)
            .setDepth(20)
            .setInteractive({
                hitArea: new Geom.Rectangle(W / 2 - 407 / 2, H * 0.75 + 120 / 2 , 407, 120),
                hitAreaCallback: Geom.Rectangle.Contains,
                useHandCursor: true,
            });
        creditsBtn.on('pointerover', () => creditsBtn.setAlpha(0.90));
        creditsBtn.on('pointerout', () => creditsBtn.setAlpha(1));
        creditsBtn.on('pointerdown', () => {
            this.scene.get(SceneNames.SoundScene).playButtonClick();
            this.showCreditsOverlay();
        });
        this.buttons.push(creditsBtn);

        // Credits overlay (hidden by default)
        this.creditsOverlay = this.buildCreditsOverlay();
        this.creditsOverlay.setVisible(false);
    }

    // ── Robot walk loop ────────────────────────────────────────────────────

    private spawnRobot(reverse: boolean): void {
        const randomY = 800 + Math.random() * 500;
        this.robot.y = randomY;
        this.robot.x = reverse ? this.scale.width + 750 : 0;

        this.walkRobot(reverse);
    }

    private walkRobot(fromRight: boolean = true): void {
        const W = this.scale.width;
        this.tweens.add({
            targets: this.robot,
            x: !fromRight ? W + 750 : -120,
            duration: 8000,
            ease: 'Linear',
            onComplete: () => setTimeout(() => this.spawnRobot(!fromRight), 500),
        });
    }

    // ── Credits overlay ────────────────────────────────────────────────────

    private buildCreditsOverlay(): GameObjects.Container {
        const W = this.scale.width;
        const H = this.scale.height;
        const container = this.add.container(0, 0).setDepth(50);

        // Dark backdrop — blocks clicks on scene beneath
        const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
            .setInteractive();
        container.add(backdrop);

        // Credits panel
        const creditsPanel = this.add.image(W / 2, H / 2, 'credits-panel');
        container.add(creditsPanel);

        // Close button
        const closeBtn = this.add.text(W / 2, H / 2 + 250, '✕  CLOSE', {
            fontSize: '20px',
            color: '#000000',
            fontFamily: 'Arial',
        }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#000000'));
        closeBtn.on('pointerdown', () => {
            this.scene.get(SceneNames.SoundScene).playButtonClick();
            this.creditsOverlay.setVisible(false);
        });
        container.add(closeBtn);

        return container;
    }

    private showCreditsOverlay(): void {
        this.creditsOverlay.setVisible(true);
    }
}
