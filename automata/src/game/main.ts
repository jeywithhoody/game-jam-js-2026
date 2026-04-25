import { LoadingScene } from './scenes/LoadingScene';
import { StartScene } from './scenes/StartScene';
import { Level1 } from './scenes/Level1';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { LevelInfoScene } from './scenes/LevelInfoScene';
import { PauseMenuScene } from './scenes/PauseMenuScene';
import { SoundScene } from './scenes/SoundScene';
import { SettingsScene } from './scenes/SettingsScene';
import { AUTO, Game, Scale,Types } from 'phaser';

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        LoadingScene,
        StartScene,
        LevelSelectScene,
        Level1,
        LevelInfoScene,
        PauseMenuScene,
        SettingsScene,
        SoundScene,
    ],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;
