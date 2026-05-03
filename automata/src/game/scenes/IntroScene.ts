import {Level} from "./Level.ts";
import SceneName from "./SceneName.ts";

export class LevelIntroScene extends Level {
  constructor() {
    super(SceneName.Introduction);
  }
}
