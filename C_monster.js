import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage } from './logs.js';

class Monster {
  constructor(stage) {
    this.hp = 150 + 50 * (stage / 2);
    this.attackDmg = 10 + 10 * (stage / 2);
  }

  monsterAttack(player) {
    // 몬스터의 공격
    player.updateHpByMonster(-this.attackDmg);
    player.updateDefenseByMonster(-this.attackDmg);
  }
  monsterLoseHp(playingCard, cardPower = 1) {
    if (playingCard.attackDmg >= 0 && playingCard.spellDmg >= 0) {
      this.hp -= (playingCard.attackDmg + playingCard.spellDmg) * cardPower;
    }
  }
}

export { Monster };
