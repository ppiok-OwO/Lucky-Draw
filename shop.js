import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { colors } from './functions.js';
import { makeRandomCard, seeCard } from './C_card.js';

let tavern = (player) => {
  console.clear();

  console.log(colors.elite('=============| 여관 |============='));
  console.log(colors.elite('\n어서오세요! 꽤 보고 싶었다구요?\n'));
  let choice = readlineSync.question('\n1. 상점 이용하기   2. 중복 카드 합치기   3. 나가기\n');

  switch (choice) {
    case '1':
      shop(player);
    case '2':
      mergeCard(player);
    case '3':
      break;
  }
};

let shop = (player) => {
  console.clear();

  let card1 = makeRandomCard(player);
  let card2 = makeRandomCard(player);
  let card3 = makeRandomCard(player);

  let cardName = shopping(card1, card2, card3);

  switch (cardName) {
    case '1':
      player.hasCard.push(card1);
      tavern(player);
    case '2':
      player.hasCard.push(card2);
      tavern(player);
    case '3':
      player.hasCard.push(card3);
      tavern(player);
    default:
      shopping(card1, card2, card3);
  }
};

let mergeCard = (player) => {
  console.clear();

  // 카드 한 배열로 모으고 정렬
  player.collectAllCard();
  let cardCounts = {};

  // 카드 개수 세기
  player.hasCard.forEach((card) => {
    if (cardCounts[card.cardName]) {
      cardCounts[card.cardName]++;
    } else {
      cardCounts[card.cardName] = 1;
    }
  });

  let canMerge = [];
  for (let cardName in cardCounts) {
    if (cardCounts[cardName] >= 3) {
      canMerge.push(cardName);
    }
  }

  if (canMerge.length > 0) {
    console.log(
      colors.info(`
${canMerge}
세 장 이상 소유하고 있는 카드들이네요! 어떤 카드를 합치시겠습니까?
    `),
    );
    const cardName = readlineSync.question('');

    if (canMerge.includes(cardName)) {
      // player.hasCard에서 선택한 카드 세 장을 담기
      let removedCards = [];
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

        upgradedCard.actProb += 10;
        upgradedCard.attackDmg += upgradedCard.attackDmg / 2;
        upgradedCard.fireDmg += upgradedCard.fireDmg / 2;
        upgradedCard.restoreHp += upgradedCard.restoreHp / 2;
        upgradedCard.defense += upgradedCard.defense / 2;

        player.hasCard.push(upgradedCard);

        console.log(colors.success(`${cardName} 카드가 업그레이드되었습니다!`));
      }
    } else {
      console.log(colors.error('유효하지 않은 카드입니다.'));
    }
  } else {
    console.log(colors.error('합칠 수 있는 카드가 없습니다.'));
  }
};

let shopping = (card1, card2, card3) => {
  console.log(
    colors.cardChoice(`
  1. 
  ======| 카드 상세보기 |======
  
    >>> ${card1.cardName} <<<

  등급 : ${card1.cardTier}
  발동 확률 : ${card1.actProb}
  공격 데미지 : ${card1.attackDmg}
  화염 데미지 : ${card1.fireDmg}
  체력 회복량 : ${card1.restoreHp}
  방어도 : ${card1.defense}

  ========| ******* |========

  2. 
  ======| 카드 상세보기 |======
  
    >>> ${card2.cardName} <<<

  등급 : ${card2.cardTier}
  발동 확률 : ${card2.actProb}
  공격 데미지 : ${card2.attackDmg}
  화염 데미지 : ${card2.fireDmg}
  체력 회복량 : ${card2.restoreHp}
  방어도 : ${card2.defense}

  ========| ******* |========

  3. 
  ======| 카드 상세보기 |======
  
    >>> ${card3.cardName} <<<

  등급 : ${card3.cardTier}
  발동 확률 : ${card3.actProb}
  공격 데미지 : ${card3.attackDmg}
  화염 데미지 : ${card3.fireDmg}
  체력 회복량 : ${card3.restoreHp}
  방어도 : ${card3.defense}

  ========| ******* |========
    `),
  );

  console.log(
    colors.info(`
아주 흥미로운 카드들이네요! 어떤 카드를 구매하시겠습니까?
  `),
  );

  const cardName = readlineSync.question('번호로 입력 : ');

  return cardName;
};

export { tavern, shopping, mergeCard };
