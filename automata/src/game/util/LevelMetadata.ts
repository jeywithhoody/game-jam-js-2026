export interface ActionStep {
    location: string;
    action: 'take' | 'put' | 'finish';
    item: string;
    position: { x: number; y: number };
}

export interface LevelMetadata {
    levelNumber: number;
    levelName: string;
    description: string;
    objectives: string[];
    actions: ActionStep[];
    startPosition: { x: number; y: number };
}

export const Level1Metadata: LevelMetadata = {
    levelNumber: 1,
    levelName: "Lavomata",
    description: "Help the robot manage laundry using a washing machine",
    objectives: [
        "Pick up clothes from the pile",
        "Sort the clothes",
        "Wash in the washing machine",
        "Dry in the dryer",
        "Fold the clothes",
        "Return to starting position"
    ],
    actions: [
        { location: "Clothes Pile", action: "take", item: "Dirty Clothes", position: { x: 1, y: 1 } },
        { location: "Sorting Station", action: "take", item: "Sorted Clothes", position: { x: 2, y: 2 } },
        { location: "Washing Machine", action: "put", item: "Clothes", position: { x: 3, y: 1 } },
        { location: "Washing Machine", action: "take", item: "Washed Clothes", position: { x: 3, y: 1 } },
        { location: "Dryer", action: "put", item: "Washed Clothes", position: { x: 4, y: 2 } },
        { location: "Dryer", action: "take", item: "Dry Clothes", position: { x: 4, y: 2 } },
        { location: "Folding Station", action: "put", item: "Dry Clothes", position: { x: 3, y: 3 } },
        { location: "Basket", action: "take", item: "Folded Clothes", position: { x: 5, y: 1 } },
        { location: "End Position", action: "finish", item: "Finished", position: { x: 1, y: 2 } }
    ],
    startPosition: { x: 0, y: 1 }
};

export const Level2Metadata: LevelMetadata = {
    levelNumber: 2,
    levelName: "Restomata",
    description: "Help the robot manage a restaurant kitchen and serve customers",
    objectives: [
        "Get ingredients from storage",
        "Prepare ingredients at prep station",
        "Cook food on the stove",
        "Plate the meal",
        "Serve to customer",
        "Dispose waste in trash",
        "Wash dirty dishes",
        "Return to starting position"
    ],
    actions: [
        { location: "Ingredient Storage", action: "take", item: "Raw Ingredients", position: { x: 2, y: 1 } },
        { location: "Prep Station", action: "put", item: "Ingredients", position: { x: 3, y: 2 } },
        { location: "Prep Station", action: "take", item: "Prepared Ingredients", position: { x: 3, y: 2 } },
        { location: "Stove", action: "put", item: "Ingredients", position: { x: 4, y: 3 } },
        { location: "Stove", action: "take", item: "Cooked Food", position: { x: 4, y: 3 } },
        { location: "Plate Station", action: "put", item: "Food", position: { x: 3, y: 4 } },
        { location: "Plate Station", action: "take", item: "Plated Meal", position: { x: 3, y: 4 } },
        { location: "Serving Counter", action: "put", item: "Meal", position: { x: 2, y: 5 } },
        { location: "Trash Zone", action: "put", item: "Waste", position: { x: 4, y: 5 } },
        { location: "Sink", action: "take", item: "Dirty Dishes", position: { x: 2, y: 6 } },
        { location: "End Position", action: "finish", item: "Finished", position: { x: 1, y: 3 } }
    ],
    startPosition: { x: 1, y: 3 }
};
