import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor(name) {
    this._name = name;
    this._hp = 100;
    this._maxHp = 100;
    this._defense = 0;
    this._bondingIndex = 0; // 카드와의 유대감
    this._carelessness = 50; // 부주의함(가진 아이템을 잃어버릴 확률)
    this._deckSize = 10;
    this._handSize = 5;
    this._runAwayProb = 50;
    // this._isPlayCard = false; // 현재 턴에 카드를 사용했는가?
    this._isThereAnyMonster = false; // 몬스터랑 만났나요?
    this._hasCard = []; // 덱에 보유한 카드
    this._hasCardInHand = []; // 핸드에 들어오는 카드의 배열
    this._hasStolenGoods = []; // 보유한 장물 아이템
    this._stage = 1;
    // this._isAttacked = false;
  }

  drawCardRandomly() {
    // 카드 셔플
    let sortedCard = this._hasCard.sort(() => Math.random() - 0.5);

    if (this._hasCardInHand.leangth >= 1) {
      // 손에 카드가 한 장이라도 있으면 손패에 있는 거 카드더미랑 합치기
      this._hasCard = [...this._hasCard, ...this._hasCardInHand];
      // 배열의 길이만큼 손패 비우기
      for (let i = 0; i < this._hasCardInHand.length; i++) {
        this._hasCardInHand.shift();
      }
    } else {
      // 손패에 카드가 없으면 핸드 사이즈만큼 카드 뽑기
      for (let i = 0; i < this._handSize; i++) {
        this._hasCardInHand.push(sortedCard.shift());
      }
    }
  }

  async cardPlay(playingCard, monster, cardIndex) {
    console.log(chalk.green('카드를 사용했습니다!'));
    const randomValue = Math.random() * 100;
    const cardActProb = playingCard._actProb + this._bondingIndex;
    if (randomValue <= cardActProb) {
      console.log(chalk.green('카드 효과가 발동합니다!'));
      await monster.monsterLoseHp(playingCard);
      this.updateHpByCard(playingCard);
      this.updateDefense(playingCard);
      // this._isPlayCard = true;
      this.playAndDraw(cardIndex);
      return true;
    } else {
      console.log(chalk.green('카드 효과 발동이 실패했습니다!'));
      await monster.monsterAttack(this);
      // this._isAttacked = true;
      this.playAndDraw(cardIndex);
      return false;
    }
  }

  playAndDraw(cardIndex) {
    let cardArr = this._hasCard;
    let cardArrInHand = this._hasCardInHand;
    let splicedCard = cardArrInHand.splice(cardIndex, 1)[0];
    cardArr.push(splicedCard);
    let nextCard = cardArr.shift();
    cardArrInHand.push(nextCard);
  }

  loseStolenGoods() {
    // 장물을 잃어버린다.
    this._hasStolenGoods.shift();
  }

  updateDeckSize(num) {
    // 덱사이즈
    this._deckSize += num;
  }

  updateHandSize(num) {
    // 핸드 사이즈
    this._handSize += num;
  }

  updateMaxHp(num) {
    // 최대 체력
    this._maxHp += num;
  }

  updateHpByCard(playingCard) {
    // 현재 체력
    this._hp += playingCard.restoreHp * playingCard.cardPower;
  }

  updateHpByMonster(num) {
    this._hp += num + this._defense;
  }

  updateDefense(playingCard) {
    // 방어도
    this._defense += playingCard.defense * playingCard.cardPower;
  }

  updateBondingIndex(num) {
    // 유대감
    this._bondingIndex += num;
  }

  runAway(monster) {
    // 도망친다.
    let randomValue = Math.random() * 100;
    if (randomValue <= this._runAwayProb) {
      console.log('도망 성공!');
      this._stage++;
      startGame(this);
    } else {
      console.log(chalk.red('이런! 불행하게도 도망치지 못했습니다.'));
      monster.monsterAttack(this);
    }
  }

  set name(value) {
    // 검증이 완료된 경우에만 setting!
    this._name = value;
  }

  get name() {
    return this._name;
  }
}

class Card {
  constructor(cardName, cardTier, actProb, attackDmg, spellDmg, restoreHp, defense) {
    this._cardName = cardName;
    this._actProb = actProb;
    this._cardPower = 1;
    this._cardTier = cardTier;
    this._isThisCardPlayed = false;
    this._attackDmg = attackDmg;
    this._spellDmg = spellDmg;
    this._restoreHp = restoreHp;
    this._defense = defense;
    this._isThisDrawCard = false;
  }

  incCardPower(player) {
    let cardActProb = this._actProb + player._bondingIndex;
    if (cardActProb >= 100) {
      this._cardPower = cardActProb / 100;
    }
  }

  set cardName(value) {
    // 검증이 완료된 경우에만 setting!
    this._cardName = value;
  }

  set cardTier(value) {
    // 검증이 완료된 경우에만 setting!
    this._cardTier = value;
  }

  set attackDmg(value) {
    // 검증이 완료된 경우에만 setting!
    this._attackDmg = value;
  }

  set spellDmg(value) {
    // 검증이 완료된 경우에만 setting!
    this._spellDmg = value;
  }

  set restoreHp(value) {
    // 검증이 완료된 경우에만 setting!
    this._srestoreHp = value;
  }

  set defense(value) {
    this._defense = value;
  }

  get cardName() {
    return this._cardName;
  }

  get cardTier() {
    return this._cardTier;
  }

  get attackDmg() {
    // 검증이 완료된 경우에만 setting!
    return this._attackDmg;
  }

  get spellDmg() {
    // 검증이 완료된 경우에만 setting!
    return this._spellDmg;
  }

  get restoreHp() {
    // 검증이 완료된 경우에만 setting!
    return this._srestoreHp;
  }

  get defense() {
    return this._defense;
  }
}

class NormalAttackCard extends Card {
  constructor(name) {
    // name, cardTier, actProb, attackDmg, spellDmg, restoreHp, defense
    super(name, 'Normal', 75, 10, 0, 0, 0);
  }
}

class RareAttackCard extends Card {
  constructor(name) {
    super(name, 'Rare', 80, 15, 0, 0, 0);
  }
}

class EpicAttackCard extends Card {
  constructor(name) {
    super(name, 'Epic', 85, 25, 0, 0, 0);
  }
}

class LegendaryAttackCard extends Card {
  constructor(name) {
    super(name, 'Legendary', 90, 40, 0, 0, 0);
  }
}

class NormalDefenseCard extends Card {
  constructor(name) {
    // name, cardTier, actProb, attackDmg, spellDmg, restoreHp, defense
    super(name, 'Normal', 75, 0, 0, 0, 10);
  }
}

class RareDefensekCard extends Card {
  constructor(name) {
    super(name, 'Rare', 80, 0, 0, 0, 15);
  }
}

class EpicDefenseCard extends Card {
  constructor(name) {
    super(name, 'Epic', 85, 0, 0, 0, 25);
  }
}

class LegendaryDefenseCard extends Card {
  constructor(name) {
    super(name, 'Legendary', 90, 0, 0, 0, 40);
  }
}

class StolenGoods {
  constructor(goodsName, goodsTier) {
    this._goodsName = goodsName;
    this._goodsTier = goodsTier;
  }

  set goodsName(value) {
    // 검증이 완료된 경우에만 setting!
    this._goodsName = value;
  }

  set goodsTier(value) {
    // 검증이 완료된 경우에만 setting!
    this._goodsTier = value;
  }
}

class Monster {
  constructor(stage) {
    this.hp = 100 + 100 * (stage / 2);
    this.attackDmg = 10 + 10 * (stage / 2);
  }

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
  }
  monsterLoseHp(playingCard) {
    if (playingCard._attackDmg > 0 || playingCard._spellDmg > 0) {
      this.hp -= (playingCard._attackDmg + playingCard._spellDmg) * playingCard._cardPower;
    }
  }
}

class NormalMonster extends Monster {
  constructor(stage) {
    super(stage);
  }
}

class RareMonster extends Monster {
  constructor(stage) {
    super(stage);
    this.hp = 150 + 100 * (stage / 2);
    this.attackDmg = 15 + 10 * (stage / 2);
  }
}

class EpicMonster extends Monster {
  constructor(stage) {
    super(stage);
    this.hp = 250 + 100 * (stage / 2);
    this.attackDmg = 25 + 10 * (stage / 2);
  }
}

class LegendaryMonster extends Monster {
  constructor(stage) {
    super(stage);
    this.hp = 400 + 100 * (stage / 2);
    this.attackDmg = 40 + 10 * (stage / 2);
  }
}

function displayStatus(stage, player, monster, playRsult) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage}`) +
      chalk.blueBright(
        `| 플레이어 정보 | 이름: ${player._name}, HP: ${player._hp}, 방어도: ${player._defense} |
      `,
      ) +
      chalk.redBright(` | 몬스터 정보 | HP: ${monster.hp}, 공격력: ${monster.attackDmg} |`),
  );
  console.log(chalk.magentaBright(`=====================`));

  // if (playRsult === true) {
  //   console.log(chalk.magentaBright('선택한 카드가 발동했습니다!'));
  //   console.log(chalk.magentaBright('=====================\n'));
  // } else if (playRsult === false) {
  //   console.log(chalk.magentaBright('카드 발동 실패! 몬스터의 공격을 받았습니다!'));
  //   console.log(chalk.magentaBright('=====================\n'));
  // }
}

const battle = async (stage, player, monster) => {
  // let logs = [];
  let playRsult;
  while (player._hp > 0) {
    console.clear();
    displayStatus(stage, player, monster, playRsult);
    // logs.forEach((log) => console.log(log));

    console.log(chalk.green(`\n1. 카드를 사용한다. 2. 턴을 넘긴다. 3. 도망친다.`));
    const choice = readlineSync.question('당신의 선택은? ');
    console.log(chalk.green(`${choice}를 선택하셨습니다.`));

    if (choice === '1') {
      console.log(
        chalk.green(`
          \n보유 중인 카드 : ${player._hasCardInHand.map((card, index) => index + 1 + '.' + card._cardName).join(', ')}`),
      );
      const cardChoice = readlineSync.question('몇 번째 카드를 사용하시겠습니까? : ');
      // console.log(chalk.green(`${cardChoice}번째 카드를 선택했습니다.`));
      const cardIndex = Number(cardChoice - 1);
      const playingCard = player._hasCardInHand[cardIndex];
      playRsult = player.cardPlay(playingCard, monster, cardIndex);
    } else if (choice === '2') {
      monster.monsterAttack(player);
    } else if (choice === '3') {
      player.runAway(monster);
    } else {
      console.log(chalk.red('잘못된 입력입니다. 다시 선택해주세요.'));
    }

    if (monster.hp < 0) {
      console.clear();
      break;
    } else if (player._hp <= 0) {
      typeName();
    }
  }
};

export async function startGame(player) {
  console.clear();

  // 시작덱 배열에 추가
  for (let i = 0; i < 5; i++) {
    let name = '기본 공격'; // 이름 생성 ${i + 1}
    player._hasCard.push(new NormalAttackCard(name)); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < 4; i++) {
    let name = '기본 방어'; // 이름 생성 ${i + 1}
    player._hasCard.push(new NormalDefenseCard(name)); // 객체 생성 후 배열에 추가
  }
  player.drawCardRandomly();

  while (player._stage <= 10) {
    const monster = new Monster(player._stage);
    // 카드 셔플, 첫 핸드 가져오기
    await battle(player._stage, player, monster);
    // 스테이지 클리어 및 게임 종료 조건
    if (monster.hp <= 0) {
      player._stage++;
    } else if (player._hp <= 0) {
      break;
    }
  }
}

export function typeName() {
  const playerName = readlineSync.question('당신의 이름은? ');
  const player = new Player(playerName);

  startGame(player);
}
