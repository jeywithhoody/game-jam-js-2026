import { Level } from './Level';
import { Scene, Button, SceneManager } from 'phaser';
import SceneNames from './SceneName';
import { Level1Grid } from '../grid/Level1Grid';
import { LevelZoneScene } from './LevelZoneScene';


/**
 * (Level1 : Lavomata )
 * Level flow :
 * Placement initial Robo -> Déplacement -> Pile de vêtements -> Triage -> Déplacement -> Laveuse -> Déplacement -> Sécheuse -> Déplacement -> Panier à linge -> Déplacement -> Pliage -> Déplacement -> Mise en inventaire -> Déplacement -> Revenir position initial Robo
 * */

export class Level1 extends Level
{
    private levelZoneScene: LevelZoneScene;

    constructor()
    {
        super(SceneNames.Level1)
    }

    /**
     * Required assets :
     * washer + other assets from Level class
     *
     */
    preload()
    {
        super.preload();
        this.load.setPath('assets');

        //Washer
        this.load.image('washer-machine-run1', 'washer-machine-run1.png');
        this.load.image('washer-machine-run2', 'washer-machine-run2.png');
        this.load.image('washer-machine-run3', 'washer-machine-run3.png');
        this.load.image('washer-machine-run5', 'washer-machine-run5.png');
        this.load.image('washer-machine-run6', 'washer-machine-run6.png');

    }

    create()
    {
        super.create();
        this.levelGrid = new Level1Grid();
        
        // Initialize level zone scene with grid visuals
        this.levelZoneScene = new LevelZoneScene(this);
        this.levelZoneScene.initializeGridVisuals(this.levelGrid);
    }

    update(time: number, delta: number)
    {
        super.update(time, delta);
    }

    draw()
    {
    }
}
