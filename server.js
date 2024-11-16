// 한글이 깨진다면 chcp 65001

import chalk, { colorNames } from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { startGame, typeName } from './game.js';
import { loadJson, getAchievements, unlockAchievement, loadSaveFile } from './jsonFunction.js';
import { colors } from './functions.js';
import sound from 'sound-play';
import path from 'path';

let difficultyChoice = 'NORMAL';
let difficulty = 1;
let uiStyle = 'COMPACT';
const filePath = path.resolve(
  './musics/Warriyo, Laura Brehm - Mortals (feat. Laura Brehm) [NCS Release].mp3',
);
let isPlaying = false;

// 시나리오 스크립트
async function scenario() {
  console.clear();

  const lines = [
    '10년 전, 마왕의 부활로 인해 대륙은 혼돈에 휩싸이기 시작했습니다.\n\n',
    '포악한 몬스터들이 인류를 학살하자, 평화롭던 마을도 순식간에 잿더미가 되어 버렸죠.\n\n',
    '선량한 자가 무참히 짓밟히고 악한 자만이 살아남는 시대...\n\n',
    '우리에게 남은 희망은 정의로운 영웅이 나타나 마왕을 처단해주는 것 뿐입니다.\n\n',
    '어쩌면 당신이 바로 그 영웅이 될 수도 있겠네요.\n\n',
    '...비록 당신은 손버릇이 나쁜 도박꾼이지만 말이죠.\n\n',
  ];

  await printCharacter(lines);

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

  // 오디오 재생
  // playAudioLoop();

  // 타이틀 텍스트
  console.log(
    chalk.hex('#FFF7D1')(
      figlet.textSync('Lucky Draw=*', {
        font: 'Delta Corps Priest 1',
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );

  // 상단 경계선
  const line = chalk.grey('='.repeat(50));
  console.log(line);

  // 게임 이름
  console.log(
    chalk.hex('#FFECC8').bold(`
덱빌딩 카드 게임 LuckyDraw!\n주정뱅이 도박꾼이라도 영웅이 될 수 있을까?!
당신의 운빨을 확인해보세요!\n
    `),
  );

  // 설명 텍스트
  console.log(
    chalk.hex('#FFD09B')(
      `옵션을 선택해주세요.(현재 난이도 : ${difficultyChoice} / UI 스타일 : ${uiStyle})`,
    ),
  );
  console.log();

  // 옵션들
  console.log(chalk.hex('#FFB0B0')('1.') + chalk.hex('#FFB0B0')(' 새로운 게임 시작'));
  console.log(chalk.hex('#FFB0B0')('2.') + chalk.hex('#FFB0B0')(' 업적 확인하기'));
  console.log(chalk.hex('#FFB0B0')('3.') + chalk.hex('#FFB0B0')(' 난이도'));
  console.log(chalk.hex('#FFB0B0')('4.') + chalk.hex('#FFB0B0')(' UI 옵션'));
  console.log(chalk.hex('#FFB0B0')('5.') + chalk.hex('#FFB0B0')(' 세이브 파일'));
  console.log(chalk.hex('#FFB0B0')('6.') + chalk.hex('#FFB0B0')(' 종료\n'));

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
      typeName(difficulty, uiStyle);

      // startGame();
      break;
    case '2':
      console.clear();
      // 업적 확인하기 로직을 구현
      await getAchievements();
      readlineSync.keyInPause('\n메뉴로 되돌아 가기: ');
      displayLobby();
      handleUserInput();
      break;
    case '3':
      let input = readlineSync.question('\n난이도 선택 [ NORMAL / HARD / HELL ] : ');
      input = input.toUpperCase();

      if (input === 'NORMAL') {
        difficultyChoice = input;
        difficulty = 1;
        displayLobby();
        handleUserInput();
      } else if (input === 'HARD') {
        difficultyChoice = input;
        difficulty = 1.5;
        displayLobby();
        handleUserInput();
      } else if (input === 'HELL') {
        difficultyChoice = input;
        difficulty = 2;
        displayLobby();
        handleUserInput();
      } else {
        console.log(chalk.red('올바르지 않은 입력입니다.'));
        displayLobby();
        handleUserInput();
      }
      break;
    // 옵션 메뉴 로직을 구현
    case '4':
      let selectUI = readlineSync.question('\nUI 스타일 [ LARGE / COMPACT ] : ');
      selectUI = selectUI.toUpperCase();

      if (selectUI === 'LARGE' || selectUI === 'COMPACT') {
        uiStyle = selectUI;
        displayLobby();
        handleUserInput();
      } else {
        console.log(chalk.red('올바르지 않은 입력입니다.'));
        displayLobby();
        handleUserInput();
      }
      break;
    case '5':
      console.clear();
      let saveData = await loadSaveFile();

      if (saveData) {
        if (readlineSync.keyInYN('\n해당 세이브 파일을 이어서 진행하시겠습니까?: ')) {
          typeName(saveData.save.player.difficulty, saveData.save.uiStyle, saveData);
        } else {
          displayLobby();
          handleUserInput();
        }
      } else {
        console.log(colors.battleLog('세이브 파일이 존재하지 않습니다.'));
        readlineSync.keyInPause();
      }

      break;
    case '6':
      console.log(chalk.red('게임을 종료합니다.'));
      // 게임 종료 로직을 구현
      process.exit(0); // 게임 종료
    default:
      console.log(chalk.red('올바르지 않은 입력입니다.'));
      handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
      break;
  }
}

// 게임 시작 함수
async function start() {
  scenario();
}

// 타자기 효과
async function printCharacter(lines, lineDelay = 500) {
  for (let i = 0; i < lines.length; i++) {
    await new Promise((resolve) => {
      let index = 0;
      function print() {
        if (index < lines[i].length) {
          process.stdout.write(chalk.red.bold(lines[i].charAt(index)));
          index++;
          setTimeout(print, 40);
        } else {
          resolve(); // 한 줄의 출력이 끝나면 resolve 호출
        }
      }
      print();
    });
    await new Promise((resolve) => setTimeout(resolve, lineDelay));
  }
}

async function playAudioLoop(filePath) {
  if (isPlaying) {
    return; // 이미 실행 중이면 새로 시작하지 않음
  }

  isPlaying = true; // 재생 상태를 설정

  try {
    while (isPlaying) {
      await sound.play(filePath); // 파일이 끝날 때까지 대기
    }
  } catch (error) {
    console.error('오디오 재생 중 오류 발생:', error);
  }
}


// 게임 실행
playAudioLoop(filePath);
start();

export { displayLobby, handleUserInput, uiStyle, playAudioLoop, isPlaying };
