import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import {
  largeUI,
  compactUI,
  setMessage,
  setPlayerBattleText,
  setMonsterBattleText,
} from './logs.js';
import sound from 'sound-play';
import path from 'path';

// const attackSound = path.resolve('./musics/Fight Hits 24.mp3');
// const bossAttackSound = path.resolve('./musics/Godzilla Roar Sound.mp3');
// const ogreSound = path.resolve('./musics/Ogre Disappoint 2.mp3');

class Monster {
  constructor(name, threat, player) {
    this.name = name;
    if (player.isBossStage) {
      this.hp = Math.round(300 + 130 * player.stage * player.difficulty);
      this.attackDmg = Math.round(25 * player.stage * player.difficulty);
    } else if (player.isEliteStage) {
      this.hp = Math.round(250 + 100 * player.stage * player.difficulty);
      this.attackDmg = Math.round(15 * player.stage * player.difficulty);
    } else {
      this.hp = Math.round(200 + 80 * player.stage * player.difficulty);
      this.attackDmg = Math.round(10 * player.stage * player.difficulty);
    }
    this.maxHp = this.hp;
    this.isIgnited = false;
    this.igniteStack = 0;
    this.threat = threat;
    this.monsterAttackCount = 1;
    this.skillName = '';
  }

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
    this.attackDmg += player.difficulty;
    this.monsterAttackCount++;
    // sound.play(attackSound);
    setMonsterBattleText(
      `${this.name}이(가) 당신을 ${this.attackDmg}만큼의 데미지로 공격했습니다!`,
    );
  }

  monsterLoseHpByCard(player, playingCard, cardPower = 1) {
    // 가시 수호자
    if (player.blessing === 'Spike Defender') {
      this.hp -= Math.round(playingCard.attackDmg * cardPower + player.spikeDmg);
      setPlayerBattleText(
        `${this.name}에게 ${Math.round(playingCard.attackDmg * cardPower)}만큼의 데미지와 ${Math.round(player.spikeDmg)}만큼의 가시 데미지를 주었습니다.`,
      );
      // 광전사
    } else if (player.blessing === 'Berserker') {
      let randomValue = Math.random() * 100;
      // 공격 횟수는 플레이어의 최대 공격 횟수 이하의 범위에서 랜덤하게 정한다. 단, 최솟값은 2 이상.
      let attackCount = Math.floor(Math.random() * (player.maxAttackCount - 1)) + 2;
      if (player.multiAttackProb >= randomValue) {
        this.hp -= Math.round(playingCard.attackDmg * cardPower) * attackCount;
        // 연속 공격에 성공하면 배틀 로그를 변경
        setPlayerBattleText(
          `미쳐 날뛰고 있습니다! ${this.name}에게 ${Math.round(playingCard.attackDmg * cardPower)}의 데미지로 ${attackCount}회 연속 공격!`,
        );
        // 입힌 데미지만큼 회복
        player.hp += Math.round(playingCard.attackDmg * cardPower) * attackCount;
        if (player.hp >= player.maxHp) {
          player.hp = player.maxHp;
        }
      } else {
        // 연속 공격 안 할 때
        this.hp -= Math.round(playingCard.attackDmg * cardPower);
        player.hp += Math.round(playingCard.attackDmg * cardPower);
        setPlayerBattleText(
          `${this.name}에게 ${Math.round(playingCard.attackDmg * cardPower)}만큼의 데미지를 주었습니다.`,
        );
        if (player.hp >= player.maxHp) {
          player.hp = player.maxHp;
        }
      }
    } // 화염 투사
    else if (player.blessing === 'Chieftain') {
      this.hp -= Math.round(playingCard.fireDmg * cardPower);
      this.isIgnited = true;
      setPlayerBattleText(
        `${this.name}에게 ${Math.round(playingCard.fireDmg * cardPower)}만큼의 데미지를 주었습니다. 적이 불에 타오르고 있습니다.`,
      );
    }
  }
  monsterLoseHpByIgnite(playingCard, cardPower = 1, player) {
    if (this.isIgnited && player.blessing === 'Chieftain') {
      this.igniteStack += Math.round(playingCard.fireDmg * cardPower);
      this.hp -= this.igniteStack;
      this.igniteStack--;
    }
  }
  monsterRestoreHpByTurn() {
    this.hp += this.maxHp * 0.05;
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
  }
}

// 킹슬라임
class Slime extends Monster {
  constructor(player) {
    // name, threat, hp, attackDmg
    super('킹슬라임', '"뽀잉! 뽀잉!"', player);
  }

  skillName =
    '[점액질 바운스!] - 플레이어의 손이 끈적해집니다. 손이 끈적해진 상태에서는 카드를 섞거나 제거할 수 없습니다.';

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
    this.attackDmg += player.difficulty;
    this.monsterAttackCount++;
    // sound.play(attackSound);
    setMonsterBattleText(
      `${this.name}이(가) 당신을 ${this.attackDmg}만큼의 데미지로 공격했습니다!`,
    );

    player.isSticky = true;
  }
}

// 하피
class Harpy extends Monster {
  constructor(player) {
    super('높은 바위 하피', '"깃털 총공격!"', player);
  }

  skillName = '[저항의 비상] - 몬스터가 6번 공격하면 다음 턴 동안 무적이 됩니다.';

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
    this.attackDmg += player.difficulty;
    this.monsterAttackCount++;
    // sound.play(attackSound);
    setMonsterBattleText(
      `${this.name}이(가) 당신을 ${this.attackDmg}만큼의 데미지로 공격했습니다!`,
    );

    if (this.monsterAttackCount !== 0 && this.monsterAttackCount % 6 === 0) {
      setMonsterBattleText(
        `${this.name}이(가) 높이 날아올라 모든 공격을 회피합니다. 당신을 ${this.attackDmg}만큼의 데미지로 공격했습니다!`,
      );
    }
  }
}

// 렉사르
class Ork extends Monster {
  constructor(player) {
    super('렉사르', '"사냥을 시작하지! 네놈을 추격해주마!"', player);
  }

  skillName =
    '[헷갈릴 땐 명치를 쳐라] - 카드를 통해 직접적으로 얻는 방어도와 회복력이 절반이 됩니다.(흡혈로 얻는 HP와 가시데미지를 통해 얻는 방어도는 예외)';

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
    this.attackDmg += player.difficulty;
    this.monsterAttackCount++;
    // sound.play(attackSound);
    setMonsterBattleText(
      `${this.name}이(가) 당신을 ${this.attackDmg}만큼의 데미지로 공격했습니다!`,
    );

    player.isTargeted = true;
  }
}

// 오우거 마법사
class Ogre extends Monster {
  constructor(player) {
    super('오우거 마법사', '"준비됐어! 난 아직인데?"', player);
  }
  isClumsy = true;
  skillName =
    '[엉뚱] - 플레이어와 오우거 마법사가 엉뚱해집니다. 50%의 확률로 공격해야 한다는 사실을 까먹습니다.';

  monsterAttack(player) {
    // 몬스터의 공격
    let randomValue = Math.random() * 2;
    if (randomValue < 1) {
      player.updateHpByMonster(-this.attackDmg);
      player.updateDefenseByMonster(-this.attackDmg);
      this.attackDmg += player.difficulty;
      this.monsterAttackCount++;
      // sound.play(ogreSound);
      setMonsterBattleText(
        `${this.name}이(가) 당신을 ${this.attackDmg}만큼의 데미지로 공격했습니다!`,
      );

      player.isClumsy = true;
    } else {
      setMonsterBattleText('오우거 마법사가 공격하는 걸 까먹었습니다!');
    }
  }
}
// 여기까지가 1~9스테이지 몬스터

// 10스테이지는 마왕
class Boss extends Monster {
  constructor(player) {
    super('만물의 종결자', '"내가 바로 대격변이다!"', player);
  }

  skillName =
    '[666] - 6번 공격하면 다음 턴에 브레스 스킬을 사용합니다. 감소한 hp만큼 브레스의 데미지가 상승합니다.';

  monsterAttack(player) {
    // 몬스터의 공격
    if (this.monsterAttackCount !== 0 && this.monsterAttackCount % 6 === 0) {
      // 감소한 hp만큼 공격데미지에 추가한다.
      let breathDmg = 300 * player.difficulty;
      let tempAttackDmg = this.attackDmg + breathDmg + (this.maxHp - this.hp);
      // sound.play();
      player.updateHpByMonster(-tempAttackDmg);
      player.updateDefenseByMonster(-tempAttackDmg);
      this.attackDmg += player.difficulty;
      this.monsterAttackCount++;
      // sound.play(bossAttackSound);
      setMonsterBattleText(
        `${this.name}이(가) 당신을 ${tempAttackDmg}만큼의 데미지로 공격했습니다!`,
      );
    } else {
      player.updateHpByMonster(-this.attackDmg);
      player.updateDefenseByMonster(-this.attackDmg);
      this.attackDmg += player.difficulty;
      this.monsterAttackCount++;
      // sound.play(bossAttackSound);
      setMonsterBattleText(
        `${this.name}이(가) 당신을 ${this.attackDmg}만큼의 데미지로 공격했습니다!`,
      );
    }
  }
}

// 몬스터의 인스턴스를 무작위로 생성하는 함수
function makeRandomMonster(player) {
  // 3, 6, 9 턴은 player.isEliteStage = true;
  player.isEliteStage = player.stage % 3 === 0;
  player.isBossStage = player.stage === 10;
  const monsterClasses = [Slime, Harpy, Ork, Ogre];
  // 무작위로 클래스 선택
  const randomMonsterInstance = monsterClasses[Math.floor(Math.random() * monsterClasses.length)];

  // 선택된 클래스의 인스턴스 생성
  return new randomMonsterInstance(player);
}

export { Monster, Slime, Harpy, Ork, Ogre, Boss, makeRandomMonster };
