import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import { displayStatus, setMessage } from './logs.js';

class Card {
  constructor(cardName, cardTier, actProb, attackDmg, spellDmg, restoreHp, defense) {
    this._cardName = cardName;
    this._actProb = actProb;
    this._cardTier = cardTier;
    this._isThisCardPlayed = false;
    this._attackDmg = attackDmg;
    this._spellDmg = spellDmg;
    this._restoreHp = restoreHp;
    this._defense = defense;
    this._isThisDrawCard = false;
  }

  set cardName(value) {
    this._cardName = value;
  }

  set cardTier(value) {
    this._cardTier = value;
  }

  set attackDmg(value) {
    this._attackDmg = value;
  }

  set spellDmg(value) {
    this._spellDmg = value;
  }

  set restoreHp(value) {
    this._srestoreHp = value;
  }

  set defense(value) {
    this._defense = value;
  }

  get cardName() {
    return this._cardName;
  }

  get cardTier() {
    return this._cardTier;
  }

  get attackDmg() {
    return this._attackDmg;
  }

  get spellDmg() {
    return this._spellDmg;
  }

  get restoreHp() {
    return this._srestoreHp;
  }

  get defense() {
    return this._defense;
  }
}

class NormalAttackCard extends Card {
  constructor(name) {
    // cardName, cardTier, actProb, attackDmg, spellDmg, restoreHp, defense
    super(name, 'Normal', 75, 10, 0, 0, 0);
  }
}

class RareAttackCard extends Card {
  constructor(name) {
    super(name, 'Rare', 80, 15, 5, 5, 0);
  }
}

class EpicAttackCard extends Card {
  constructor(name) {
    super(name, 'Epic', 85, 25, 0, 0, 10);
  }
}

class LegendaryAttackCard extends Card {
  constructor(name) {
    super(name, 'Legendary', 90, 20, 25, 10, 10);
  }
}

class NormalDefenseCard extends Card {
  constructor(name) {
    super(name, 'Normal', 75, 0, 0, 20, 20);
  }
}

class RareDefenseCard extends Card {
  constructor(name) {
    super(name, 'Rare', 80, 0, 0, 30, 30);
  }
}

class EpicDefenseCard extends Card {
  constructor(name) {
    super(name, 'Epic', 85, 0, 0, 30, 45);
  }
}

class LegendaryDefenseCard extends Card {
  constructor(name) {
    super(name, 'Legendary', 90, 0, 0, 100, 60);
  }
}

export {
  Card,
  NormalAttackCard,
  NormalDefenseCard,
  RareAttackCard,
  RareDefenseCard,
  EpicAttackCard,
  EpicDefenseCard,
  LegendaryAttackCard,
  LegendaryDefenseCard,
};
