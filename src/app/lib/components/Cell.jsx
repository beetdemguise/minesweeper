import React, { Component } from 'react';
import classNames from 'classnames';

import { getWordFromNumber } from '../utils';


export default class Square extends Component {
  render() {
    const { onClick, source } = this.props;
    const classes = classNames('square', source.getClass(), {
      hidden: !source.isVisible(),
    });

    return (
      <button className={classes}
              onClick={onClick}
              onContextMenu={onClick}
              onDoubleClick={onClick}
              >
      {source.getValue()}
      </button>
    );
  }
}

class CellData {
  constructor(index, height, width) {
    this._height = height;
    this._width = width;

    this.index = index;

    this.x = Math.floor(index / width);
    this.y = index % width;

    this.value = '';
    this.visible = false;
    this.flagged = false;
  }

  *getNeighbors(ignoreCorners=false) {
    const range = [-1, 0, 1];

    for(let dx of range) {
      for(let dy of range) {
        if (!dx && !dy) {
          continue;
        }

        const x = this.x + dx;
        const y = this.y + dy;

        if (x < 0 || y < 0 || x >= this._height || y >= this._width) {
          continue;
        }

        yield this.toIndex(x, y);
      }
    }
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

  isHidden() {
    return !this.isVisible() || this.isFlagged();
  }

  isVisible() {
    return this.visible;
  }

  toggleFlag() {
    if (this.isVisible() && !this.isFlagged()) {
      return;
    }

    this.flagged = !this.flagged;
    this.visible = !this.visible;
  }

  toIndex(x, y) {
    return this._width * x + y;
  }
}

export { CellData };
