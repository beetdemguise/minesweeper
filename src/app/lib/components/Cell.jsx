import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getWordFromNumber } from '../utils';


export default function Square({
  onClick,
  onMouseDown,
  onMouseUp,
  source,
}) {
  const classes = classNames('square', {
    bomb: source.wrong
      || source.causedDeath
      || (source.isVisible() && source.isBomb() && !source.isFlagged()),
    cod: source.causedDeath,
    flagged: source.isFlagged(),
    hidden: !source.isVisible(),
    wrong: source.wrong,
    [getWordFromNumber(source.value)]: source.isVisible(),
  });

  return (
    <button
      className={classes}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onContextMenu={onClick}
      onDoubleClick={onClick}
    >
      {source.getValue()}
    </button>
  );
}

Square.propTypes = {
  onClick: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  source: PropTypes.shape({
    getValue: PropTypes.func.isRequired,
    isVisible: PropTypes.func.isRequired,
  }).isRequired,
};

class CellData {
  constructor(index, height, width) {
    this.height = height;
    this.width = width;

    this.index = index;

    this.x = Math.floor(index / width);
    this.y = index % width;

    this.value = '';
    this.visible = false;
    this.flagged = false;

    this.causedDeath = false;
    this.wrong = false;
  }

  getNeighbors() {
    const range = [-1, 0, 1];

    return range.reduce((array, dx) =>
      [...array, ...range.reduce((neighbors, dy) => {
        if (dx || dy) {
          const x = this.x + dx;
          const y = this.y + dy;

          if (x >= 0 && y >= 0 && x < this.height && y < this.width) {
            return [...neighbors, this.toIndex(x, y)];
          }
        }

        return neighbors;
      }, [])], []);
  }

  getValue() {
    if (this.wrong) {
      return 'X';
    }

    if (!this.isVisible() || this.isFlagged() || this.isBomb()) {
      return '';
    }

    return this.value;
  }

  isBomb() {
    return this.value === 'B';
  }

  isEmpty() {
    return this.value === '';
  }

  isFlagged() {
    return this.flagged;
  }

  isVisible() {
    return this.visible;
  }

  markAsCauseOfDeath() {
    this.causedDeath = true;
  }

  markAsIncorrectlyFlagged() {
    this.wrong = true;
  }

  setValue(value) {
    this.value = value;
  }

  show() {
    this.visible = true;
  }

  toggleFlag() {
    if (this.isVisible() && !this.isFlagged()) {
      return;
    }

    this.flagged = !this.flagged;
  }

  toIndex(x, y) {
    return (this.width * x) + y;
  }
}

export { CellData };
