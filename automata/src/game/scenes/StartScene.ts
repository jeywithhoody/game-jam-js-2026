import { Scene, GameObjects, Geom } from 'phaser';
import SceneNames from './SceneName';

export class StartScene extends Scene {
    private robot: GameObjects.Sprite;
    private levelOverlay: GameObjects.Container;

    constructor() {
        super(SceneNames.Start);
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('game-start', 'game-start.png');
        this.load.image('play-btn', 'play-btn.png');
        this.load.image('credits-btn', 'credits-btn.png');
        this.load.image('robot-profil0000', 'robot-profil0000.png');
        this.load.image('robot-profil0003', 'robot-profil0003.png');
        this.load.image('robot-profil0006', 'robot-profil0006.png');
        this.load.image('robot-profil0009', 'robot-profil0009.png');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

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
        playBtn.on('pointerdown', () => this.showLevelOverlay());

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
        settingsBtn.on('pointerdown', () => this.scene.launch(SceneNames.Settings, { previousScene: SceneNames.Start }));

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

        // Level overlay (hidden by default)
        this.levelOverlay = this.buildLevelOverlay();
        this.levelOverlay.setVisible(false);
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

    // ── Level overlay ──────────────────────────────────────────────────────

    private buildLevelOverlay(): GameObjects.Container {
        const W = this.scale.width;
        const H = this.scale.height;
        const container = this.add.container(0, 0).setDepth(50);

        // Dark backdrop — blocks clicks on scene beneath
        const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75)
            .setInteractive();
        container.add(backdrop);

        // Panel
        const panelW = 640;
        const panelH = 420;
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

        // Level 1 button
        const lvl1Bg = this.add.rectangle(W / 2, H / 2 - 20, 460, 90, 0x037a00)
            .setStrokeStyle(2, 0xaaaaaa)
            .setInteractive({ useHandCursor: true });
        const lvl1Text = this.add.text(W / 2, H / 2 - 20, 'Level 1 : Lavomata', {
            fontSize: '26px',
            color: '#ffffff',
            fontFamily: 'Arial',
        }).setOrigin(0.5, 0.5);
        lvl1Bg.on('pointerover', () => { lvl1Bg.setFillStyle(0x025c00); lvl1Text.setColor('#ffffff'); });
        lvl1Bg.on('pointerout', () => { lvl1Bg.setFillStyle(0x037a00); lvl1Text.setColor('#ffffff'); });
        lvl1Bg.on('pointerdown', () => this.scene.start(SceneNames.Level1));
        container.add(lvl1Bg);
        container.add(lvl1Text);

        // Close button
        const closeBtn = this.add.text(W / 2, H / 2 + panelH / 2 - 40, '✕  FERMER', {
            fontSize: '20px',
            color: '#aaaaaa',
            fontFamily: 'Arial',
        }).setOrigin(0.5, 0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
        closeBtn.on('pointerout', () => closeBtn.setColor('#aaaaaa'));
        closeBtn.on('pointerdown', () => this.levelOverlay.setVisible(false));
        container.add(closeBtn);

        return container;
    }

    private showLevelOverlay(): void {
        this.levelOverlay.setVisible(true);
    }
}
