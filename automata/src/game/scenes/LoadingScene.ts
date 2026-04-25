import { Scene, GameObjects } from 'phaser';
import SceneNames from './SceneName';

export class LoadingScene extends Scene {
    private robot: GameObjects.Sprite;
    private barTrack: GameObjects.Rectangle;
    private barFill: GameObjects.Rectangle;
    private progressText: GameObjects.Text;

    private readonly BAR_W = 900;
    private readonly BAR_H = 18;

    constructor() {
        super(SceneNames.Loading);
    }

    preload() {
        const W = this.scale.width;
        const H = this.scale.height;
        const barX = (W - this.BAR_W) / 2;
        const barY = H * 0.72;

        this.load.image('robot-profil0000', 'robot-profil0000.png');
        this.load.image('robot-profil0003', 'robot-profil0003.png');
        this.load.image('robot-profil0006', 'robot-profil0006.png');
        this.load.image('robot-profil0009', 'robot-profil0009.png');

        this.anims.create({
            key: 'loading-robot-walk',
            frames: [
                { key: 'robot-profil0000' },
                { key: 'robot-profil0003' },
                { key: 'robot-profil0006' },
                { key: 'robot-profil0009' },
            ],
            frameRate: 8,
            repeat: -1,
        });

        // ── Background ────────────────────────────────────────────────────
        const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x0d0d1a);
        bg.setOrigin(0.5, 0.5);

        const title = this.add.text(W / 2, H * 0.55, 'LOADING...', {
            fontSize: '36px',
            color: '#aaaacc',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            letterSpacing: 8,
        }).setOrigin(0.5, 0.5);

        // ── Progress bar track ────────────────────────────────────────────
        this.barTrack = this.add.rectangle(barX, barY, this.BAR_W, this.BAR_H, 0x333355);
        this.barTrack.setOrigin(0, 0.5);
        this.barTrack.setStrokeStyle(2, 0x6666aa);

        this.barFill = this.add.rectangle(barX, barY, 0, this.BAR_H - 4, 0x8888ff);
        this.barFill.setOrigin(0, 0.5);

        // ── Percentage text ───────────────────────────────────────────────
        this.progressText = this.add.text(W / 2, barY + 28, '0%', {
            fontSize: '18px',
            color: '#aaaacc',
            fontFamily: 'Arial',
        }).setOrigin(0.5, 0);

        // ── Robot sprite (walks along the bar) ───────────────────────────
        this.robot = this.add.sprite(barX, barY, 'robot-profil0000');
        this.robot.setCrop(40, 40, 149, 205);
        this.robot.setScale(1);
        this.robot.setDepth(10);
        // The robot texture may not be cached yet on first frame; Phaser will
        // swap to the real texture automatically once loaded.

        // ── Load all game assets ──────────────────────────────────────────
        this.load.setPath('assets');

        // Start screen
        this.load.image('game-start',   'game-start.png');
        this.load.image('play-btn',     'play-btn.png');
        this.load.image('credits-btn',  'credits-btn.png');

        // UI elements
        this.load.image('controls',     'controls.png');
        this.load.image('settings-btn',  'settings-btn.png');

        // Backgrounds
        this.load.image('background',   'background.png');

        // Robot — front
        this.load.image('robot-front0000', 'robot-front0000.png');
        this.load.image('robot-front0003', 'robot-front0003.png');
        this.load.image('robot-front0006', 'robot-front0006.png');
        this.load.image('robot-front0009', 'robot-front0009.png');

        // Robot — right profile
        this.load.image('robot-profil0000', 'robot-profil0000.png');
        this.load.image('robot-profil0003', 'robot-profil0003.png');
        this.load.image('robot-profil0006', 'robot-profil0006.png');
        this.load.image('robot-profil0009', 'robot-profil0009.png');

        // Robot — left profile
        this.load.image('robot-profile-left0000', 'robot-profile-left0000.png');
        this.load.image('robot-profile-left0003', 'robot-profile-left0003.png');
        this.load.image('robot-profile-left0006', 'robot-profile-left0006.png');
        this.load.image('robot-profile-left0009', 'robot-profile-left0009.png');

        // Robot — back
        this.load.image('robot-back0000', 'robot-back0000.png');
        this.load.image('robot-back0003', 'robot-back0003.png');
        this.load.image('robot-back0006', 'robot-back0006.png');
        this.load.image('robot-back0009', 'robot-back0009.png');

        // Cards
        this.load.image('card-back',         'card-back.png');
        this.load.image('card-move-down-1',  'card-move-down-1.png');
        this.load.image('card-move-down-2',  'card-move-down-2.png');
        this.load.image('card-move-left-1',  'card-move-left-1.png');
        this.load.image('card-move-left-2',  'card-move-left-2.png');
        this.load.image('card-move-right-1', 'card-move-right-1.png');
        this.load.image('card-move-right-2', 'card-move-right-2.png');
        this.load.image('card-move-up-1',    'card-move-up-1.png');
        this.load.image('card-move-up-2',    'card-move-up-2.png');
        this.load.image('card-take-1',       'card-take-1.png');
        this.load.image('card-take-2',       'card-take-2.png');
        this.load.image('card-drop-1',       'card-drop-1.png');
        this.load.image('card-drop-2',       'card-drop-2.png');
        this.load.image('failed-panel',      'failed-panel.png');
        this.load.image('cards-combined', 'cards.png');

        // Washer machine
        this.load.image('washer-machine-run1', 'washer-machine-run1.png');
        this.load.image('washer-machine-run2', 'washer-machine-run2.png');
        this.load.image('washer-machine-run3', 'washer-machine-run3.png');
        this.load.image('washer-machine-run5', 'washer-machine-run5.png');
        this.load.image('washer-machine-run6', 'washer-machine-run6.png');

        // Cloth-sorting animation
        this.load.image('cloth-sorting0000',  'cloth-sorting0000.png');
        this.load.image('cloth-sorting0003',  'cloth-sorting0003.png');
        this.load.image('cloth-sorting0006',  'cloth-sorting0006.png');
        this.load.image('cloth-sorting0007',  'cloth-sorting0007.png');
        this.load.image('cloth-sorting0009',  'cloth-sorting0009.png');
        this.load.image('cloth-sorting0011',  'cloth-sorting0011.png');
        this.load.image('cloth-sorting0014',  'cloth-sorting0014.png');
        this.load.image('cloth-sorting0015',  'cloth-sorting0015.png');
        this.load.image('cloth-sorting0018',  'cloth-sorting0018.png');
        this.load.image('cloth-sorting0022',  'cloth-sorting0022.png');
        this.load.image('cloth-sorting0026',  'cloth-sorting0026.png');
        this.load.image('cloth-sorting0029',  'cloth-sorting0029.png');
        this.load.image('cloth-sorting0030',  'cloth-sorting0030.png');
        this.load.image('cloth-sorting0033',  'cloth-sorting0033.png');
        this.load.image('cloth-sorting0037',  'cloth-sorting0037.png');
        this.load.image('cloth-sorting0041',  'cloth-sorting0041.png');
        this.load.image('cloth-sorting0044',  'cloth-sorting0044.png');
        this.load.image('cloth-sorting0045',  'cloth-sorting0045.png');
        this.load.image('cloth-sorting0048',  'cloth-sorting0048.png');
        this.load.image('cloth-sorting0052',  'cloth-sorting0052.png');
        this.load.image('cloth-sorting0059',  'cloth-sorting0059.png');

        // ── Progress callback ─────────────────────────────────────────────
        this.load.on('progress', (value: number) => this.onProgress(value));
        this.load.on('complete', () => this.onComplete());
    }

    create() {
        // ── Cloth-sorting animation ───────────────────────────────────────
        if (!this.anims.exists('cloth-sorting-station')) {
            this.anims.create({
                key: 'cloth-sorting-station',
                frames: [
                    { key: 'cloth-sorting0000' },
                    { key: 'cloth-sorting0003' },
                    { key: 'cloth-sorting0006' },
                    { key: 'cloth-sorting0007' },
                    { key: 'cloth-sorting0009' },
                    { key: 'cloth-sorting0011' },
                    { key: 'cloth-sorting0014' },
                    { key: 'cloth-sorting0015' },
                    { key: 'cloth-sorting0018' },
                    { key: 'cloth-sorting0022' },
                    { key: 'cloth-sorting0026' },
                    { key: 'cloth-sorting0029' },
                    { key: 'cloth-sorting0030' },
                    { key: 'cloth-sorting0033' },
                    { key: 'cloth-sorting0037' },
                    { key: 'cloth-sorting0041' },
                    { key: 'cloth-sorting0044' },
                    { key: 'cloth-sorting0045' },
                    { key: 'cloth-sorting0048' },
                    { key: 'cloth-sorting0052' },
                    { key: 'cloth-sorting0059' },
                ],
                frameRate: 10,
                repeat: 4,
            });
        }

        //Add sound scene
        this.time.delayedCall(300, () => {
            this.scene.start(SceneNames.SoundScene);
        });

        // Start the robot walk animation now that textures are ready
        if (!this.anims.exists('loading-robot-walk')) {
            this.anims.create({
                key: 'loading-robot-walk',
                frames: [
                    { key: 'robot-profil0000' },
                    { key: 'robot-profil0003' },
                    { key: 'robot-profil0006' },
                    { key: 'robot-profil0009' },
                ],
                frameRate: 8,
                repeat: -1,
            });
        }
        this.robot.play('loading-robot-walk');
    }

    private onProgress(value: number): void {
        const barX = (this.scale.width - this.BAR_W) / 2;

        // Update fill width
        this.barFill.width = this.BAR_W * value;

        // Move robot to current progress position (centred on bar tip)
        this.robot.x = barX + this.BAR_W * value;
        this.robot.setTexture('robot-profil0000'); // ensure texture updates each tick

        // Update percentage label
        this.progressText.setText(`${Math.floor(value * 100)}%`);
    }

    private onComplete(): void {
        this.progressText.setText('100%');
        this.barFill.width = this.BAR_W;

        // Short pause then go to start screen
        this.time.delayedCall(300, () => {
            this.scene.start(SceneNames.Start);
        });
    }
}
