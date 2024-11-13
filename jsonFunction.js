import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import fsp from 'fs/promises'; // fs/promises에서 fs를 가져옵니다.
import fs from 'fs'; // fs 모듈을 가져옵니다.
import { colors } from './functions.js';
import { displayDeckList } from './logs.js';

// JSON 파일을 로드하는 함수
let loadJson = async (filePath) => {
  try {
    const data = await fsp.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('파일 읽기 오류:', err);
    return null; // 파일을 읽지 못했을 경우 null 반환
  }
};

// 완료한 업적 불러오기
async function getAchievements() {
  let jsonData;
  if (!jsonData) {
    jsonData = await loadJson('./data.json'); // 업적 데이터 파일 경로
  }
  if (jsonData && jsonData.achievements) {
    jsonData.achievements.forEach((achievement) => {
      if (achievement.isUnlocked) {
        console.log(
          chalk.hex('#E8B86D')(`====================|**⁂**|====================

  업적: ${achievement.name} 
  설명: ${achievement.description}
          
===============================================`),
        );
      }
    });
  } else {
    console.log('업적 데이터가 없습니다.');
  }
}

// 업적 완료하기
let unlockAchievement = async (filePath, index) => {
  try {
    let jsonData = await loadJson(filePath);

    // 업적 수정하기 (예: 첫 번째 업적의 isUnlocked를 true로 변경)
    if (jsonData && jsonData.achievements && jsonData.achievements.length > 0) {
      jsonData.achievements[index].isUnlocked = true; // 업적을 unlocked로 변경
    }

    // 수정된 데이터를 다시 JSON 문자열로 변환
    const updatedData = JSON.stringify(jsonData, null, 2);

    // 파일에 다시 쓰기
    await fsp.writeFile(filePath, updatedData, 'utf8');
  } catch (err) {
    console.error('파일 수정 오류:', err);
  }
};

let loadSaveFile = async () => {
  try {
    const jsonData = await loadJson('./savedGame.json'); // 세이브 데이터 파일 경로

    if (jsonData && jsonData.save) {
      // player가 문자열이면 JSON.parse()를 사용하고, 그렇지 않으면 그대로 사용
      let difficultyInfo =
        jsonData.save.player.difficulty === 1
          ? 'NORMAL'
          : player.difficulty === 1.2
            ? 'HARD'
            : 'HELL';

      console.log(colors.elite('저장 파일'));
      console.log(
        colors.green2(`
| Stage: ${jsonData.save.player.stage} | ${jsonData.save.player.blessing} | ${difficultyInfo} |`),
      );

      console.log(`${chalk.hex('#15B392').bold(`| 플레이어 | ${jsonData.save.player.name} |  방어도${Math.round(jsonData.save.player.defense)} | 유대감${Math.round(jsonData.save.player.bondingIndex)} | \n`)}
        `);

      return jsonData;
    } else {
      console.log('세이브 데이터가 없습니다.');
    }
  } catch (err) {
    console.error('로딩 오류:', err);
  }
};

async function saveAndExit(filePath, player, uiStyle) {
  try {
    let jsonData = (await loadJson(filePath)) || { save: {} };

    // 데이터 저장
    jsonData.save.player = player;
    jsonData.save.uiStyle = uiStyle;

    const updatedData = JSON.stringify(jsonData, null, 2);

    // 비동기 파일 쓰기
    await fsp.writeFile(filePath, updatedData, 'utf8');
    console.log('데이터가 성공적으로 저장되었습니다.');
  } catch (err) {
    console.error('파일 저장 오류:', err);
  }
}

export { loadJson, getAchievements, unlockAchievement, saveAndExit, loadSaveFile };
