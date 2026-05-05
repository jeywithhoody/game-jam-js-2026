import { CardInfo, CardSpeed, CardType } from "../types.ts";
import {Level} from "./Level.ts";
import SceneName from "./SceneName.ts";

export class LevelIntroScene extends Level {
  constructor() {
    super(SceneName.Introduction);
  }

  protected buildLevelDeckCards(): CardInfo[] {
    return [
      { cardType: CardType.Take, speed: CardSpeed.One },
      { cardType: CardType.Drop, speed: CardSpeed.One },
      { cardType: CardType.MoveRight, speed: CardSpeed.Two },
      { cardType: CardType.MoveUp, speed: CardSpeed.One, }
    ]
  }

}
