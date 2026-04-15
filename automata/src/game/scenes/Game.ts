import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        this.load.setPath('assets');
        
        this.load.image('background', 'bg.png');
        this.load.image('robot-front0000', 'robot-front0000.png');
        this.load.image('robot-front0003', 'robot-front0003.png');
        this.load.image('robot-front0006', 'robot-front0006.png');
        this.load.image('robot-front0009', 'robot-front0009.png');
        this.load.image('robot-profil0000', 'robot-profil0000.png');
        this.load.image('robot-profil0003', 'robot-profil0003.png');
        this.load.image('robot-profil0006', 'robot-profil0006.png');
        this.load.image('robot-profil0009', 'robot-profil0009.png');
        this.load.image('robot-back0000', 'robot-back0000.png');
        this.load.image('robot-back0003', 'robot-back0003.png');
        this.load.image('robot-back0006', 'robot-back0006.png');
        this.load.image('robot-back0009', 'robot-back0009.png');
        this.load.image('washer-machine-run1', 'washer-machine-run1.png');
        this.load.image('washer-machine-run2', 'washer-machine-run2.png');
        this.load.image('washer-machine-run3', 'washer-machine-run3.png');

        this.load.image('washer-machine-run5', 'washer-machine-run5.png');
        this.load.image('washer-machine-run6', 'washer-machine-run6.png');
    }

    create ()
    {
        // Afficher le fond
        this.add.image(512, 384, 'background');
        
        // Créer le sprite du robot face
        const robotFace = this.add.sprite(512, 400, 'robot-front0000');
        robotFace.setOrigin(0, 0);
        robotFace.setDisplaySize(1920, 1080);
        robotFace.setVisible(true);
        
        // Créer l'animation du robot face
        this.anims.create({
            key: 'robot-face-idle',
            frames: [
                { key: 'robot-front0000' },
                { key: 'robot-front0003' },
                { key: 'robot-front0006' },
                { key: 'robot-front0009' }
            ],
            frameRate: 6,
            repeat: -1
        });
        
        // Créer le sprite du robot back
        const robotBack = this.add.sprite(0, 0, 'robot-back0000');
        robotBack.setOrigin(0, 0);
        robotBack.setDisplaySize(1920, 1080);
        robotBack.setVisible(false);
        
        // Créer l'animation du robot back
        this.anims.create({
            key: 'robot-back-idle',
            frames: [
                { key: 'robot-back0000' },
                { key: 'robot-back0003' },
                { key: 'robot-back0006' },
                { key: 'robot-back0009' }
            ],
            frameRate: 6,
            repeat: -1
        });
        
        // Créer le mouvement vertical du robot
        const moveUpTween = this.tweens.add({
            targets: [robotFace, robotBack],
            y: 0,
            duration: 3000,
            paused: true,
            onStart: () => {
                robotFace.setVisible(false);
                robotFace.stop();
                robotBack.setVisible(true);
                robotBack.play('robot-back-idle');
            },
            onComplete: () => {
                setTimeout(() => moveDownTween.play(), 1000);
            }
        });
        
        const moveDownTween = this.tweens.add({
            targets: [robotFace, robotBack],
            y: 400,
            duration: 3000,
            paused: true,
            onStart: () => {
                robotBack.setVisible(false);
                robotBack.stop();
                robotFace.setVisible(true);
                robotFace.play('robot-face-idle');
            },
            onComplete: () => {
                setTimeout(() => moveUpTween.play(), 1000);
            }
        });
        
        // Démarrer le mouvement
        robotFace.play('robot-face-idle');
        moveUpTween.play();
        
        // Créer le sprite de la machine à laver
        const washerMachine = this.add.sprite(0, 0, 'washer-machine-run1');
        washerMachine.setOrigin(0, 0);
        washerMachine.setDisplaySize(1920, 1080);
        
        // Créer l'animation de la machine à laver
        this.anims.create({
            key: 'washer-machine-run',
            frames: [
                { key: 'washer-machine-run1' },
                { key: 'washer-machine-run2' },
                { key: 'washer-machine-run3' },
                { key: 'washer-machine-run5' },
                { key: 'washer-machine-run6' }
            ],
            frameRate: 6,
            repeat: -1
        });
    
        
        // Lancer les animations
        washerMachine.play('washer-machine-run');
        
        // Créer le sprite du robot qui roule
        const robotRoller = this.add.sprite(50, 700, 'robot-profil0000');
        
        // Créer l'animation du robot qui roule
        this.anims.create({
            key: 'robot-roller-move',
            frames: [
                { key: 'robot-profil0000' },
                { key: 'robot-profil0003' },
                { key: 'robot-profil0006' },
                { key: 'robot-profil0009' }
            ],
            frameRate: 6,
            repeat: -1
        });
        
        robotRoller.play('robot-roller-move');
        
        // Créer le mouvement du robot qui roule de gauche à droite
        this.tweens.add({
            targets: robotRoller,
            x: 974,
            duration: 5000,
            yoyo: true,
            repeat: -1,
            onYoyo: () => {
                robotRoller.setFlipX(true);
            },
            onRepeat: () => {
                robotRoller.setFlipX(false);
            }
        });
    }
}
