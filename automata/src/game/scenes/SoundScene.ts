import { Scene } from 'phaser';
import SceneName from './SceneName';

export class SoundScene extends Scene {
    private masterVolume : number = 1;
    private soundGain : {
        master: number,
        music: number,
        sfx: number
    } = {
        master: 1,
        music: 1,
        sfx: 1
    }
    private activeMusic : object[] = [];
    private activeSounds : object[] = [];

    constructor() {
        super(SceneName.SoundScene);
    }

    preload() {
        this.load.setPath('assets');
        this.load.audio('music_theme', 'suno_ai_moots_cardbot_drift.mp3');
        this.load.audio('robot_sound', 'robot_move.flac');
        this.load.audio('robot_move', 'robotmoveshort.flac');
        this.load.audio('machine_sound', 'washingmachineshort.flac');
        this.load.audio('water_splash', 'watersplash.flac');
        this.load.audio('physical_task', 'physicaltasks.flac');
        this.load.audio('level_win', 'levelwin.flac');
        this.load.audio('card_take', 'cardtake.flac');
        this.load.audio('button_click', 'buttonclick.flac');
        this.load.audio('fail', 'fail.flac');
    }

    create() {
        this.playMusec();
    }

    // Music
    playMusec(delay: number = 0) {
        if (this.activeMusic.length > 0) {
            return;
        }
        const music = this.sound.add('music_theme', {volume: 0.4});

        const loopMarker = {
            name: 'loop',
            start: delay,
            duration: 1 * 60.00,
            config: {
                loop: true
            }
        };

        music.addMarker(loopMarker);
        music.play('loop', { delay: 0 });

        this.activeMusic.push(music);
    }

    setMasterVolume(volume: number) {
        this.setSoundGain({ master: volume });
    }

    setMusicVolume(volume: number) {
        this.setSoundGain({ music: volume });
    }

    setSfxVolume(volume: number) {
        this.setSoundGain({ sfx: volume });
    }

    playRobotMovement() {
        this.playSound('robot_move');
    }

    playMachineSound() {
        this.playSound('machine_sound');
    }

    playWaterSplash() {
        this.playSound('water_splash');
    }

    playPhysicalTask() {
        this.playSound('physical_task');
    }

    playLevelWin() {
        this.playSound('level_win');
    }

    playCardTake() {
        this.playSound('card_take');
    }

    playButtonClick() {
        this.playSound('button_click');
    }

    playFail() {
        this.playSound('fail');
    }

    playRobotSound() {
        this.playSound('robot_sound');
    }

    private playSound(soundIdentifierName: string) {
        const sound = this.sound.add(soundIdentifierName, { volume: this.soundGain.sfx * this.soundGain.master });
        sound.play();
        this.activeSounds.push(sound);
    }

    private setSoundGain(soundGain: { master?: number, music?: number, sfx?: number}) {
        const soundGainValue = {
            master: soundGain.master ?? this.soundGain.master,
            music: soundGain.music ?? this.soundGain.music,
            sfx: soundGain.sfx ?? this.soundGain.sfx
        }
        this.soundGain = soundGainValue;
        this.activeMusic.forEach((music) => { music.setVolume(soundGainValue.master * soundGainValue.music) });
        this.activeSounds.forEach((sound) => { sound.setVolume(soundGainValue.master * soundGainValue.sfx) });
    }

}
