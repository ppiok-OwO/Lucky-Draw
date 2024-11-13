import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { largeUI, compactUI, setMessage } from './logs.js';

class Player {
  // 생성자
  constructor(name, difficulty = 1) {
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
    this.blessing = ''; // 선택한 축복
    this.spikeDmg = 20; // 가시 데미지
    this.multiAttackProb = 50; // 연속 공격 확률
    this.maxAttackCount = 2; // 최대 공격 횟수
    this.isEscape = false;
    this.isWon = false;
    this.isEliteStage = false;
    this.isBossStage = false;
    this.difficulty = difficulty;
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

    // 카드 발동 확률이 랜덤한 숫자를 이기면 발동!
    if (cardActProb >= randomValue) {
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
    // 화염 투사는 카드의 점화 스택의 절반만큼 회복을 추가로 한다.
    if (this.blessing === 'Chieftain') {
      this.hp += Math.round((playingCard.restoreHp + monster.igniteStack / 2) * cardPower);
    } else {
      this.hp += Math.round(playingCard.restoreHp * cardPower);
    }

    // 단, 체력은 최대체력을 넘을 수 없다!
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
    }
    if (this.blessing === 'Chieftain') {
      // 화염 투사의 경우 카드를 통해 회복한 체력만큼 점화를 걸 수 있다.
      if (monster.isIgnited) {
        monster.igniteStack += Math.round(playingCard.restoreHp * cardPower);
      }
    } else if (this.blessing === 'Berserker') {
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

  // 몬스터에 의한 HP 업데이트
  updateHpByMonster(num) {
    const pierceDmg = this.defense + num;
    if (pierceDmg <= 0) {
      this.hp += pierceDmg;
    }
  }

  // 카드에 의한 방어도 업데이트
  updateDefenseByCard(playingCard, cardPower = 1) {
    // 가시 수호자의 경우 카드가 제공하는 방어도의 절반만큼 가시데미지를 얻는다. 그리고 현재 가지고 있는 가시데미지의 절반만큼 방어도를 추가로 얻는다.
    if (this.blessing === 'Spike Defender') {
      this.spikeDmg += playingCard.defense / 2;
      this.defense += Math.round(playingCard.defense * cardPower + this.spikeDmg / 2);
    } else {
      this.defense += Math.round(playingCard.defense * cardPower);
    }
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
      setMessage('도망 성공!');
      this.stage++;
      this.incPlayerStat();
      startGame(this);
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
}

export { Player };
