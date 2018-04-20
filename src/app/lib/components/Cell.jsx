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
  const classes = classNames('square', source.getClass(), {
    hidden: !source.isVisible(),
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

  getClass() {
    if (this.isFlagged()) {
      return 'flagged hidden';
    }

    if (!this.isVisible()) {
      return '';
    }

    if (this.isBomb()) {
      return 'bomb';
    }

    return getWordFromNumber(this.value);
  }

  getValue() {
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
    this.visible = !this.visible;
  }

  toIndex(x, y) {
    return (this.width * x) + y;
  }
}

export { CellData };
