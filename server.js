// 한글이 깨진다면 chcp 65001

import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame, typeName } from './game.js';
import { jsonData, loadJson, getAchievements, unlockAchievement } from './jsonFunction.js';

// 시나리오 스크립트
async function scenario() {
  console.clear();
  // const lines = [
  //   '10년 전, 마왕의 부활로 인해 대륙은 혼돈에 휩싸이기 시작했습니다.\n\n',
  //   '포악한 몬스터들이 인류를 학살하자, 평화롭던 마을도 순식간에 잿더미가 되어 버렸죠.\n\n',
  //   '선량한 자가 무참히 짓밟히고 악한 자만이 살아남는 시대...\n\n',
  //   '우리에게 남은 희망은 정의로운 영웅이 나타나 마왕을 처단해주는 것 뿐입니다.\n\n',
  //   '어쩌면 당신이 바로 그 영웅이 될 수도 있겠네요.\n\n',
  //   '...비록 당신은 알코올 중독에 걸린 도박꾼이지만 말이죠.\n\n',
  // ];

  // await printCharacter(lines);

  await new Promise(() => {
    setTimeout(() => {
      displayLobby();
      handleUserInput();
    }, 1500);
  });
}

// 로비 화면을 출력하는 함수
function displayLobby() {
  console.clear();

  // 타이틀 텍스트
  console.log(
    chalk.hex('#D51717')(
      figlet.textSync('Lucky Draw=*', {
        font: 'Delta Corps Priest 1',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  // 상단 경계선
  const line = chalk.white('='.repeat(50));
  console.log(line);

  // 게임 이름
  console.log(
    chalk.hex('#00AA6C').bold(`
덱빌딩 카드 게임 LuckyDraw!\n주정뱅이 도박꾼이라도 영웅이 될 수 있을까?!
당신의 운빨을 확인해보세요!\n
    `),
  );

  // 설명 텍스트
  console.log(chalk.hex('#00C9D0')('옵션을 선택해주세요.'));
  console.log();

  // 옵션들
  console.log(chalk.hex('#E2D700')('1.') + chalk.hex('#E2D700')(' 새로운 게임 시작'));
  console.log(chalk.hex('#E2D700')('2.') + chalk.hex('#E2D700')(' 업적 확인하기'));
  console.log(chalk.hex('#E2D700')('3.') + chalk.hex('#E2D700')(' 옵션'));
  console.log(chalk.hex('#E2D700')('4.') + chalk.hex('#E2D700')(' 종료\n'));

  // 하단 경계선
  console.log(line);

  // 하단 설명
  console.log(chalk.gray('\n1-4 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 메뉴에서 입력을 받는다.
async function handleUserInput() {
  const choice = readlineSync.question('입력: ');

  switch (choice) {
    case '1':
      console.log(chalk.green('게임을 시작합니다.'));
      // 여기에서 새로운 게임 시작 로직을 구현
      typeName();
      // startGame();
      break;
    case '2':
      console.clear();
      // 업적 확인하기 로직을 구현
      await getAchievements();
      readlineSync.question('\n메뉴로 되돌아 가기: ');
      displayLobby();
      handleUserInput();
      break;
    case '3':
      console.log(chalk.blue('구현 준비중입니다.. 게임을 시작하세요'));
      // 옵션 메뉴 로직을 구현
      break;
    case '4':
      console.log(chalk.red('게임을 종료합니다.'));
      // 게임 종료 로직을 구현
      process.exit(0); // 게임 종료
    default:
      console.log(chalk.red('올바르지 않은 입력입니다.'));
      handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
  }
}

// 게임 시작 함수
async function start() {
  scenario();
}

// 타자기 효과
async function printCharacter(lines, lineDelay = 1000) {
  for (let i = 0; i < lines.length; i++) {
    await new Promise((resolve) => {
      let index = 0;
      function print() {
        if (index < lines[i].length) {
          process.stdout.write(chalk.red.bold(lines[i].charAt(index)));
          index++;
          setTimeout(print, 80);
        } else {
          resolve(); // 한 줄의 출력이 끝나면 resolve 호출
        }
      }
      print();
    });
    await new Promise((resolve) => setTimeout(resolve, lineDelay));
  }
}

// 게임 실행
start();

export { displayLobby, handleUserInput };
