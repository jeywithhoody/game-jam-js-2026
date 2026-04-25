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
