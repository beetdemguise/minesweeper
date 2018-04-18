import React, { Component } from 'react';

import Cell from './Cell.jsx';


export default class Square extends Component {
  render() {
    const { onClick, source } = this.props;

    return (
      <button className={`square ${source.isVisible() ? '' : 'gray'}`}
              onClick={onClick}
              onContextMenu={onClick}
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

    this.x = Math.floor(index / height);
    this.y = index % height;

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

        if (ignoreCorners && Math.abs(dx) + Math.abs(dy) > 1) {
          continue;
        }

        const x = this.x + dx;
        const y = this.y + dy;

        if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
          continue;
        }

        yield { x, y };
      }
    }
  }

  getValue() {
    if (!this.isVisible()) {
      return '';
    }

    if (this.flagged) {
      return 'F';
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

  toggleFlag() {
    if (this.isVisible() && !this.isFlagged()) {
      return;
    }

    this.flagged = !this.flagged;
    this.visible = !this.visible;
  }
}

export { CellData };
