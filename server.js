// 한글이 깨진다면 chcp 65001

import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame, typeName } from './game.js';


// 시나리오 스크립트
async function scenario() {
  console.clear();
  const line = chalk.white('='.repeat(50));
  console.log(line);
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        chalk.red.bold(`
10년 전, 마왕의 부활로 인해 이 세상은 혼돈에 휩싸였습니다.
        `),
      );
      resolve(); // 비동기 작업 완료
    }, 1000);
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        chalk.red.bold(`
포악한 몬스터들이 인류를 약탈하였고, 수많은 용사들은 목숨을 잃고 말았습니다.
        `),
      );
      resolve();
    }, 3000);
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        chalk.red.bold(`
선량한 자는 짓밟히고 악한 자는 타락하는 지금, 인류는 영웅의 탄생을 바라고 있습니다.
        `),
      );
      resolve();
    }, 3000);
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        chalk.red.bold(`
만약 정의로운 영웅이 되고자 한다면 몬스터를 무찌르고 마왕을 물리쳐야 합니다.
        `),
      );
      resolve();
    }, 3000);
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        chalk.red.bold(`
어쩌면 당신이 영웅이 될 수 있을지도 모르겠네요. 누구나 정의로울 수는 있으니까요.
        `),
      );
      resolve();
    }, 3000);
  });
  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(
        chalk.red.bold(`
...비록 당신은 알코올 중독에 걸린 도박꾼이지만 말이죠.
        `),
      );
      resolve();
    }, 4000);
  });

  await new Promise((resolve) => {
    setTimeout(() => {
      console.log(line);
      resolve();
    }, 1000);
  });

  await new Promise(() => {
    setTimeout(() => {
      displayLobby();
      handleUserInput();
    }, 2000);
  });
}

// 로비 화면을 출력하는 함수
function displayLobby() {
  console.clear();

  // 타이틀 텍스트
  console.log(
    chalk.cyan(
      figlet.textSync('Lucky Draw=*', {
        font: 'ANSI Shadow',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  // 상단 경계선
  const line = chalk.magentaBright('='.repeat(50));
  console.log(line);

  // 게임 이름
  console.log(
    chalk.yellowBright.bold(
      `덱빌딩 카드 게임 LuckyDraw!\n술주정뱅이 도박꾼이라도 영웅이 될 수 있다?! 당신의 운빨을 확인해보세요!\n`,
    ),
  );

  // 설명 텍스트
  // console.log(chalk.green('옵션을 선택해주세요.'));
  console.log();

  // 옵션들
  console.log(chalk.blue('1.') + chalk.white(' 새로운 게임 시작'));
  console.log(chalk.blue('2.') + chalk.white(' 업적 확인하기'));
  console.log(chalk.blue('3.') + chalk.white(' 옵션'));
  console.log(chalk.blue('4.') + chalk.white(' 종료'));

  // 하단 경계선
  console.log(line);

  // 하단 설명
  console.log(chalk.gray('1-4 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
function handleUserInput() {
  const choice = readlineSync.question('입력: ');

  switch (choice) {
    case '1':
      console.log(chalk.green('게임을 시작합니다.'));
      // 여기에서 새로운 게임 시작 로직을 구현
      typeName();
      // startGame();
      break;
    case '2':
      console.log(chalk.yellow('구현 준비중입니다.. 게임을 시작하세요'));
      // 업적 확인하기 로직을 구현
      handleUserInput();
      break;
    case '3':
      console.log(chalk.blue('구현 준비중입니다.. 게임을 시작하세요'));
      // 옵션 메뉴 로직을 구현
      handleUserInput();
      break;
    case '4':
      console.log(chalk.red('게임을 종료합니다.'));
      // 게임 종료 로직을 구현
      process.exit(0); // 게임 종료
      break;
    default:
      console.log(chalk.red('올바른 선택을 하세요.'));
      handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
  }
}

// 게임 시작 함수
async function start() {
  scenario();
}

// 게임 실행
start();
