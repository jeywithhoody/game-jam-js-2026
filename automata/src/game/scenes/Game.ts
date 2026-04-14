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
        this.load.image('robot-face0000', 'robot-face0000.png');
        this.load.image('robot-face0003', 'robot-face0003.png');
        this.load.image('robot-face0006', 'robot-face0006.png');
        this.load.image('robot-face0009', 'robot-face0009.png');
        this.load.image('robot-profil0000', 'robot-profil0000.png');
        this.load.image('robot-profil0003', 'robot-profil0003.png');
        this.load.image('robot-profil0006', 'robot-profil0006.png');
        this.load.image('robot-profil0009', 'robot-profil0009.png');
        this.load.image('image0000', 'image0000.png');
        this.load.image('image0003', 'image0003.png');
        this.load.image('image0006', 'image0006.png');
        this.load.image('image0009', 'image0009.png');
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
        const robotFace = this.add.sprite(100, 150, 'robot-face0000');
        robotFace.setOrigin(0, 0);
        robotFace.setDisplaySize(1920, 1080);
        
        // Créer l'animation du robot face
        this.anims.create({
            key: 'robot-face-idle',
            frames: [
                { key: 'robot-face0000' },
                { key: 'robot-face0003' },
                { key: 'robot-face0006' },
                { key: 'robot-face0009' }
            ],
            frameRate: 6,
            repeat: -1
        });
        
        // Créer le sprite du robot profile
        const robotProfile = this.add.sprite(-500, 300, 'robot-profil0000');
        robotProfile.setOrigin(0, 0);
        robotProfile.setDisplaySize(1000, 1000);
        
        // Créer l'animation du robot profile
        this.anims.create({
            key: 'robot-profile-idle',
            frames: [
                { key: 'robot-profil0000' },
                { key: 'robot-profil0003' },
                { key: 'robot-profil0006' },
                { key: 'robot-profil0009' }
            ],
            frameRate: 6,
            repeat: -1
        });
        
        // Créer le sprite de la machine à laver
        const washerMachine = this.add.sprite(0, 0, 'washer-machine-run1');
        washerMachine.setOrigin(0, 0);
        washerMachine.setDisplaySize(500, 250);
        
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
        robotFace.play('robot-face-idle');
        robotProfile.play('robot-profile-idle');
        washerMachine.play('washer-machine-run');
        
        // Créer le mouvement du robot qui roule de gauche à droite
        this.tweens.add({
            targets: robotProfile,
            x: 500,
            duration: 5000,
            yoyo: true,
            repeat: -1,
            onYoyo: () => {
                robotProfile.setFlipX(true);
            },
            onRepeat: () => {
                robotProfile.setFlipX(false);
            }
        });
    }
}
