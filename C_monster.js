import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage, setBattleText } from './logs.js';

class Monster {
  constructor(stage, name, threat) {
    this.name = name;
    this.hp = Math.round(150 + 50 * stage);
    this.attackDmg = Math.round(15 + 10 * stage);
    this.isIgnited = false;
    this.igniteStack = 0;
    this.threat = threat;
    this.isElite = false;
  }

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
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
  constructor(stage) {
    // stage, name, threat
    super(stage, '킹슬라임', '뽀잉! 뽀잉!');
  }
}
class Skelleton extends Monster {
  constructor(stage) {
    // stage, name, threat
    super(stage, '눈이 파란 해골', 'WA! 샌즈 아시는구나!');
  }
}
class Harpy extends Monster {
  constructor(stage) {
    super(stage, '높은 바위 하피', '깃털 총공격!');
  }
}
class Ork extends Monster {
  constructor(stage) {
    super(stage, '렉사르', '사냥을 시작하지! 네놈을 추격해주마!');
  }
}
class Ogre extends Monster {
  constructor(stage) {
    super(stage, '오우거 마법사', '준비됐어! 난 아직인데?');
  }
}
// 얘네들로 랜덤 뽑기.
// 3, 6, 9 턴은 isElite = true;

class Boss extends Monster {
  constructor(stage) {
    super(stage, '만물의 종결자', '너흰 아직 준비가 안 되었다!');
  }
}

export { Monster };
