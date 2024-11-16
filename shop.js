import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { colors } from './functions.js';
import { makeRandomCard, countCard } from './C_card.js';
import { combineCardNamesToString, displayDeckList, miniUI } from './logs.js';
import { playAudioLoop, isPlaying } from './server.js';
import sound from 'sound-play';
import path from 'path';

const filePath = path.resolve('./musics/THIRST - AIWA [NCS Release].mp3');

// 여관
let tavern = (player) => {
  let tavernChoice;
  let card1 = makeRandomCard(player);
  let card2 = makeRandomCard(player);
  let card3 = makeRandomCard(player);

  while (tavernChoice !== '4') {
    if (!isPlaying) {
      playAudioLoop(filePath);
    }
    console.clear();
    displayDeckList(player);
    miniUI(player);

    tavernImage();

    console.log(colors.info('\n=============| 여관 |=============\n'));
    console.log(colors.info('\n어서오세요! 꽤 보고 싶었다구요?\n'));
    console.log(colors.info('\n=============|******|=============\n'));

    do {
      tavernChoice = readlineSync.question(
        '\n1. 체력 30 회복하기(가격: 30골드)    2. 상점 이용하기    3. 중복 카드 합치기    4. 다음 전투로(자동저장)!\n',
      );
    } while (!['1', '2', '3', '4'].includes(tavernChoice)); // 1, 2, 3, 4 외의 입력을 방지

    switch (tavernChoice) {
      case '1':
        const restorHpPrice = 30;
        if (player.gold >= restorHpPrice && player.hp < player.maxHp) {
          player.updateHpByTavern(restorHpPrice);
          player.gold -= 30;
        } else if (player.hp >= player.maxHp) {
          console.log(colors.error('체력이 이미 가득 찼습니다!'));
          readlineSync.keyInPause();
        } else {
          console.log(colors.error('보유 금액이 부족합니다!'));
          readlineSync.keyInPause();
        }
        break;
      case '2':
        shop(player, card1, card2, card3);
        break;
      case '3':
        mergeCard(player);
        break;
      case '4':
        break;
    }
  }
};

//#region 카드 상점
let shop = (player, card1, card2, card3) => {
  displayDeckList(player);
  let cardName = shopping(card1, card2, card3, player);

  switch (cardName) {
    case '1':
      if (player.gold >= card1.price) {
        player.hasCard.push(card1);
        player.gold -= card1.price;
      } else {
        console.log(colors.error('보유 금액이 부족합니다!'));
        readlineSync.keyInPause();
      }
      break;
    case '2':
      if (player.gold >= card2.price) {
        player.hasCard.push(card2);
        player.gold -= card2.price;
      } else {
        console.log(colors.error('보유 금액이 부족합니다!'));
        readlineSync.keyInPause();
      }
      break;
    case '3':
      if (player.gold >= card3.price) {
        player.hasCard.push(card3);
        player.gold -= card3.price;
      } else {
        console.log(colors.error('보유 금액이 부족합니다!'));
        readlineSync.keyInPause();
      }
      break;
    default:
      break;
  }
};
let shopping = (card1, card2, card3, player) => {
  console.clear();
  displayDeckList(player);
  miniUI(player);

  console.log(
    colors.cardChoice(`
  1. 
  ======| 카드 상세보기 |======
  
  >>> ${card1.cardName}

  등급 : ${card1.cardTier}
  발동 확률 : ${card1.actProb}
  공격 데미지 : ${card1.attackDmg}
  화염 데미지 : ${card1.fireDmg}
  체력 회복량 : ${card1.restoreHp}
  방어도 : ${card1.defense}

  가격 : ${card1.price}

  ========| ******* |========

  2. 
  ======| 카드 상세보기 |======
  
  >>> ${card2.cardName}

  등급 : ${card2.cardTier}
  발동 확률 : ${card2.actProb}
  공격 데미지 : ${card2.attackDmg}
  화염 데미지 : ${card2.fireDmg}
  체력 회복량 : ${card2.restoreHp}
  방어도 : ${card2.defense}

  가격 : ${card2.price}

  ========| ******* |========

  3. 
  ======| 카드 상세보기 |======
  
  >>> ${card3.cardName}

  등급 : ${card3.cardTier}
  발동 확률 : ${card3.actProb}
  공격 데미지 : ${card3.attackDmg}
  화염 데미지 : ${card3.fireDmg}
  체력 회복량 : ${card3.restoreHp}
  방어도 : ${card3.defense}

  가격 : ${card3.price}

  ========| ******* |========
    `),
  );

  console.log(
    colors.green2(`
아주 흥미로운 카드들이네요! 어떤 카드를 구매하시겠습니까?
(나가시려면 엔터를 넣어주세요)
  `),
  );

  let cardName = readlineSync.question('번호로 입력 : ');

  return cardName;
};
//#endregion

// 카드 합치기
let mergeCard = (player) => {
  console.clear();
  // 덱 리스트 보여주고
  displayDeckList(player);
  miniUI(player);
  // 카드 개수 세기
  let cardCounts = countCard(player);

  let canMerge = [];
  for (let cardName in cardCounts) {
    if (cardCounts[cardName] >= 3) {
      canMerge.push(cardName);
    }
  }

  if (canMerge.length > 0) {
    let cardNameIndex = readlineSync.keyInSelect(
      canMerge,
      '세 장 이상 소유하고 있는 카드들입니다! 어떤 카드를 합치시겠습니까? ',
      { cancel: '취소하기' },
    );

    if (cardNameIndex === -1) {
      console.log(colors.error('카드 합치기가 취소되었습니다.'));
    }

    let cardName = canMerge[cardNameIndex];

    // player.hasCard에서 선택한 카드 제거 및 변경
    if (canMerge.includes(cardName)) {
      let removedCards = [];
      let potentialHandSizeAfterMerge = player.hasCard.length - 2; // 합친 후 예상되는 카드 수

      if (potentialHandSizeAfterMerge < player.handSize) {
        console.log(
          colors.error(
            '카드의 개수는 손패 크기보다 작아질 수 없습니다. 카드 합치기가 취소되었습니다.',
          ),
        );
        readlineSync.keyInPause();
      } else {
        player.hasCard = player.hasCard.filter((card) => {
          if (card.cardName === cardName && removedCards.length < 3) {
            removedCards.push(card); // 제거한 카드를 저장
            return false; // 제거할 카드는 false로 반환(filter() 메서드는 콜백함수의 조건이 true가 될 때 해당 요소를 선별해준다.)
          }
          return true; // 유지할 카드는 true로 반환
        });

        if (removedCards.length === 3) {
          // 첫 번째 카드를 기반으로 업그레이드된 카드 생성
          let upgradedCard = { ...removedCards[0], cardName: cardName + '+' };

          upgradedCard.actProb += 20;
          upgradedCard.attackDmg += upgradedCard.attackDmg;
          upgradedCard.fireDmg += upgradedCard.fireDmg;
          upgradedCard.restoreHp += upgradedCard.restoreHp;
          upgradedCard.defense += upgradedCard.defense;

          player.hasCard.push(upgradedCard);

          console.log(colors.success(`${cardName} 카드가 업그레이드되었습니다!`));
          readlineSync.keyInPause();
        }
      }
    } else {
      console.log(colors.error('유효하지 않은 카드입니다.'));
      readlineSync.keyInPause();
    }
  } else {
    console.log(colors.error('합칠 수 있는 카드가 없습니다.'));
    readlineSync.keyInPause();
  }
};

let tavernImage = () => {
  console.log(
    colors.info(`

⣿⣿⣿⡿⢿⣿⣿⣿⣿⣿⣣⣛⠃⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠻⣧⢹⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⠡⢿⣃⠦⡤⡩⢍⣙⢫⣿⣎⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⡇⢺⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣧⠙⣾⣏⣳⢱⡹⢬⣻⣿⣁⡞⡃⣤⢒⡠⢌⡉⢋⠛⠛⠛⠿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣟⠾⣳⡼⣿⣿⣿⣿⣿⣿⣿
⣿⣧⢩⢾⣿⣯⣷⣷⣯⣷⣿⣿⡇⢼⣆⡭⢒⡣⣚⢥⡚⡔⢢⠔⣠⢂⠀⡀⢀⠉⠛⣻⠙⠛⠿⠷⣯⡄⢿⣿⣿⣿⣿⣿⣿
⣿⣿⣷⣶⣶⣶⣬⣭⣝⣏⣿⢛⢿⠸⢿⠿⣿⣮⣗⣶⣭⣼⣆⣫⡔⢭⣙⠰⡣⠖⡠⢉⠄⡠⡀⣄⣾⠻⠎⠉⠉⠉⠛⠛⢿
⣿⣿⣿⡿⣛⠛⠿⠿⣿⣿⢾⣿⣸⣿⣷⣶⣷⣮⣯⣭⣝⣛⡿⠿⣿⣶⣿⣿⣷⣾⣶⣭⣶⣰⣌⡴⣿⣶⡉⠖⣐⠦⠄⡠⢨
⣿⣿⡏⢰⣏⠯⢛⣴⣲⣡⠦⣼⣦⡉⢛⠿⡛⠟⠻⠿⣿⣿⣿⣿⣿⣿⣾⣷⣿⣯⣿⣻⣟⣻⡿⢿⣿⣿⡧⣿⣶⣾⣥⣒⣩
⣿⣿⡷⢻⣏⢨⣻⢟⡻⠟⢿⠿⣷⢿⣞⣶⣭⣞⣖⣦⢤⣉⠴⣈⠌⣩⣍⠛⠛⠻⢿⠿⠿⣿⣿⣿⣣⣏⢿⣿⣽⣯⣿⣿⣿
⣿⣿⣗⣸⣯⢂⡿⣬⣗⠚⡬⡑⢎⠦⡉⢦⠹⢌⠯⡙⡛⡛⠻⠽⠾⢟⣶⣯⣜⣶⢢⣌⣲⡤⣈⠁⡌⢙⡌⠛⠛⠛⠻⢿⣿
⣿⣿⡿⢩⣿⠠⣟⡓⣚⠣⠴⠥⢌⢢⣙⠠⢃⠎⡰⢑⡲⢡⡧⢜⡄⢒⡠⢤⢉⠌⡩⠙⠳⢛⠛⠟⠞⢯⠷⣺⣴⣤⡂⠀⣹
⣿⣿⡇⢾⣟⠠⡷⡐⣽⡿⠿⣷⣶⣶⣮⠉⠑⠒⠒⠢⠱⠨⠅⢎⣂⠘⠃⢇⠸⠚⠥⠉⠒⠠⠉⠤⠉⠄⠂⠄⣤⠛⣿⠄⣼
⣿⣿⣿⣘⣿⡂⡿⢇⢻⡐⡃⣿⣇⠠⠹⠖⡂⣿⡧⠀⢳⣶⡶⠀⠠⣬⣄⣀⣂⠢⢄⠀⠁⡁⠘⠀⡘⠠⠈⡈⠍⠐⣻⡆⢸
⣿⣿⡟⢡⣷⠉⡷⢤⢢⠍⡔⣿⡇⠠⢁⠠⣸⢿⣧⠀⡀⢻⣧⠀⠁⡾⠁⢹⡏⠙⢻⡍⣷⠖⢶⣄⠰⣦⡄⢠⣭⡉⣽⣇⢸
⣿⣿⣇⢾⣻⠢⣿⣭⣓⣚⡒⣿⡇⠦⠤⢆⣿⣈⣿⡦⢔⡩⣿⣄⢲⣇⢠⢸⣏⣀⡦⠀⣿⠀⢀⣿⠀⡽⣧⠀⢸⠁⢾⡇⢸
⣿⣿⣿⠿⣟⢂⡷⣈⣭⠩⡍⣿⡟⡙⠛⣼⠳⠶⢻⣷⠤⣄⢻⣧⣾⠉⡉⢹⣏⠙⡗⠂⣿⠿⣿⠧⠂⣽⢼⣧⢸⠄⢺⡷⣈
⣿⣿⡏⣼⣏⠒⣯⣌⡦⠑⠾⠿⠷⣄⠵⣿⡄⡁⢂⣿⣇⡀⠘⣿⡃⠀⠀⢹⡏⠉⢈⡅⢿⠋⢻⡗⠢⢽⠄⢿⣿⠤⢻⡧⢼
⣿⣿⣷⣸⣟⡰⣿⢶⣙⡻⢞⣬⠳⢬⢎⡴⣠⡙⣎⢥⡩⣑⢢⡝⣠⠈⡄⠛⠛⠓⠿⠐⠿⠇⠀⠿⡆⣾⡄⠀⢿⠀⢺⡟⡤
⣿⣿⣟⢱⣷⠠⣟⣛⠮⣓⡮⠴⡩⡼⣝⡦⡑⣌⡩⢆⡓⢌⡡⢌⢤⡓⣬⠹⡌⡓⢦⡡⠆⡬⣐⡐⣠⢀⠔⢢⡖⠞⢾⣿⡐
⣿⣿⡇⣾⣏⡒⣿⣻⣽⡵⣚⡭⣗⣲⢩⠭⡝⣥⠭⣧⢹⢮⢵⣋⠦⡝⣂⡛⡔⠛⣆⡱⠯⢴⠢⡜⢡⠎⡼⣁⢎⡙⢾⡿⡔
⣿⣿⡏⣽⣷⣱⠹⠿⠿⠿⡿⣶⢷⣭⣯⣽⣽⣬⣻⣴⣋⣞⢦⣼⣘⠖⡣⣽⣌⠹⣤⠲⡬⠷⢦⣉⣦⡙⢤⣡⠒⣬⢾⣿⠡
⣿⣿⣧⢿⣯⣷⣻⣿⣽⣯⣵⣳⣮⣴⣳⣮⣴⢥⢧⡬⣕⣊⣃⠞⣩⢛⣭⠭⣍⠯⣍⡛⣖⢳⣒⠳⣒⠻⠖⠧⠽⢽⢻⣏⢧
⣿⣿⣿⣿⣾⣿⣿⣽⣿⣾⣽⣿⣽⣾⣿⣽⣿⣿⣿⣾⣿⣿⣟⣿⣳⡿⣾⣽⣽⣾⣶⢿⣶⣷⡾⢿⣷⣿⣯⣿⢿⣮⣷⣞⣶
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    
    `),
  );
};

export { tavern, shop, shopping, mergeCard };
