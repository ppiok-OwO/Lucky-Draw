import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { makeRandomCard, seeCard } from './C_card.js';
import { Player } from './C_player.js';
import { colors } from './functions.js';

// 인게임 안내 메시지를 위한 변수들
const info = `[TIP]전투 중에 카드를 자세히 보시려면 번호 앞에 'see'를 붙여주세요\n`;
let message = '';
let battleText = '';

// LARGE UI
function largeUI(player, monster) {
  let allCardNames = combineCardNamesToString(player);
  let difficultyInfo =
    player.difficulty === 1 ? 'NORMAL' : player.difficulty === 1.2 ? 'HARD' : 'HELL';
  console.log(colors.green1(`| 덱 리스트 | ${allCardNames}`));
  console.log(colors.grey(`\n====== Current Status ======`));

  if (player.isBossStage) {
    console.log(
      colors.danger(`
| Stage: ${player.stage}(BOSS!!) | ${player.blessing} | ${difficultyInfo} |
      `),
    );
  } else if (player.isEliteStage) {
    console.log(
      colors.elite(`
| Stage: ${player.stage}(ELITE!!) | ${player.blessing} | ${difficultyInfo} |
      `),
    );
  } else {
    console.log(
      colors.green2(`
| Stage: ${player.stage} | ${player.blessing} | ${difficultyInfo} |
      `),
    );
  }

  blessingExplain(player);
  console.log(
    colors.green3(`
| 플레이어 정보 | ${player.name} | HP: ${Math.round(player.hp)}/${Math.round(player.maxHp)}, 방어도: ${Math.round(player.defense)}, 도망확률: ${Math.round(player.runAwayProb)} |
| 카드와의 유대감: ${Math.round(player.bondingIndex)}, 카드 개수: ${player.hasCard.length + player.hasCardInHand.length}, 손패 크기: ${player.handSize} | `),
  );

  if (player.blessing === 'Spike Defender') {
    console.log(colors.green3(`| 가시 데미지 : ${Math.round(player.spikeDmg)} |`));
  } else if (player.blessing === 'Berserker') {
    console.log(
      colors.green3(
        `| 연속 공격 확률 : ${Math.round(player.multiAttackProb)}, 최대 공격 횟수 : ${Math.floor(player.maxAttackCount)} |`,
      ),
    );
  }

  console.log(
    colors.monster(`
| 몬스터 정보 | ${monster.name} | HP: ${Math.round(monster.hp)}, 공격력: ${Math.round(monster.attackDmg)} | ${monster.threat} |\n`),
  );

  if (player.blessing === 'Chieftain') {
    console.log(colors.monster(`| 턴당 점화 스택 : ${monster.igniteStack} |`));
  }

  console.log(colors.grey(`===========================`));
  console.log(colors.info(`\n${info}`));
  console.log(colors.message(`>> 알림 로그: ${message}`));
  console.log(colors.battleLog(`>> 전투 로그: ${battleText}`));
}

// COMPACT UI
let compactUI = (player, monster) => {
  let allCardNames = combineCardNamesToString(player);
  let difficultyInfo =
    player.difficulty === 1 ? 'NORMAL' : player.difficulty === 1.2 ? 'HARD' : 'HELL';
  console.log(colors.green1(`| 덱 리스트 | ${allCardNames}`));
  console.log(colors.grey(`\n====== Current Status ======`));

  if (player.isBossStage) {
    console.log(
      colors.danger(`
| Stage: ${player.stage}(BOSS!!) | ${player.blessing} | ${difficultyInfo} |
      `),
    );
  } else if (player.isEliteStage) {
    console.log(
      colors.elite(`
| Stage: ${player.stage}(ELITE!!) | ${player.blessing} | ${difficultyInfo} |
      `),
    );
  } else {
    console.log(
      colors.green2(`
| Stage: ${player.stage} | ${player.blessing} | ${difficultyInfo} |
      `),
    );
  }

  blessingExplain(player);
  DisplayBattleStatus(player, monster);

  console.log(colors.grey(`\n===========================`));
  console.log(colors.info(`\n${info}`));
  console.log(colors.message(`>> 알림 로그: ${message}`));
  console.log(colors.battleLog(`>> 전투 로그: ${battleText}`));
};

// 보유한 카드의 이름들을 문자열로 정렬하기
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

// 알림
function setMessage(newMessage) {
  message = newMessage;
}

// 전투로그
function setBattleText(newText) {
  battleText = newText;
}

// 스테이지 보상
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

  const reward1 = makeRandomCard(player);
  const reward2 = makeRandomCard(player);
  const reward3 = makeRandomCard(player);

  console.log(
    colors.cardChoice(`
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

// 축복 설명
let blessingExplain = (player) => {
  if (player.blessing === 'Spike Defender') {
    console.log(
      colors.green2(
        '| 가시 수호자는 기본 가시데미지를 20 얻습니다. 방어도를 얻을 때 현재 가시 데미지 수치의 절반만큼을 방어도로 획득합니다. 방어도를 가지고 있을 때에만 공격자에게 가시 데미지를 줄 수 있습니다.',
      ),
    );
  } else if (player.blessing === 'Berserker') {
    console.log(
      colors.green2(
        '| 광전사는 연속으로 공격할 확률을 얻습니다. 이때, 최대 공격 횟수에 따라 여러 번 공격할 수 있습니다. 카드를 쓸 때마다 체력을 5씩 잃지만 연속 공격 확률이 10%p 증가하거나 최대 공격 횟수가 1씩 증가합니다. 가한 피해만큼 흡혈할 수 있습니다.',
      ),
    );
  } else if (player.blessing === 'Chieftain') {
    console.log(
      colors.green2(
        '| 화염 투사는 카드의 화염 데미지만큼 적에게 점화를 걸 수 있습니다. 점화 스택은 턴이 끝날 때마다 1씩 감소합니다. 카드를 통해 HP를 회복할 때 직접 가한 화염 데미지만큼 추가로 회복할 수 있으며, 회복한 체력만큼 점화 스택이 증가합니다.',
      ),
    );
  }
};

// 체력바 생성 함수
function CreateHealthBar(player, color, length = 20) {
  const filledLength = Math.round((player.hp / player.maxHp) * length);
  const emptyLength = length - filledLength;
  return chalk.hex(color)('█'.repeat(filledLength)) + chalk.white('░'.repeat(emptyLength));
}

// 전투 상태 표시 함수
function DisplayBattleStatus(player, monster) {
  const playerHealthBar = CreateHealthBar(player, '#15B392');
  console.log(
    `${chalk.hex('#15B392').bold(`\n| 플레이어 | ${player.name} | 방어도${Math.round(player.defense)} | 유대감${Math.round(player.bondingIndex)} |\n`)}`,
  );
  console.log(
    playerHealthBar + chalk.yellow.bold(` ${Math.round(player.hp)}/${Math.round(player.maxHp)}\n`),
  );

  if (player.blessing === 'Spike Defender') {
    console.log(colors.green4(`가시:${player.spikeDmg}`));
  } else if (player.blessing === 'Berserker') {
    console.log(
      colors.green4(
        `연속공격확률:${player.multiAttackProb}, 최대공격횟수:${player.maxAttackCount}`,
      ),
    );
  }

  const monsterHealthBar = CreateHealthBar(monster, '#F31559');
  console.log(
    `${chalk.hex('#F31559').bold(`\n| 몬스터 | ${monster.name} | ${monster.threat} |\n`)}`,
  );
  console.log(
    monsterHealthBar +
      chalk.yellow.bold(` ${Math.round(monster.hp)}/${Math.round(monster.maxHp)}\n`),
  );
  if (player.blessing === 'Chieftain') {
    console.log(
      colors.monsterDebuff(
        `점화:${monster.igniteStack}스택, 공격력: ${Math.round(monster.attackDmg)}`,
      ),
    );
  } else {
    console.log(colors.monsterDebuff(`공격력: ${Math.round(monster.attackDmg)}`));
  }
}

export { largeUI, compactUI, setMessage, selectReward, setBattleText, combineCardNamesToString };
