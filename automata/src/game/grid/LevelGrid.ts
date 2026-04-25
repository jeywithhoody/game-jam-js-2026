export interface GridCell {
    x: number;
    y: number;
    walkable: boolean;
}

export interface ActionZone {
    x: number;
    y: number;
    actionType: 'put' | 'take';
    itemType?: string;
    label: string;
}

export class LevelGrid {
    protected gridCols: number;
    protected gridRows: number;
    protected cellWidth: number;
    protected cellHeight: number;
    protected movementGrid: GridCell[][];
    protected actionGrid: ActionZone[] = [];
    protected robotX: number = 0;
    protected robotY: number = 0;

    constructor(
        gridCols: number,
        gridRows: number,
        totalWidth: number,
        totalHeight: number
    ) {
        this.gridCols = gridCols;
        this.gridRows = gridRows;
        this.cellWidth = totalWidth / gridCols;
        this.cellHeight = totalHeight / gridRows;
        this.initializeMovementGrid();
    }

    private initializeMovementGrid(): void {
        this.movementGrid = [];
        for (let row = 0; row < this.gridRows; row++) {
            const gridRow: GridCell[] = [];
            for (let col = 0; col < this.gridCols; col++) {
                gridRow.push({
                    x: col,
                    y: row,
                    walkable: true
                });
            }
            this.movementGrid.push(gridRow);
        }
    }

    /**
     * Set a cell as walkable or blocked
     */
    public setWalkable(gridX: number, gridY: number, walkable: boolean): void {
        if (this.isValidGridPosition(gridX, gridY)) {
            this.movementGrid[gridY][gridX].walkable = walkable;
        }
    }

    /**
     * Add an action zone to the grid
     */
    public addActionZone(gridX: number, gridY: number, actionType: 'put' | 'take', label: string, itemType?: string): void {
        if (this.isValidGridPosition(gridX, gridY)) {
            this.actionGrid.push({
                x: gridX,
                y: gridY,
                actionType,
                itemType,
                label
            });
        }
    }

    /**
     * Set the initial robot position
     */
    public setRobotPosition(gridX: number, gridY: number): void {
        if (this.isValidGridPosition(gridX, gridY)) {
            this.robotX = gridX;
            this.robotY = gridY;
        }
    }

    /**
     * Get the robot's current grid position
     */
    public getRobotPosition(): { x: number; y: number } {
        return { x: this.robotX, y: this.robotY };
    }

    /**
     * Check if a move is valid based on card direction
     */
    public canMove(direction: 'up' | 'down' | 'left' | 'right', distance: number = 1): boolean {
        let newX = this.robotX;
        let newY = this.robotY;

        switch (direction) {
            case 'up':
                newY -= distance;
                break;
            case 'down':
                newY += distance;
                break;
            case 'left':
                newX -= distance;
                break;
            case 'right':
                newX += distance;
                break;
        }

        return this.isValidGridPosition(newX, newY) && this.movementGrid[newY][newX].walkable;
    }

    /**
     * Move the robot in a direction
     */
    public moveRobot(direction: 'up' | 'down' | 'left' | 'right', distance: number = 1): boolean {
        if (this.canMove(direction, distance)) {
            switch (direction) {
                case 'up':
                    this.robotY -= distance;
                    break;
                case 'down':
                    this.robotY += distance;
                    break;
                case 'left':
                    this.robotX -= distance;
                    break;
                case 'right':
                    this.robotX += distance;
                    break;
            }
            return true;
        }
        return false;
    }

    /**
     * Get the world position of a grid cell
     */
    public getWorldPosition(gridX: number, gridY: number): { x: number; y: number } {
        return {
            x: gridX * this.cellWidth + this.cellWidth / 2,
            y: gridY * this.cellHeight + this.cellHeight / 2
        };
    }

    /**
     * Get the grid position of a world coordinate
     */
    public getGridPosition(worldX: number, worldY: number): { x: number; y: number } | null {
        const gridX = Math.floor(worldX / this.cellWidth);
        const gridY = Math.floor(worldY / this.cellHeight);

        if (this.isValidGridPosition(gridX, gridY)) {
            return { x: gridX, y: gridY };
        }
        return null;
    }

    /**
     * Check if a grid position is valid
     */
    protected isValidGridPosition(gridX: number, gridY: number): boolean {
        return gridX >= 0 && gridX < this.gridCols && gridY >= 0 && gridY < this.gridRows;
    }

    /**
     * Get the movement grid
     */
    public getMovementGrid(): GridCell[][] {
        return this.movementGrid;
    }

    /**
     * Get action zones
     */
    public getActionZones(): ActionZone[] {
        return this.actionGrid;
    }

    /**
     * Get grid dimensions
     */
    public getGridDimensions(): { cols: number; rows: number; cellWidth: number; cellHeight: number } {
        return {
            cols: this.gridCols,
            rows: this.gridRows,
            cellWidth: this.cellWidth,
            cellHeight: this.cellHeight
        };
    }

    /**
     * Check if there's an action zone at the given position
     */
    public getActionZoneAt(gridX: number, gridY: number, actionType?: 'put' | 'take'): ActionZone | undefined {
        return this.actionGrid.find(zone =>
            zone.x === gridX && zone.y === gridY && (actionType === undefined || zone.actionType === actionType)
        );
    }
}
