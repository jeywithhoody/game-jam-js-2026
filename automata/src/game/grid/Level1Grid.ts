import { LevelGrid } from './LevelGrid';

/**
 * Level1Grid - Grid configuration for Level 1 (Lavomata)
 * 
 * Layout:
 * - Starting position: (0, 0) - where robot begins
 * - Washer zone: (2, 0) - where clothes are washed
 * - Sorting zone: (1, 1) - where clothes are sorted
 * - Dryer zone: (3, 1) - where clothes are dried
 * - Basket zone: (4, 0) - where clean clothes go
 * - Folding zone: (2, 2) - where clothes are folded
 */
export class Level1Grid extends LevelGrid {
    constructor() {
        // Grid dimensions: 5 columns x 3 rows to fit in 1435x580
        // This gives us cells of ~287x193 pixels
        super(5, 3, 1435, 580);
        this.setupLevel1Grid();
    }

    private setupLevel1Grid(): void {
        // Robot starts at position (0, 1) - left side, middle row
        this.setRobotPosition(0, 1);

        // Define action zones
        // Washer machine at column 2, row 0 - put action (put dirty clothes)
        this.addActionZone(2, 0, 'put', 'dirty-clothes');

        // Sorting zone at column 1, row 1 - take action (take sorted clothes)
        this.addActionZone(1, 1, 'take', 'sorted-clothes');

        // Dryer at column 3, row 1 - put action (put wet clothes)
        this.addActionZone(3, 1, 'put', 'wet-clothes');

        // Basket at column 4, row 0 - take action (take clean clothes)
        this.addActionZone(4, 0, 'take', 'clean-clothes');

        // Folding zone at column 2, row 2 - put action (put clothes to fold)
        this.addActionZone(2, 2, 'put', 'clothes-to-fold');

        // All cells are walkable by default, but you can block specific cells if needed
        // For example, if there are obstacles in the level
    }
}
