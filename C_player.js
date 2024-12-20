import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import {
  largeUI,
  compactUI,
  setMessage,
  setPlayerBattleText,
  setMonsterBattleText,
} from './logs.js';
import { clearStage, startGame } from './game.js';
import { uiStyle } from './server.js';
import { tavern } from './shop.js';

class Player {
  // 생성자
  constructor(name, difficulty, blessing) {
    this.name = name;
    this.hp = 100;
    this.maxHp = 100;
    this.defense = 0;
    this.bondingIndex = 5; // 카드와의 유대감
    this.handSize = 5;
    this.runAwayProb = 20; // 도망칠 확률
    this.hasCard = []; // 덱에 보유한 카드
    this.hasCardInHand = []; // 핸드에 들어오는 카드의 배열
    this.stage = 1;
    this.blessing = blessing; // 선택한 축복
    this.isEscape = false;
    this.isWon = false;
    this.isEliteStage = false;
    this.isBossStage = false;
    this.difficulty = difficulty;
    this.gold = 0;
    this.isSticky = false; // 슬라임한테 공격을 받을 때
    this.isUndertaled = false; // 샌즈한테 공격을 받을 때
    this.isTargeted = false; // 렉사르한테 공격을 받을 때
    this.isClumsy = false; // 오우거 마법사한테 공격을 받을 때
  }

  // 카드 드로우
  drawCardRandomly() {
    // 손패가 몇 자리 비어있니?
    let emptyHand = this.handSize - this.hasCardInHand.length;

    // 카드 셔플! Fisher-Yates 방식이라고 한다.
    for (let i = this.hasCard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.hasCard[i], this.hasCard[j]] = [this.hasCard[j], this.hasCard[i]];
    }

    // 비어있는 손패 크기만큼 카드를 보충하자
    for (let i = 0; i < emptyHand; i++) {
      this.hasCardInHand.push(this.hasCard.shift());
    }
    // setMessage('손패를 보충했습니다!');
  }

  // 모두 섞기
  shuffleAllCards() {
    // 손패 비우기
    let splicedHand = this.hasCardInHand.splice(0);
    // splice는 배열을 반환하므로, hasCard배열과 합쳐줄 때 전개 구문을 사용했다.
    this.hasCard.push(...splicedHand);

    // 카드를 잘 섞어주자(Fisher-Yates 셔플 알고리즘)
    for (let i = this.hasCard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.hasCard[i], this.hasCard[j]] = [this.hasCard[j], this.hasCard[i]];
    }

    // 손패 다시 채우기
    for (let i = 0; i < this.handSize; i++) {
      this.hasCardInHand.push(this.hasCard.shift());
    }
    setMessage('카드를 섞고 손패를 가득 채웠습니다!');
  }

  collectAllCard() {
    let splicedHand = this.hasCardInHand.splice(0);
    // splice는 배열을 반환하므로, hasCard배열과 합쳐줄 때 전개 구문을 사용했다.
    this.hasCard.push(...splicedHand);
    this.hasCard.sort();
  }

  // 카드 사용
  cardPlay(playingCard, monster, cardIndex) {
    // 100 미만의 랜덤한 밸류를 구하고 카드 발동 확률이랑 비교해보기
    const randomValue = Math.random() * 100;

    // 카드 발동 확률 = 카드 자체 발동 확률 + 카드와의 유대감
    const cardActProb = playingCard.actProb + this.bondingIndex;

    if (
      monster.monsterAttackCount !== 0 &&
      monster.monsterAttackCount % 6 === 0 &&
      monster.name === '높은 바위 하피'
    ) {
      return;
    } else if (this.isClumsy) {
      setMessage('이런! 엉뚱해진 바람에 카드를 사용하는 걸 까먹었습니다!');
      this.isClumsy = false;
    } else if (cardActProb >= randomValue) {
      // 카드 발동 확률이 랜덤한 숫자를 이기면 발동!
      monster.monsterLoseHpByCard(
        this,
        playingCard,
        cardActProb > 100 ? 1 + (cardActProb - 100) / 100 : 1,
      ); // 카드 발동 확률이 100보다 높아지면 그 초과분을 cardPower에 반영한다.(20이 초과하면 cardPower=1.2, 결국 카드 데미지 x 1.2)
      this.updateHpByCard(
        playingCard,
        cardActProb > 100 ? 1 + (cardActProb - 100) / 100 : 1,
        monster,
      );
      this.updateDefenseByCard(playingCard, cardActProb > 100 ? 1 + (cardActProb - 100) / 100 : 1);
      monster.monsterLoseHpByIgnite(
        playingCard,
        cardActProb > 100 ? 1 + (cardActProb - 100) / 100 : 1,
        this,
      );

      if (monster.igniteStack <= 0) {
        monster.isIgnited = false;
        monster.igniteStack = 0;
      }
      setMessage('카드 발동 성공!');
    } else {
      setMessage('카드 발동 실패!');
      monster.monsterLoseHpByIgnite(
        playingCard,
        cardActProb > 100 ? 1 + (cardActProb - 100) / 100 : 1,
        this,
      );
    }

    // 사용한 카드는 손패에서 카드더미로(splice, push)
    const usedCard = this.hasCardInHand.splice(cardIndex, 1)[0];
    this.hasCard.push(usedCard);
  }

  // 카드에 의한 HP 업데이트
  updateHpByCard(playingCard, cardPower = 1, monster) {
    // 현재 체력 += 힐카드 계산식
    this.hp += Math.round(playingCard.restoreHp * cardPower);

    // 단, 체력은 최대체력을 넘을 수 없다!
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
    }
  }

  // 몬스터에 의한 HP 업데이트
  updateHpByMonster(num) {
    const pierceDmg = this.defense + num;
    if (pierceDmg <= 0) {
      this.hp += pierceDmg;
    }
  }

  updateHpByTavern(num) {
    this.hp += num;
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
    }
  }

  // 카드에 의한 방어도 업데이트
  updateDefenseByCard(playingCard, cardPower = 1) {
    this.defense += Math.round(playingCard.defense * cardPower);
  }

  // 몬스터에 의한 방어도 업데이트
  updateDefenseByMonster(num) {
    this.defense += num;
    if (this.defense <= 0) {
      this.defense = 0;
    }
  }

  // 도망치기
  runAway(monster) {
    // 도망친다.
    let randomValue = Math.random() * 100;

    if (randomValue <= this.runAwayProb) {
      clearStage(this);
      // startGame(this, uiStyle);
      tavern(this);
    } else {
      setMessage('이런! 불행하게도 도망치지 못했습니다.');
      monster.monsterAttack(this);
    }
  }

  incPlayerStat() {
    // maxHp, defense, bondingIndex, handSize, runAwayProb

    let randomValue = Math.random() * 4;
    if (randomValue >= 0 && randomValue < 1) {
      this.maxHp += 10;
      this.hp += 10;
    } else if (randomValue >= 1 && randomValue < 2) {
      this.bondingIndex += 10;
    } else if (randomValue >= 2 && randomValue < 3) {
      this.handSize += 1;
      if (this.handSize > this.hasCard) {
        this.drawCardRandomly();
      }
    } else if (randomValue >= 3 && randomValue < 4) {
      this.runAwayProb += 3;
    }
  }

  // 클래스 인스턴스에 데이터를 업데이트하는 메서드
  updateData(data) {
    Object.assign(this, data); // 받은 데이터로 현재 인스턴스의 프로퍼티 덮어쓰기
  }
}

class SpikeDefender extends Player {
  constructor(name, difficulty) {
    super(name, difficulty, 'Spike Defender');
    this.spikeDmg = 20; // 가시 데미지
  }

  // 카드에 의한 방어도 업데이트
  updateDefenseByCard(playingCard, cardPower = 1) {
    // 가시 수호자의 경우 카드가 제공하는 방어도의 절반만큼 가시데미지를 얻는다. 현재 가시데미지의 절반만큼을 추가 방어도로 얻는다.
    if (this.isTargeted) {
      this.spikeDmg += (playingCard.defense * cardPower) / 2;
      this.defense += Math.round((playingCard.defense * cardPower) / 2 + this.spikeDmg / 2);
    } else {
      this.spikeDmg += playingCard.defense / 2;
      this.defense += Math.round(playingCard.defense * cardPower + this.spikeDmg / 2);
    }
  }
}

class Berserker extends Player {
  constructor(name, difficulty) {
    super(name, difficulty, 'Berserker');
    this.multiAttackProb = 50; // 연속 공격 확률
    this.maxAttackCount = 2; // 최대 공격 횟수
  }

  // 카드에 의한 HP 업데이트
  updateHpByCard(playingCard, cardPower = 1, monster) {
    // 현재 체력 += 힐카드 계산식
    if (this.isTargeted) {
      this.hp += Math.round((playingCard.restoreHp * cardPower) / 2);
    } else {
      this.hp += Math.round(playingCard.restoreHp * cardPower);
    }

    // 단, 체력은 최대체력을 넘을 수 없다!
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
    }

    // 광전사의 경우 카드를 쓸 때마다 5의 피해를 입고 연속 공격 확률이 10%p 증가하거나 최대 공격 횟수가 1 증가한다.
    this.hp -= 5;
    let randomValue = Math.random() * 2;

    if (randomValue < 1 && this.multiAttackProb <= 100) {
      this.multiAttackProb += 10;
    } else {
      this.maxAttackCount += 1;
    }
  }
}

class Chieftain extends Player {
  constructor(name, difficulty) {
    super(name, difficulty, 'Chieftain');
    this.healEffieciency = 1.2;
  }

  // 카드에 의한 HP 업데이트
  updateHpByCard(playingCard, cardPower = 1, monster) {
    // 현재 체력 += 힐카드 계산식
    // 화염 투사는 20퍼센트의 회복 효율을 가지고 있다. 카드의 점화 스택의 절반만큼 회복을 추가로 한다.
    if (this.isTargeted) {
      this.hp += Math.round(
        (playingCard.restoreHp * this.healEffieciency * cardPower + monster.igniteStack / 2) / 2,
      );
    } else {
      this.hp += Math.round(
        playingCard.restoreHp * this.healEffieciency * cardPower + monster.igniteStack / 2,
      );
    }
    // 단, 체력은 최대체력을 넘을 수 없다!
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
    }

    // 화염 투사의 경우 카드를 통해 회복한 체력만큼 점화를 걸 수 있다.(렉사르의 스킬로 인한 회복량의 감소는 반영되지 않는다. 그럼 너무 카운터니까.)
    if (monster.isIgnited) {
      monster.igniteStack += Math.round(playingCard.restoreHp * cardPower);
    }
  }
}

export { Player, SpikeDefender, Berserker, Chieftain };
