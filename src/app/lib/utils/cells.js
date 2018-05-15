function coordsToKey(x, y) {
  return x.toString().padLeft(2, '0') + y.toString().padLeft(2, '0');
}

function getNeighbors(x, y, height, width) {
  const range = [-1, 0, 1];

  return range.reduce((array, dx) =>
    [...array, ...range.reduce((neighbors, dy) => {
      if (dx || dy) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newY >= 0 && newX < height && newY < width) {
          return [...neighbors, { x: newX, y: newY }];
        }
      }

      return neighbors;
    }, [])], []);
}

export { coordsToKey, getNeighbors };
