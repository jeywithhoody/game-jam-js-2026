export interface ActionZoneConfig {
    x: number;
    y: number;
    actionType: 'take' | 'put';
    itemType: string;
    name: string;
    allowMultiple?: boolean;
}

export interface ActionZoneState {
    completed: boolean;
    itemsTransferred: number;
}

export class ActionZoneSystem {
    private zones: Map<string, ActionZoneConfig> = new Map();
    private zoneStates: Map<string, ActionZoneState> = new Map();
    private completedActions: Set<string> = new Set();

    /**
     * Register an action zone
     */
    public addZone(id: string, config: ActionZoneConfig): void {
        this.zones.set(id, config);
        this.zoneStates.set(id, {
            completed: false,
            itemsTransferred: 0
        });
    }

    /**
     * Get a zone by ID
     */
    public getZone(id: string): ActionZoneConfig | undefined {
        return this.zones.get(id);
    }

    /**
     * Get all zones
     */
    public getAllZones(): Map<string, ActionZoneConfig> {
        return this.zones;
    }

    /**
     * Check if robot can perform action at position
     */
    public canPerformAction(gridX: number, gridY: number, actionType?: 'take' | 'put'): { can: boolean; zoneId?: string; action?: 'take' | 'put'; item?: string } {
        for (const [id, zone] of this.zones.entries()) {
            if (zone.x === gridX && zone.y === gridY) {
                // If actionType is specified, only match zones with that action type
                if (actionType && zone.actionType !== actionType) {
                    continue;
                }
                const state = this.zoneStates.get(id);
                if (zone.allowMultiple || !state?.completed) {
                    return { can: true, zoneId: id, action: zone.actionType, item: zone.itemType };
                }
                return { can: false };
            }
        }
        return { can: false };
    }

    /**
     * Perform action at a zone
     */
    public performAction(zoneId: string): { success: boolean; message: string } {
        const zone = this.zones.get(zoneId);
        if (!zone) {
            return { success: false, message: 'Zone not found' };
        }

        const state = this.zoneStates.get(zoneId);
        if (!state) {
            return { success: false, message: 'Zone state not found' };
        }

        // Check if already completed
        if (state.completed && !zone.allowMultiple) {
            return { success: false, message: `Already completed action at ${zone.name}` };
        }

        // Mark as completed
        state.itemsTransferred++;
        state.completed = true;
        this.completedActions.add(zoneId);

        return {
            success: true,
            message: `${zone.actionType.toUpperCase()} ${zone.itemType} at ${zone.name}`
        };
    }

    /**
     * Check if all required actions are completed
     */
    public allActionsCompleted(requiredZones: string[]): boolean {
        return requiredZones.every(zoneId => this.completedActions.has(zoneId));
    }

    /**
     * Get progress
     */
    public getProgress(): { completed: number; total: number } {
        const total = this.zones.size;
        const completed = this.completedActions.size;
        return { completed, total };
    }

    /**
     * Reset all states
     */
    public reset(): void {
        this.completedActions.clear();
        for (const state of this.zoneStates.values()) {
            state.completed = false;
            state.itemsTransferred = 0;
        }
    }
}
