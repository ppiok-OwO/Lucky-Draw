import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage, setBattleText } from './logs.js';

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

        // 입힌 데미지의 80퍼센트 만큼 회복
        player.hp += Math.round(playingCard.attackDmg * cardPower) * attackCount * 0.8;
        if (player.hp >= player.maxHp) {
          player.hp = player.maxHp;
        }
      } else {
        this.hp -= Math.round(playingCard.attackDmg * cardPower);
        player.hp += Math.round(playingCard.attackDmg * cardPower) * 0.8;
        if (player.hp >= player.maxHp) {
          player.hp = player.maxHp;
        }
      }
    } else if (player.blessing === 'Chieftain') {
      this.hp -= Math.round((playingCard.attackDmg + playingCard.fireDmg) * cardPower);
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

export { Monster };
