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
            //duration: 1 * 60.00,
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
