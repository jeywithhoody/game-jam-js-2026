export interface ActionStep {
    location: string;
    action: 'take' | 'put';
    item: string;
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
        { location: "Clothes Pile", action: "take", item: "Dirty Clothes" },
        { location: "Sorting Station", action: "take", item: "Sorted Clothes" },
        { location: "Washing Machine", action: "put", item: "Clothes" },
        { location: "Washing Machine", action: "take", item: "Washed Clothes" },
        { location: "Dryer", action: "put", item: "Washed Clothes" },
        { location: "Dryer", action: "take", item: "Dry Clothes" },
        { location: "Folding Station", action: "put", item: "Dry Clothes" },
        { location: "Basket", action: "take", item: "Folded Clothes" }
    ],
    startPosition: { x: 0, y: 1 }
};
