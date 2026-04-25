import { Scene, GameObjects } from 'phaser';
import { LevelGrid } from '../grid/LevelGrid';

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
    private levelGrid: LevelGrid = null;
    private gridVisualsContainer: GameObjects.Container = null;

    private static readonly PANEL_WIDTH = 1435;
    private static readonly PANEL_HEIGHT = 580;

    constructor(scene: Scene) {
        this.scene = scene;
        this.createLevelZone();
    }

    private createLevelZone() {
        this.levelZoneContainer = this.scene.add.container(445, 65);
        this.levelZoneContainer.setDepth(50);

        // Create a sub-container for grid visuals
        this.gridVisualsContainer = this.scene.add.container(0, 0);
        this.levelZoneContainer.add(this.gridVisualsContainer);

        // Debug: Add a visible background to verify container is positioned correctly
        const bg = this.scene.add.rectangle(0, 0, LevelZoneScene.PANEL_WIDTH, LevelZoneScene.PANEL_HEIGHT, 0x222222, 0.5);
        bg.setOrigin(0, 0);
        this.levelZoneContainer.add(bg);

    }

    /**
     * Initialize the grid visuals from a LevelGrid
     */
    public initializeGridVisuals(grid: LevelGrid): void {
        this.levelGrid = grid;
        this.renderGridVisuals();
    }

    private renderGridVisuals(): void {
        if (!this.levelGrid) return;

        // Clear existing grid visuals
        this.gridVisualsContainer.removeAll(true);

        const dims = this.levelGrid.getGridDimensions();
        const movementGrid = this.levelGrid.getMovementGrid();
        const actionZones = this.levelGrid.getActionZones();
        const robotPos = this.levelGrid.getRobotPosition();

        // Draw grid cells
        for (let row = 0; row < dims.rows; row++) {
            for (let col = 0; col < dims.cols; col++) {
                const cell = movementGrid[row][col];
                const cellX = col * dims.cellWidth;
                const cellY = row * dims.cellHeight;

                // Draw cell background
                const cellColor = cell.walkable ? 0x4a4a4a : 0x8b0000;
                const rect = this.scene.add.rectangle(
                    cellX,
                    cellY,
                    dims.cellWidth,
                    dims.cellHeight,
                    cellColor,
                    0.4
                );
                rect.setOrigin(0, 0);
                rect.setStrokeStyle(1, 0xcccccc);
                this.gridVisualsContainer.add(rect);

                // Draw cell coordinate text for debugging
                const text = this.scene.add.text(
                    cellX + dims.cellWidth / 2,
                    cellY + dims.cellHeight / 2,
                    `(${col},${row})`,
                    {
                        fontSize: '12px',
                        color: '#999999',
                        align: 'center'
                    }
                );
                text.setOrigin(0.5, 0.5);
                this.gridVisualsContainer.add(text);
            }
        }

        // Draw action zones with special markers
        actionZones.forEach(zone => {
            const zoneX = zone.x * dims.cellWidth;
            const zoneY = zone.y * dims.cellHeight;

            // Draw action zone indicator
            const actionColor = zone.actionType === 'put' ? 0x4169E1 : 0x32CD32;
            const actionMarker = this.scene.add.rectangle(
                zoneX + dims.cellWidth / 2,
                zoneY + dims.cellHeight / 2,
                dims.cellWidth * 0.6,
                dims.cellHeight * 0.6,
                actionColor,
                0.6
            );
            actionMarker.setOrigin(0.5, 0.5);
            actionMarker.setStrokeStyle(2, 0xffffff);
            this.gridVisualsContainer.add(actionMarker);

            // Draw action type label
            const actionLabel = this.scene.add.text(
                zoneX + dims.cellWidth / 2,
                zoneY + dims.cellHeight / 2,
                `${zone.label}\n(${zone.actionType.toUpperCase()[0]})`,
                {
                    fontSize: '14px',
                    fontStyle: 'bold',
                    color: '#ffffff',
                    align: 'center'
                }
            );
            actionLabel.setOrigin(0.5, 0.5);
            this.gridVisualsContainer.add(actionLabel);
        });

        // Draw robot position
        const robotCellX = robotPos.x * dims.cellWidth;
        const robotCellY = robotPos.y * dims.cellHeight;
        const robotMarker = this.scene.add.rectangle(
            robotCellX + dims.cellWidth / 2,
            robotCellY + dims.cellHeight / 2,
            dims.cellWidth * 0.4,
            dims.cellHeight * 0.4,
            0xFF6347,
            0.8
        );
        robotMarker.setOrigin(0.5, 0.5);
        robotMarker.setStrokeStyle(2, 0xFFFFFF);
        this.gridVisualsContainer.add(robotMarker);
    }

    /**
     * Get the container for further manipulation
     */
    public getContainer(): GameObjects.Container {
        return this.levelZoneContainer;
    }

    /**
     * Get all zones (for legacy compatibility)
     */
    public getZones(): LevelZone[] {
        return this.zones;
    }

    /**
     * Add a new zone to the level (for legacy compatibility)
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
    }

}
