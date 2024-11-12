import chalk from 'chalk';

//#region 색상 지정
const colors = {
  grey: (str) => chalk.hex('#BACDDB')(`${str}`),
  danger: (str) => chalk.red.bold(`${str}`),
  elite: (str) => chalk.hex('#D67BFF').bold(`${str}`),
  green1: (str) => chalk.hex('#D2FF72').bold(`${str}`),
  green2: (str) => chalk.hex('#73EC8B').bold(`${str}`),
  green3: (str) => chalk.hex('#15B392').bold(`${str}`),
  green4: (str) => chalk.hex('#347928').bold(`${str}`),
  monster: (str) => chalk.hex('#F31559').bold(`${str}`),
  warning: (str) => chalk.yellow(`${str}`),
  info: (str) => chalk.hex('#EEE2DE').italic(`${str}`),
  message: (str) => chalk.hex('#EA906C')(`${str}`),
  battleLog: (str) => chalk.hex('#B31312').bold(`${str}`),
  cardChoice: (str) => chalk.hex('#E8B86D')(`${str}`),
  monsterDebuff: (str) => chalk.hex('#FFCFB3')(`${str}`),
};
//#endregion

export { colors };
