import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage } from './logs.js';

class Monster {
  constructor(stage) {
    this.hp = Math.round(150 + 50 * stage);
    this.attackDmg = Math.round(15 + 10 * stage);
    this.isIgnited = false;
    this.igniteStack = 0;
  }

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
  }
  monsterLoseHpByCard(player, playingCard, cardPower = 1) {
    if (player.blessing === 'Spike Defender' && player.defense > 0) {
      this.hp -= Math.round(playingCard.attackDmg * cardPower + player.spikeDmg);
    } else if (player.blessing === 'Berserker') {
      let randomValue = Math.random() * 100;
      // 공격 횟수는 플레이어의 최대 공격 횟수 이하의 범위에서 랜덤하게 정한다. 단, 최솟값은 1 이상.
      let attackCount = Math.round(Math.random() * (player.maxAttackCount - 1) + 1);
      if (player.multiAttackProb >= randomValue) {
        for (let i = 0; i < attackCount; i++) {
          // 위에서 계산된 공격 횟수만큼 공격한다.
          this.hp -= Math.round(playingCard.attackDmg * cardPower);
        }
      } else {
        this.hp -= Math.round(playingCard.attackDmg * cardPower);
      }
    } else if (player.blessing === 'Chieftain') {
      this.hp -= Math.round((playingCard.attackDmg + playingCard.fireDmg) * cardPower);
      this.isIgnited = true;
    }
  }
  monsterLoseHpByIgnite(playingCard, cardPower = 1) {
    if (this.isIgnited) {
      this.igniteStack += playingCard.fireDmg * cardPower;
      this.hp -= this.igniteStack;
      this.igniteStack--;
    }
  }
}

export { Monster };
