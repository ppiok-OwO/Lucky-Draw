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
const info = `[TIP]전투 중에 카드를 자세히 보시려면 번호 앞에 'see'를 붙여주세요\n`;
let message = '';
let battleText = '';

// 화면에 각종 스탯을 적어보자
function displayStatus(stage, player, monster) {
  let allCardNames = combineCardNamesToString(player);
  console.log(chalk.hex('#f38d68').bold(`| 덱 리스트 | ${allCardNames}`));
  console.log(chalk.hex('#7c7c7c')(`\n====== Current Status ======`));
  console.log(
    chalk.hex('#efc88b').bold(`
| Stage: ${stage} | ${player.blessing} |
    `),
  );
  blessingExplain(player);
  console.log(
    chalk.hex('#04a777').bold(`
| 플레이어 정보 | 이름: ${player.name}, HP: ${Math.round(player.hp)}/${Math.round(player.maxHp)}, 방어도: ${Math.round(player.defense)}, 도망확률: ${Math.round(player.runAwayProb)} |
| 카드와의 유대감: ${Math.round(player.bondingIndex)}, 카드 개수: ${player.hasCard.length + player.hasCardInHand.length}, 손패 크기: ${player.handSize} | `),
  );

  if (player.blessing === 'Spike Defender') {
    console.log(chalk.hex('#04a777').bold(`| 가시 데미지 : ${Math.round(player.spikeDmg)} |`));
  } else if (player.blessing === 'Berserker') {
    console.log(
      chalk
        .hex('#04a777')
        .bold(
          `| 연속 공격 확률 : ${Math.round(player.multiAttackProb)}, 최대 공격 횟수 : ${Math.floor(player.maxAttackCount)} |`,
        ),
    );
  }

  console.log(
    chalk.hex('#CD1818').bold(`
| 몬스터 정보 | HP: ${Math.round(monster.hp)}, 공격력: ${Math.round(monster.attackDmg)} | "네놈을 추격해주마!" |\n`),
  );

  if (player.blessing === 'Chieftain') {
    console.log(
      chalk.hex('#CD1818').bold(`| 턴당 점화 스택 : ${Math.round(monster.igniteStack)} |`),
    );
  }

  console.log(chalk.hex('#7c7c7c')(`===========================`));
  console.log(chalk.hex('#7678ed')(`\n${info}`));
  console.log(chalk.hex('#f7b801')(`>> 알림 로그: ${message}`));
  console.log(chalk.hex('#f7b801')(`>> 전투 로그: ${battleText}`));
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
function setBattleText(newText) {
  battleText = newText;
}

function selectReward(player) {
  console.clear();

  console.log(
    chalk.cyan(
      figlet.textSync('Stage Clear!*', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  const reward1 = makeRandomCard();
  const reward2 = makeRandomCard();
  const reward3 = makeRandomCard();

  console.log(
    chalk.yellow(`
  1. 
  ======| 카드 상세보기 |======
  
    >>> ${reward1.cardName} <<<

  등급 : ${reward1.cardTier}
  발동 확률 : ${reward1.actProb}
  공격 데미지 : ${reward1.attackDmg}
  화염 데미지 : ${reward1.fireDmg}
  체력 회복량 : ${reward1.restoreHp}
  방어도 : ${reward1.defense}

  ========| ******* |========

  2. 
  ======| 카드 상세보기 |======
  
    >>> ${reward2.cardName} <<<

  등급 : ${reward2.cardTier}
  발동 확률 : ${reward2.actProb}
  공격 데미지 : ${reward2.attackDmg}
  화염 데미지 : ${reward2.fireDmg}
  체력 회복량 : ${reward2.restoreHp}
  방어도 : ${reward2.defense}

  ========| ******* |========

  3. 
  ======| 카드 상세보기 |======
  
    >>> ${reward3.cardName} <<<

  등급 : ${reward3.cardTier}
  발동 확률 : ${reward3.actProb}
  공격 데미지 : ${reward3.attackDmg}
  화염 데미지 : ${reward3.fireDmg}
  체력 회복량 : ${reward3.restoreHp}
  방어도 : ${reward3.defense}

  ========| ******* |========
    `),
  );

  let rewardSelection = readlineSync.question(
    '몇 번째 카드를 덱에 넣으시겠습니까?(보상을 skip하시려면 번호가 아닌 다른 키를 눌러주세요.) : ',
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

let blessingExplain = (player) => {
  if (player.blessing === 'Spike Defender') {
    console.log(
      chalk
        .hex('#efc88b')
        .bold(
          '가시 수호자는 기본 가시데미지를 20 얻습니다. 방어도를 얻을 때 현재 가시 데미지 수치의 절반만큼을 방어도로 획득합니다. 방어도를 가지고 있을 때에만 공격자에게 가시 데미지를 줄 수 있습니다.',
        ),
    );
  } else if (player.blessing === 'Berserker') {
    console.log(
      chalk
        .hex('#efc88b')
        .bold(
          '광전사는 연속으로 공격할 확률을 얻습니다. 이때, 최대 공격 횟수에 따라 여러 번 공격할 수 있습니다. 카드를 쓸 때마다 체력을 5씩 잃지만 연속 공격 확률이 10%p 증가하거나 최대 공격 횟수가 0.5씩 증가합니다. 가한 피해의 80퍼센트를 흡혈할 수 있습니다.',
        ),
    );
  } else if (player.blessing === 'Chieftain') {
    console.log(
      chalk
        .hex('#efc88b')
        .bold(
          '화염 투사는 카드의 화염 데미지만큼 적에게 점화를 걸 수 있습니다. 점화 스택은 턴이 끝날 때마다 1씩 감소합니다. 카드를 통해 HP를 회복할 때 직접 가한 화염 데미지만큼 추가로 회복할 수 있으며, 회복한 체력만큼 점화 스택이 증가합니다.',
        ),
    );
  }
};

export { displayStatus, setMessage, selectReward, setBattleText };
