import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage } from './logs.js';

class Player {
  constructor(name) {
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
  }

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

  cardPlay(playingCard, monster, cardIndex) {
    // 100 미만의 랜덤한 밸류를 구하고 카드 발동 확률이랑 비교해보기
    const randomValue = Math.random() * 100;

    // 카드 발동 확률 = 카드 자체 발동 확률 + 카드와의 유대감
    const cardActProb = playingCard.actProb + this.bondingIndex;

    // 카드 발동 확률이 랜덤한 숫자를 이기면 발동!
    if (cardActProb >= randomValue) {
      if (cardActProb > 100) {
        let cardPower = 1 + (cardActProb - 100) / 100;
        monster.monsterLoseHp(playingCard, cardPower);
        this.updateHpByCard(playingCard, cardPower);
        this.updateDefenseByCard(playingCard, cardPower);
      } else {
        monster.monsterLoseHp(playingCard);
        this.updateHpByCard(playingCard);
        this.updateDefenseByCard(playingCard);
      }
      setMessage('카드 발동 성공!');
    } else if (cardActProb < randomValue) {
      setMessage('카드 발동 실패!');
    }

    // 사용한 카드는 손패에서 카드더미로(splice, push)
    const usedCard = this.hasCardInHand.splice(cardIndex, 1)[0];
    this.hasCard.push(usedCard);
  }

  updateHpByCard(playingCard, cardPower = 1) {
    // 현재 체력
    this.hp += Math.round(playingCard.restoreHp * cardPower);
    // 단, 체력은 최대체력을 넘을 수 없다!
    if (this.hp >= this.maxHp) {
      this.hp = this.maxHp;
    }
  }

  updateHpByMonster(num) {
    const pierceDmg = this.defense + num;
    if (pierceDmg <= 0) {
      this.hp += Math.round(pierceDmg);
    }
  }

  updateDefenseByCard(playingCard, cardPower = 1) {
    // 방어도
    this.defense += Math.round(playingCard.defense * cardPower);
  }

  updateDefenseByMonster(num) {
    this.defense += num;
    if (this.defense <= 0) {
      this.defense = 0;
    }
  }

  runAway(monster) {
    // 도망친다.
    let randomValue = Math.random() * 100;

    if (randomValue <= this.runAwayProb) {
      setMessage('도망 성공!');
      this.stage++;
      incPlayerStat(this);
      startGame(this);
    } else {
      setMessage('이런! 불행하게도 도망치지 못했습니다.');
      monster.monsterAttack(this);
    }
  }
}

export { Player };
