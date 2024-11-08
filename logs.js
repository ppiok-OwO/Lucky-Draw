import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';

// 인게임 안내 메시지를 위한 변수들
const info = '[TIP]턴을 종료할 때 가진 카드가 모두 섞입니다. 신중하게 플레이해주세요.\n';
let message = '';

// 화면에 각종 스탯을 적어보자
function displayStatus(stage, player, monster) {
  let allCardNames = combineCardNamesToString(player);
  console.log(chalk.yellowBright(`| 덱 리스트 | ${allCardNames}`));
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} |\n`) +
      chalk.blueBright(
        `| 플레이어 정보 | 이름: ${player._name}, HP: ${player._hp}, 방어도: ${player._defense}, 도망확률: ${player._runAwayProb} |
| 카드와의 유대감: ${player._bondingIndex}, 카드 개수: ${player._hasCard.length + player._hasCardInHand.length}, 손패 크기: ${player._handSize} |
      `,
      ) +
      chalk.redBright(`
| 몬스터 정보 | HP: ${monster.hp}, 공격력: ${monster.attackDmg} | "네놈을 추격해주마!" |`),
  );
  console.log(chalk.magentaBright(`=====================`));
  console.log(chalk.cyanBright(`${info}\n>>알림: ${message}`));
}

function combineCardNamesToString(obj) {
  const cardNames = [];

  // _hasCard 배열의 각 객체에서 _cardName 값을 추출하여 배열에 추가
  obj._hasCard.forEach((card) => {
    if (card._cardName) {
      cardNames.push(card._cardName);
    }
  });

  // _hasCardInHand 배열의 각 객체에서 _cardName 값을 추출하여 배열에 추가
  obj._hasCardInHand.forEach((card) => {
    if (card._cardName) {
      cardNames.push(card._cardName);
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

export { displayStatus, setMessage };
