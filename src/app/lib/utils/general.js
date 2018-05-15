const NUMBER_NAMES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];


function generateSeed() {
  return Math.random().toString(16).replace(/^0\./, '');
}

function getRandomInRange(min, max, func) {
  return Math.floor(((func || Math.random)() * (max - min)) + min);
}

function getWordFromNumber(digit) {
  return NUMBER_NAMES[Number(digit)];
}


export { generateSeed, getRandomInRange, getWordFromNumber };
