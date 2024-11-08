import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { Player } from './C_player.js';
import {
  Card,
  NormalAttackCard,
  NormalDefenseCard,
  RareAttackCard,
  RareDefenseCard,
  EpicAttackCard,
  EpicDefenseCard,
  LegendaryAttackCard,
  LegendaryDefenseCard,
} from './C_card.js';
import { Monster } from './C_monster.js';
import { displayStatus, setMessage, selectReward } from './logs.js';

export function typeName() {
  console.clear();

  const playerName = readlineSync.question('당신의 이름은? ');
  const player = new Player(playerName);

  // 시작덱 배열에 추가
  addCard(player, 3, 2, 3, 2);

  player.drawCardRandomly();

  startGame(player);
}

export async function startGame(player) {
  console.clear();
  while (player.stage <= 10) {
    const monster = new Monster(player.stage);
    // 카드 셔플, 첫 핸드 가져오기
    battle(player.stage, player, monster);
    // 스테이지 클리어 및 게임 종료 조건
    if (monster.hp <= 0) {
      player.stage++;
      // 카드 고르기 기능 넣기(덱/빌/딩)
      selectReward(player);
      player.hp += 30 + player.stage * 10;
    } else if (player.hp <= 0) {
      typeName();
    }
  }
}

const battle = async (stage, player, monster) => {
  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);
    player.shuffleAllCards();
    console.log(
      chalk.green(`\n1. 카드를 사용한다. 2. 소매치기. 3. 도망친다. 4. 손패에 있는 카드 지우기`),
    );
    const choice = readlineSync.question('당신의 선택은? ');
    console.log(chalk.green(`${choice}를 선택하셨습니다.`));

    if (choice === '1') {
      console.log(
        chalk.green(`
          \n손패에 있는 카드 : ${player.hasCardInHand.map((card, index) => index + 1 + '.' + card.cardName).join(', ')}`),
      );
      const cardChoice = readlineSync.question('몇 번째 카드를 사용하시겠습니까? : ');
      const cardIndex = Number(cardChoice - 1);
      const playingCard = player.hasCardInHand[cardIndex];
      player.cardPlay(playingCard, monster);
      monster.monsterAttack(player);
    } else if (choice === '2') {
      let randomValue = Math.random() * 12;

      if (randomValue >= 0 && randomValue < 2) {
        addCard(player, 1);
      } else if (randomValue >= 2 && randomValue < 4) {
        addCard(player, 0, 1);
      } else if (randomValue >= 4 && randomValue < 6) {
        addCard(player, 0, 0, 1);
      } else if (randomValue >= 6 && randomValue < 8) {
        addCard(player, 0, 0, 0, 1);
      } else if (randomValue >= 8 && randomValue < 8.8) {
        addCard(player, 0, 0, 0, 0, 1);
      } else if (randomValue >= 8.8 && randomValue < 9.5) {
        addCard(player, 0, 0, 0, 0, 0, 1);
      } else if (randomValue >= 9.5 && randomValue < 9.75) {
        addCard(player, 0, 0, 0, 0, 0, 0, 1);
      } else if (randomValue >= 9.75 && randomValue < 10) {
        addCard(player, 0, 0, 0, 0, 0, 0, 0, 1);
      } else {
        incPlayerStat(player);
      }
      monster.monsterAttack(player);
    } else if (choice === '3') {
      player.runAway(monster);
    } else if (choice === '4') {
      console.log(
        chalk.magenta(`
          \n손패에 있는 카드 : ${player.hasCardInHand.map((card, index) => index + 1 + '.' + card.cardName).join(', ')}`),
      );
      const cardRemoveIndex = readlineSync.question('몇 번째 카드를 지우시겠습니까? : ');
      if (player.hasCard.length + player.hasCardInHand.length <= player.handSize) {
        setMessage('손패 크기보다 덱이 더 적을 수 없습니다.');
      } else {
        removeCard(cardRemoveIndex - 1, player);
        monster.monsterAttack(player);
      }
    }
    // 잘못된 입력을 하더라도 아무런 일도 일어나지 않고 반복문이 돌아서 자동으로 선택지를 다시 고를 수 있게 된다.
  }
};

// 플레이어 스탯 랜덤하게 오르는 함수
function incPlayerStat(player) {
  // maxHp, defense, bondingIndex, handSize, runAwayProb

  let randomValue = Math.random() * 5;
  if (randomValue >= 0 && randomValue <= 1) {
    player.maxHp += 10;
    player.hp += 10;
  } else if (randomValue >= 1 && randomValue <= 2) {
    player.defense += 10;
  } else if (randomValue >= 2 && randomValue <= 3) {
    player.bondingIndex += 10;
  } else if (randomValue >= 3 && randomValue <= 4) {
    player.handSize += 1;
    if (player.handSize > player.hasCard) {
    }
    player.drawCardRandomly();
  } else if (randomValue >= 4 && randomValue <= 5) {
    player.runAwayProb += 3;
  }
}

// 손패에 있는 카드를 지우는 함수
function removeCard(cardRemoveIndex, player) {
  player.hasCardInHand.splice(cardRemoveIndex, 1);
}

// 카드를 추가하는 함수
function addCard(player, NA = 0, ND = 0, RA = 0, RD = 0, EA = 0, ED = 0, LA = 0, LD = 0) {
  for (let i = 0; i < NA; i++) {
    player.hasCard.push(new NormalAttackCard()); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < ND; i++) {
    player.hasCard.push(new NormalDefenseCard()); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < RA; i++) {
    player.hasCard.push(new RareAttackCard()); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < RD; i++) {
    player.hasCard.push(new RareDefenseCard()); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < EA; i++) {
    player.hasCard.push(new EpicAttackCard()); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < ED; i++) {
    player.hasCard.push(new EpicDefenseCard()); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < LA; i++) {
    player.hasCard.push(new LegendaryAttackCard()); // 객체 생성 후 배열에 추가
  }
  for (let i = 0; i < LD; i++) {
    player.hasCard.push(new LegendaryDefenseCard()); // 객체 생성 후 배열에 추가
  }
}
