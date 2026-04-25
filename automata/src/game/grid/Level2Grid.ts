import { LevelGrid } from './LevelGrid';

/**
 * Level2Grid - Grid configuration for Level 2 (Restomata)
 * 
 * Layout (4x6 grid):
 * - Starting position: (0, 2) - where robot begins
 * - Ingredient storage: (1, 0) - where ingredients are taken
 * - Prep station: (2, 1) - where ingredients are prepared
 * - Stove: (3, 2) - where food is cooked
 * - Plate station: (2, 3) - where plates are prepared
 * - Serving counter: (1, 4) - where customers are served
 * - Trash zone: (3, 4) - where waste goes
 * - Sink: (1, 5) - where dishes are washed
 */
export class Level2Grid extends LevelGrid {
    constructor() {
        // Grid dimensions: 6 columns x 4 rows to fit in 1435x580
        // This gives us cells of ~239x145 pixels
        super(4, 6, 1435, 580);
        this.setupLevel2Grid();
    }

    private setupLevel2Grid(): void {
        // Robot starts at position (0, 2) - left side, middle row
        this.setRobotPosition(0, 2);

        // Define action zones

        // Ingredient storage at (1, 0) - take action
        this.addActionZone(1, 0, 'take', 'Raw Ingredients', 'raw-ingredients');

        // Prep station at (2, 1) - put and take action
        this.addActionZone(2, 1, 'put', 'Ingredients to Prep', 'ingredients-to-prep');
        this.addActionZone(2, 1, 'take', 'Prepared Ingredients', 'prepared-ingredients');

        // Stove at (3, 2) - put and take action
        this.addActionZone(3, 2, 'put', 'Ingredients to Cook', 'ingredients-to-cook');
        this.addActionZone(3, 2, 'take', 'Cooked Food', 'cooked-food');

        // Plate station at (2, 3) - put and take action
        this.addActionZone(2, 3, 'put', 'Food to Plate', 'food-to-plate');
        this.addActionZone(2, 3, 'take', 'Plated Meal', 'plated-meal');

        // Serving counter at (1, 4) - put action (serve to customer)
        this.addActionZone(1, 4, 'put', 'Meal to Serve', 'meal-to-serve');

        // Trash zone at (3, 4) - put action (dispose waste)
        this.addActionZone(3, 4, 'put', 'Waste to Trash', 'waste-to-trash');

        // Sink at (1, 5) - take action (clean dishes)
        this.addActionZone(1, 5, 'take', 'Dirty Dishes', 'dirty-dishes');

        // All cells are walkable by default
    }
}
