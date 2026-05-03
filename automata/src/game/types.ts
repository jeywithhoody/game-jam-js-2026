export enum CardType {
  MoveLeft = 'move-left',
  MoveUp = 'move-up',
  MoveDown = 'move-down',
  MoveRight = 'move-right',
  Take = 'take',
  Drop = 'drop',
}

export enum CardSpeed {
  One = 1,
  Two = 2
}

export interface CardInfo {
  cardType: CardType;
  speed: CardSpeed;
}
