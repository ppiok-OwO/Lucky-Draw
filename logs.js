import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
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
  makeRandomCard,
  seeCard,
} from './C_card.js';
import { Player } from './C_player.js';

// 인게임 안내 메시지를 위한 변수들
const info = `[TIP]턴을 종료할 때 가진 카드가 모두 섞입니다. 신중하게 플레이해주세요. 
전투 중에 카드를 자세히 보시려면 번호 앞에 'see'를 붙여주세요\n`;
let message;

// 화면에 각종 스탯을 적어보자
function displayStatus(stage, player, monster) {
  let allCardNames = combineCardNamesToString(player);
  console.log(chalk.yellowBright(`| 덱 리스트 | ${allCardNames}`));
  console.log(chalk.magentaBright(`\n====== Current Status ======`));
  console.log(
    chalk.cyanBright(`\n| Stage: ${stage} |\n`) +
      chalk.blueBright(
        `| 플레이어 정보 | 이름: ${player.name}, HP: ${player.hp}/${player.maxHp}, 방어도: ${player.defense}, 도망확률: ${player.runAwayProb} |
| 카드와의 유대감: ${player.bondingIndex}, 카드 개수: ${player.hasCard.length + player.hasCardInHand.length}, 손패 크기: ${player.handSize} |
      `,
      ) +
      chalk.redBright(`
| 몬스터 정보 | HP: ${monster.hp}, 공격력: ${monster.attackDmg} | "네놈을 추격해주마!" |`),
  );
  console.log(chalk.magentaBright(`===========================`));
  console.log(chalk.cyanBright(`\n${info}`));
  console.log(chalk.cyanBright(`>>알림: ${message}`));
}

function combineCardNamesToString(obj) {
  const cardNames = [];

  // hasCard 배열의 각 객체에서 cardName 값을 추출하여 배열에 추가
  obj.hasCard.forEach((card) => {
    if (card.cardName) {
      cardNames.push(card.cardName);
    }
  });

  // hasCardInHand 배열의 각 객체에서 cardName 값을 추출하여 배열에 추가
  obj.hasCardInHand.forEach((card) => {
    if (card.cardName) {
      cardNames.push(card.cardName);
    }
  });
  // sort() 메서드에 별다른 `compareFunction`이 제공되지 않는다면 배열의 요소를 문자열로 변환하고 두 요소를 비교한다.
  // 즉, sort() 메서드에 아무런 함수도 넣지 않는다면 반환값이 '요소a-요소b'인 함수를 콜백함수로 받는 것과 다름없다.
  // 따라서 오름차순으로 정렬된다.
  cardNames.sort();

  // 배열의 값을 공백으로 구분한 문자열로 변환
  return cardNames.join(', ');
}

function setMessage(newMessage) {
  message = newMessage;
}

function selectReward(player) {
  const reward1 = makeRandomCard();
  const reward2 = makeRandomCard();
  const reward3 = makeRandomCard();

  console.log(
    chalk.redBright(`
1. ${reward1.cardName}
2. ${reward2.cardName}
3. ${reward3.cardName}
    `),
  );

  let rewardSelection = readlineSync.question(
    '몇 번째 카드를 덱에 넣으시겠습니까?(상세보기 불가!!) : ',
  );

  switch (rewardSelection) {
    case '1':
      player.hasCard.push(reward1);
      break;
    case '2':
      player.hasCard.push(reward2);
      break;
    case '3':
      player.hasCard.push(reward3);
      break;
  }
}

export { displayStatus, setMessage, selectReward };
