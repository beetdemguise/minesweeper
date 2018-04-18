function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function resolveCoordinates(x, y, width) {
  return width * x + y;
}

export { getRandomInRange, resolveCoordinates }
