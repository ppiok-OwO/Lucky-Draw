import chalk from 'chalk';
import readlineSync from 'readline-sync';

let playingCard;
let cardsInHand = [];
let cardsDrawn = [];


class Player {
  constructor(name, cardsDrawn = null) {
    this.name = name;
    this.hp = 100;
    this.maxHp = 100;
    this.defense = 0;
    this.bondingIndex = 0; // 카드와의 유대감
    this.carelessness = 50; // 부주의함(가진 아이템을 잃어버릴 확률)
    this.deckSize = 5;
    this.handSize = 10;
    this.runAwayProb = 50;
    this.isPlayCard = false; // 현재 턴에 카드를 사용했는가?
    this.isThereAnyMonster = false; // 몬스터랑 만났나요?
    this.hasCard = []; // 덱에 보유한 카드
    // this.hasCardInHand = []; // 핸드에 들어오는 카드의 배열
    this.hasStolenGoods = []; // 보유한 장물 아이템
  }

  drawCard() {
    // 카드를 뽑는다.
    cardsInHand.push(cardsDrawn);
  }

  playCard() {
    // 카드를 사용한다.
    this.isPlayCard = true;
    cardPlay();
  }

  loseStolenGoods() {
    // 장물을 잃어버린다.
  }

  updateDeckSize() {
    // 덱사이즈
  }

  updateHandSize() {
    // 핸드 사이즈
  }

  updateMaxHp() {
    // 최대 체력
  }

  updateHp(restoreHp) {
    // 현재 체력
  }

  updateDefense(defense) {
    // 방어도
  }

  updateBondingIndex() {
    // 유대감
  }

  runAway() {
    // 도망친다.
  }
}

class Card {
  constructor() {
    this.actProb = 0;
    this.cardPower = 1;
    this.cardTier = '';
    this.isThisCardPlayed = false;
    this.attackDmg = 10;
    this.spellDmg = 10;
    this.restoreHp = 0;
    this.defense = 0;
    this.isThisDrawCard = false;
  }

  cardPlay() {
    monsterLoseHp();
    updateHp(restoreHp);
    updateDefense(defense);
  }

  incCardPower() {
    if (activateProb >= 100) {
      this.cardPower = activateProb / 100;
    } else {
      return;
    }    
  }
}

class NormalCard extends Card {
  constructor() {
    this.actProb = 75;
    this.cardTier = 'Normal';
  }
}

class RarelCard extends Card {
  constructor() {
    this.actProb = 80;
    this.cardTier = 'Rare';
  }
}

class EpicCard extends Card {
  constructor() {
    this.actProb = 85;
    this.cardTier = 'Epic';
  }
}

class LegendaryCard extends Card {
  constructor() {
    this.actProb = 90;
    this.cardTier = 'Legendary';
  }
}

class Monster {
  constructor() {
    this.hp = 100;
    this.attackDmg = 10;
  }

  monsterAttack() {
    // 몬스터의 공격
    updateHp();
  }
  monsterLoseHp() {
    this.hp -= (playingCard.attackDmg + playingCard.spellDmg) * playingCard.cardPower;
  }
}

class NormalMonster extends Monster {
  constructor() {}

  monsterLoseHp() {
    this.hp -= (playingCard.attackDmg + playingCard.spellDmg) * playingCard.cardPower;
  }
}

class RareMonster extends Monster {
  constructor() {
    this.hp = 150;
    this.attackDmg = 15;
  }

  monsterLoseHp() {
    this.hp -= (playingCard.attackDmg + playingCard.spellDmg) * playingCard.cardPower;
  }
}

class EpicMonster extends Monster {
  constructor() {
    this.hp = 250;
    this.attackDmg = 25;
  }

  monsterLoseHp() {
    this.hp -= (playingCard.attackDmg + playingCard.spellDmg) * playingCard.cardPower;
  }
}

class LegendaryMonster extends Monster {
  constructor() {
    this.hp = 400;
    this.attackDmg = 40;
  }

  monsterLoseHp() {
    this.hp -= (playingCard.attackDmg + playingCard.spellDmg) * playingCard.cardPower;
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
      chalk.blueBright(`| 플레이어 정보`) +
      chalk.redBright(`| 몬스터 정보 |`),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\n1. 공격한다 2. 아무것도 하지않는다.`));
    const choice = readlineSync.question('당신의 선택은? ');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
  }
};

export async function startGame() {
  console.clear();
  const player = new Player();
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건

    stage++;
  }
}
