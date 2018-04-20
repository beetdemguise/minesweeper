const NUMBER_NAMES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];


function getRandomInRange(min, max) {
  return Math.floor((Math.random() * (max - min)) + min);
}

function getWordFromNumber(digit) {
  return NUMBER_NAMES[Number(digit)];
}


export { getRandomInRange, getWordFromNumber };
