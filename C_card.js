import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage } from './logs.js';

class Card {
  constructor(cardName, cardTier, actProb, attackDmg, spellDmg, restoreHp, defense) {
    this.cardName = cardName;
    this.actProb = actProb;
    this.cardTier = cardTier;
    this.isThisCardPlayed = false;
    this.attackDmg = attackDmg;
    this.spellDmg = spellDmg;
    this.restoreHp = restoreHp;
    this.defense = defense;
  }
}

class NormalAttackCard extends Card {
  constructor() {
    // cardName, cardTier, actProb, attackDmg, spellDmg, restoreHp, defense
    super('기본 공격', 'Normal', 75, 1000, 5, 0, 0);
  }
}

class RareAttackCard extends Card {
  constructor() {
    super('피부 찢기', 'Rare', 80, 20, 5, 5, 0);
  }
}

class EpicAttackCard extends Card {
  constructor() {
    super('완벽한 타격', 'Epic', 85, 35, 0, 0, 10);
  }
}

class LegendaryAttackCard extends Card {
  constructor() {
    super('말살검', 'Legendary', 90, 20, 25, 10, 10);
  }
}

class NormalDefenseCard extends Card {
  constructor() {
    super('기본 방어', 'Normal', 75, 0, 0, 20, 20);
  }
}

class RareDefenseCard extends Card {
  constructor() {
    super('방패 올리기', 'Rare', 80, 0, 0, 30, 30);
  }
}

class EpicDefenseCard extends Card {
  constructor() {
    super('바리게이트', 'Epic', 85, 0, 0, 30, 45);
  }
}

class LegendaryDefenseCard extends Card {
  constructor() {
    super('참호', 'Legendary', 90, 0, 0, 100, 60);
  }
}

// 카드를 무작위로 생성하는 함수
function makeRandomCard() {
  const cardClasses = [
    NormalAttackCard,
    NormalDefenseCard,
    RareAttackCard,
    RareDefenseCard,
    EpicAttackCard,
    EpicDefenseCard,
    LegendaryAttackCard,
    LegendaryDefenseCard,
  ];
  // 무작위로 클래스 선택
  const randomCardInstance = cardClasses[Math.floor(Math.random() * cardClasses.length)];

  // 선택된 클래스의 인스턴스 생성
  return new randomCardInstance();
}

export {
  Card,
  NormalAttackCard,
  NormalDefenseCard,
  RareAttackCard,
  RareDefenseCard,
  EpicAttackCard,
  EpicDefenseCard,
  LegendaryAttackCard,
  LegendaryDefenseCard,
  makeRandomCard,
};
