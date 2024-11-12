import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage, setBattleText } from './logs.js';

class Monster {
  constructor(name, threat, player) {
    this.name = name;
    if (player.isBossStage) {
      this.hp = Math.round(200 + ((80 * player.stage) / 2) * player.difficulty);
      this.attackDmg = Math.round(30 * player.stage * player.difficulty);
    } else if (player.isEliteStage) {
      this.hp = Math.round(150 + ((60 * player.stage) / 2) * player.difficulty);
      this.attackDmg = Math.round(20 * player.stage * player.difficulty);
    } else {
      this.hp = Math.round(100 + ((50 * player.stage) / 2) * player.difficulty);
      this.attackDmg = Math.round(10 * player.stage * player.difficulty);
    }
    this.isIgnited = false;
    this.igniteStack = 0;
    this.threat = threat;
  }

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
    this.attackDmg += player.difficulty;
  }
  monsterLoseHpByCard(player, playingCard, cardPower = 1) {
    if (player.blessing === 'Spike Defender') {
      if (player.defense > 0) {
        this.hp -= Math.round(playingCard.attackDmg * cardPower + player.spikeDmg);
        setBattleText(`몬스터에게 ${player.spikeDmg}만큼의 가시 데미지를 주었습니다.`);
      } else {
        this.hp -= Math.round(playingCard.attackDmg * cardPower);
        setBattleText('');
      }
    } else if (player.blessing === 'Berserker') {
      let randomValue = Math.random() * 100;
      // 공격 횟수는 플레이어의 최대 공격 횟수 이하의 범위에서 랜덤하게 정한다. 단, 최솟값은 1 이상.
      let attackCount = Math.floor(Math.random() * player.maxAttackCount) + 1;
      if (player.multiAttackProb >= randomValue) {
        for (let i = 0; i < attackCount; i++) {
          // 위에서 계산된 공격 횟수만큼 공격한다.
          this.hp -= Math.round(playingCard.attackDmg * cardPower);
        }
        if (attackCount >= 2) {
          setBattleText(`미쳐 날뛰고 있습니다. ${attackCount}회 연속 공격!`);
        } else {
          setBattleText('');
        }

        // 입힌 데미지만큼 회복
        player.hp += Math.round(playingCard.attackDmg * cardPower) * attackCount;
        if (player.hp >= player.maxHp) {
          player.hp = player.maxHp;
        }
      } else {
        this.hp -= Math.round(playingCard.attackDmg * cardPower);
        player.hp += Math.round(playingCard.attackDmg * cardPower);
        if (player.hp >= player.maxHp) {
          player.hp = player.maxHp;
        }
      }
    } else if (player.blessing === 'Chieftain') {
      this.hp -= Math.round(playingCard.fireDmg * cardPower);
      this.isIgnited = true;
    }
  }
  monsterLoseHpByIgnite(playingCard, cardPower = 1, player) {
    if (this.isIgnited && player.blessing === 'Chieftain') {
      this.igniteStack += playingCard.fireDmg * cardPower;
      this.hp -= this.igniteStack;
      this.igniteStack--;
      setBattleText(`적이 불에 타오르고 있습니다.`);
    }
  }
}

class Slime extends Monster {
  constructor(player) {
    // name, threat, hp, attackDmg
    super('킹슬라임', '뽀잉! 뽀잉!', player);
  }
}
class Skelleton extends Monster {
  constructor(player) {
    super('눈이 파란 해골', 'WA! 샌즈 아시는구나!', player);
  }
}
class Harpy extends Monster {
  constructor(player) {
    super('높은 바위 하피', '깃털 총공격!', player);
  }
}
class Ork extends Monster {
  constructor(player) {
    super('렉사르', '사냥을 시작하지! 네놈을 추격해주마!', player);
  }
}
class Ogre extends Monster {
  constructor(player) {
    super('오우거 마법사', '준비됐어! 난 아직인데?', player);
  }
}
// 여기까지가 1~9스테이지 몬스터

class Boss extends Monster {
  constructor(player) {
    super('만물의 종결자', '너흰 아직 준비가 안 되었다!', player);
  }
} // 10스테이지는 마왕

// 몬스터의 인스턴스를 무작위로 생성하는 함수
function makeRandomMonster(player) {
  // 3, 6, 9 턴은 player.isEliteStage = true;
  player.isEliteStage = player.stage % 3 === 0;
  player.isBossStage = player.stage === 10;
  const monsterClasses = [Slime, Skelleton, Harpy, Ork, Ogre];
  // 무작위로 클래스 선택
  const randomMonsterInstance = monsterClasses[Math.floor(Math.random() * monsterClasses.length)];

  // 선택된 클래스의 인스턴스 생성
  return new randomMonsterInstance(player);
}

export { Monster, Slime, Skelleton, Harpy, Ork, Ogre, Boss, makeRandomMonster };
