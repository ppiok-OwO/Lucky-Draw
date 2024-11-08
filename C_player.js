import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage } from './logs.js';

class Player {
  constructor(name) {
    this._name = name;
    this._hp = 100;
    this._maxHp = 100;
    this._defense = 0;
    this._bondingIndex = 5; // 카드와의 유대감
    this._handSize = 5;
    this._runAwayProb = 50;
    this._hasCard = []; // 덱에 보유한 카드
    this._hasCardInHand = []; // 핸드에 들어오는 카드의 배열
    this._stage = 1;
  }

  drawCardRandomly() {
    // 손패가 몇 자리 비어있나?
    let emptyHand = this._handSize - this._hasCardInHand.length;

    // 카드 셔플! Fisher-Yates 방식이라고 하네요
    for (let i = this._hasCard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._hasCard[i], this._hasCard[j]] = [this._hasCard[j], this._hasCard[i]];
    }

    // 비어있는 손패 사이즈만큼 카드 뽑기
    for (let i = 0; i < emptyHand; i++) {
      this._hasCardInHand.push(this._hasCard.shift());
    }
    setMessage('손패 크기만큼 카드를 드로우했습니다!');
  }

  shuffleAllCards() {
    // 손패 비우기
    let splicedHand = this._hasCardInHand.splice(0, this._hasCardInHand.length);
    this._hasCard.push(...splicedHand);

    // 셔플(Fisher-Yates 알고리즘)
    for (let i = this._hasCard.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._hasCard[i], this._hasCard[j]] = [this._hasCard[j], this._hasCard[i]];
    }

    // 손패 채우기
    for (let i = 0; i < this._handSize; i++) {
      this._hasCardInHand.push(this._hasCard.shift());
    }
    setMessage('카드를 섞고 손패를 가득 채웠습니다!');
  }

  async cardPlay(playingCard, monster) {
    // 100 미만의 랜덤한 밸류를 구하고 카드 발동 확률이랑 비교해보기
    const randomValue = Math.random() * 100;

    // 카드 발동 확률 = 카드 자체 발동 확률 + 카드와의 유대감
    const cardActProb = playingCard._actProb + this._bondingIndex;

    // 카드 발동 확률이 랜덤한 숫자를 이기면 발동!
    if (randomValue <= cardActProb) {
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
    } else if (randomValue > cardActProb) {
      setMessage('카드 발동 실패!');
    }
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

  updateHpByCard(playingCard, cardPower = 1) {
    // 현재 체력
    this._hp += playingCard._restoreHp * cardPower;
    // 단, 체력은 최대체력을 넘을 수 없다!
    if (this._hp >= this._maxHp) {
      this._hp = this._maxHp;
    }
  }

  updateHpByMonster(num) {
    const pierceDmg = this._defense + num;
    if (pierceDmg <= 0) {
      this._hp += pierceDmg;
    }
  }

  updateDefenseByCard(playingCard, cardPower = 1) {
    // 방어도
    this._defense += playingCard._defense * cardPower;
  }

  updateDefenseByMonster(num) {
    this._defense += num;
    if (this._defense <= 0) {
      this._defense = 0;
    }
  }

  updateBondingIndex(num) {
    // 유대감
    this._bondingIndex += num;
  }

  runAway(monster) {
    // 도망친다.
    let randomValue = Math.random() * 100;

    if (randomValue <= this._runAwayProb) {
      setMessage('도망 성공!');
      this._stage++;
      incPlayerStat(this);
      startGame(this);
    } else {
      setMessage('이런! 불행하게도 도망치지 못했습니다.');
      monster.monsterAttack(this);
    }
  }

  set name(value) {
    this._name = value;
  }

  get name() {
    return this._name;
  }

  set isPlayCard(value) {
    this._isPlayCard = value;
  }

  get isPlayCard() {
    return this._isPlayCard;
  }
}

export { Player };
