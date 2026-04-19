import { Scene, GameObjects } from 'phaser';

interface LevelZone {
    x: number;
    y: number;
    hasWasher: boolean;
    hasRobot: boolean;
}

export class LevelZoneScene {
    private scene: Scene;
    private levelZoneContainer: GameObjects.Container;
    private zones: LevelZone[] = [];
    private zoneSize: number = 200;
    private gridCols: number = 3;
    private gridRows: number = 2;
    private padding: number = 20;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createLevelZone();
    }

    private createLevelZone() {
        this.levelZoneContainer = this.scene.add.container(445, 65);
        this.levelZoneContainer.setDepth(50);

        // Debug: Add a visible background to verify container is positioned correctly
        const bg = this.scene.add.rectangle(0, 0, 1435, 580, 0x222222, 0.5);
        bg.setOrigin(0, 0);
        this.levelZoneContainer.add(bg);
    }

    private createZoneVisuals(zone: LevelZone) {
        // Create zone rectangle background
        const rect = this.scene.add.rectangle(
            zone.x,
            zone.y,
            this.zoneSize,
            this.zoneSize,
            0x4a4a4a,
            0.6
        );
        rect.setOrigin(0, 0);
        rect.setStrokeStyle(2, 0xcccccc);
        this.levelZoneContainer.add(rect);

        // Add washer machine animation if zone has washer
        if (zone.hasWasher) {
            this.createWasherAnimation(zone);
        }

        // Add robot if zone has robot
        if (zone.hasRobot) {
            this.createRobotDisplay(zone);
        }
    }

    private createWasherAnimation(zone: LevelZone) {
        // Create washer machine animation
        const washerX = zone.x + this.zoneSize / 2 - 40;
        const washerY = zone.y + this.zoneSize / 2 - 40;

        const washerSprite = this.scene.add.sprite(washerX, washerY, 'washer-machine-run1');
        washerSprite.setOrigin(0, 0);
        washerSprite.setDisplaySize(80, 80);

        // Create animation for washer machine
        if (!this.scene.anims.exists('washer-run')) {
            this.scene.anims.create({
                key: 'washer-run',
                frames: [
                    { key: 'washer-machine-run1' },
                    { key: 'washer-machine-run2' },
                    { key: 'washer-machine-run3' },
                    { key: 'washer-machine-run5' },
                    { key: 'washer-machine-run6' }
                ],
                frameRate: 8,
                repeat: -1
            });
        }

        washerSprite.play('washer-run');
        this.levelZoneContainer.add(washerSprite);
    }

    private createRobotDisplay(zone: LevelZone) {
        // Display static robot in profile view
        const robotX = zone.x + this.zoneSize / 2 - 20;
        const robotY = zone.y + this.zoneSize - 50;

        const robotSprite = this.scene.add.sprite(robotX, robotY, 'robot-profil0000');
        robotSprite.setOrigin(0.5, 1); // Center horizontally, anchor at bottom
        robotSprite.setDisplaySize(40, 60);
        this.levelZoneContainer.add(robotSprite);
    }

    /**
     * Add a new zone to the level
     */
    public addZone(hasWasher: boolean = false, hasRobot: boolean = false) {
        // Calculate position for new zone
        const totalZones = this.zones.length;
        const col = totalZones % this.gridCols;
        const row = Math.floor(totalZones / this.gridCols);

        // Check if we're exceeding grid size
        if (row >= this.gridRows) {
            console.warn('Maximum zones reached for grid size');
            return;
        }

        const zoneX = col * (this.zoneSize + this.padding);
        const zoneY = row * (this.zoneSize + this.padding);

        const zone: LevelZone = { x: zoneX, y: zoneY, hasWasher, hasRobot };
        this.zones.push(zone);
        this.createZoneVisuals(zone);
    }

    /**
     * Get the container for further manipulation
     */
    public getContainer(): GameObjects.Container {
        return this.levelZoneContainer;
    }

    /**
     * Get all zones
     */
    public getZones(): LevelZone[] {
        return this.zones;
    }
}
