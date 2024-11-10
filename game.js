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
  seeCard,
} from './C_card.js';
import { Monster } from './C_monster.js';
import { displayStatus, setMessage, selectReward } from './logs.js';

// 이름을 입력하세요. 축복을 선택하세요.
export function typeName() {
  console.clear();
  const playerName = readlineSync.question('마왕에 도전하는 용사여, 당신의 이름은 무엇인가요? ');
  console.log(chalk.hex('#daca86')(`${playerName}... 좋은 이름이군요.`));
  console.log(
    chalk.hex('#daca86')(
      `\n나는 카드의 여신. 녹록지 않을 당신의 여정에 축복을 내려드리죠.\n원하는 축복을 말해보세요.\n`,
    ),
  );

  const blessing = chooseBlessing();
  const player = new Player(playerName);

  if (blessing === '1') {
    player.blessing = 'Spike Defender';
  } else if (blessing === '2') {
    player.blessing = 'Berserker';
  } else if (blessing === '3') {
    player.blessing = 'Chieftain';
  }

  // 시작덱 배열에 카드들을 추가
  addCard(player, 3, 2, 3, 2);

  player.drawCardRandomly();

  startGame(player);
}

// 스테이지를 증가시키면서 보상 획득, 전투 반복
export async function startGame(player) {
  console.clear();

  while (player.stage <= 10) {
    const monster = new Monster(player.stage);
    battle(player.stage, player, monster);
    // 스테이지 클리어 및 게임 종료 조건
    if (player.hp <= 0) {
      // 죽으면 처음부터 다시 시작
      typeName();
    } else if (player.stage === 10) {
      // 게임을 클리어하면 반복문 탈출하기
      break;
    } else if (monster.hp <= 0) {
      player.stage++;
      // 카드 고르기 기능 넣기(덱/빌/딩)
      selectReward(player);
      // 최대 체력 증가
      player.maxHp += player.stage * 10;
      player.bondingIndex += player.stage * 5;
      // 스테이지가 끝나면 전투 중에 얻은 스탯들 초기화
      player.spikeDmg = 20; // 가시 데미지
      player.multiAttackProb = 30; // 연속 공격 확률
      player.maxAttackCount = 1; // 최대 공격 횟수
      player.defense = 0;
    }
  }

  console.clear();

  console.log(
    chalk.cyan(
      figlet.textSync('*YOU WIN!*', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );
}

const battle = (stage, player, monster) => {
  // 새로운 스테이지가 시작되면 카드더미와 손패를 모두 섞는다.
  player.shuffleAllCards();
  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    // 다음 턴이 시작될 때, 손패에 빈자리가 있으면 카드를 보충한다.
    player.drawCardRandomly();
    displayStatus(stage, player, monster);

    console.log(
      chalk
        .hex('#daca86')
        .bold(`\n1. 카드를 사용한다. 2. 소매치기. 3. 도망친다. 4. 손패에 있는 카드 지우기\n`),
    );
    const choice = readlineSync.question('당신의 선택은? \n');
    console.log(chalk.hex('#ffcdbc')(`\n${choice}번을 선택하셨습니다.`));

    if (choice === '1') {
      console.log(
        chalk.green(`
          \n손패에 있는 카드 : ${player.hasCardInHand.map((card, index) => index + 1 + '.' + card.cardName).join(', ')}`),
      );
      const cardChoice = readlineSync.question('\n몇 번째 카드를 사용하시겠습니까? : ');
      const cardIndex = Number(cardChoice - 1);
      const playingCard = player.hasCardInHand[cardIndex];

      // 카드 상세보기 기능을 이용했는가? 아니면 그냥 번호를 선택했는가?
      for (let i = 0; i < player.hasCardInHand.length; i++) {
        if (cardChoice === `see${i + 1}`) {
          seeCard(player.hasCardInHand[i]);
        } else if (cardChoice === `${i + 1}`) {
          player.cardPlay(playingCard, monster, cardIndex);

          // 죽였는데 맞는 건 이상하니까.
          if (monster.hp > 0) monster.monsterAttack(player);
        }
      }

      // 카드 상세보기 함수
    } else if (choice === '2') {
      let randomValue = Math.random() * 10;

      // 확률에 따라 높은 등급의 카드를 얻을 수도 있다!(스탯도)
      if (randomValue < 0.5) {
        addCard(player, 0, 0, 0, 0, 0, 0, 0, 1);
      } else if (randomValue < 1) {
        addCard(player, 0, 0, 0, 0, 0, 0, 1);
      } else if (randomValue < 2) {
        addCard(player, 0, 0, 0, 0, 0, 1);
      } else if (randomValue < 3) {
        addCard(player, 0, 0, 0, 0, 1);
      } else if (randomValue < 4.5) {
        addCard(player, 0, 0, 0, 1);
      } else if (randomValue < 6) {
        addCard(player, 0, 0, 1);
      } else if (randomValue < 7.5) {
        addCard(player, 0, 1);
      } else if (randomValue < 9) {
        addCard(player, 1);
      } else {
        incPlayerStat(player);
      }

      monster.monsterAttack(player);
    } else if (choice === '3') {
      if (player.stage === 10) {
        setMessage('보스전에선 도망칠 수 없습니다!');
      } else {
        player.runAway(monster);
      }
    } else if (choice === '4') {
      console.log(
        chalk.magenta(`
          \n손패에 있는 카드 : ${player.hasCardInHand.map((card, index) => index + 1 + '.' + card.cardName).join(', ')}`),
      );
      const cardRemoveAnswer = readlineSync.question('몇 번째 카드를 지우시겠습니까? : ');
      const cardIndex = Number(cardRemoveAnswer - 1);

      // 지울 카드 상세보기
      for (let i = 0; i < player.hasCardInHand.length; i++) {
        if (cardRemoveAnswer === `see${i + 1}`) {
          seeCard(player.hasCardInHand[i]);
        }
      }

      if (player.hasCard.length + player.hasCardInHand.length <= player.handSize) {
        setMessage('손패 크기보다 덱이 더 적을 수 없습니다.');
      } else {
        removeCard(cardIndex, player);
        monster.monsterAttack(player);
      }
    } else if (choice === 'test') {
      monster.hp = 0;
      break;
    }
    // 잘못된 입력을 하더라도 아무런 일도 일어나지 않고 반복문이 돌아서 자동으로 선택지를 다시 고를 수 있게 된다.
  }
};

// 이름과 축복 선택하기
function chooseBlessing() {
  console.log(
    chalk.hex('#daca86')(
      '\n1. 가시 수호자(Spike Defender)의 축복\t\t2. 광전사(Berserker)의 축복\t\t3. 화염 투사(Chieftain)의 축복',
    ),
  );
  const blessingChoice = readlineSync.question('\n당신의 선택은? ');

  console.log(chalk.hex('#ffcdbc')(`\n${blessingChoice}번을 선택하셨습니다.`));

  return blessingChoice;
}

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
  setMessage('선택하신 카드를 삭제했습니다!');
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
