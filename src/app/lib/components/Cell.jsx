import React, { Component } from 'react';

import Cell from './Cell.jsx';


export default class Square extends Component {
  render() {
    const { onClick, source } = this.props;

    return (
      <button className="square" onClick={onClick}>
      {source.isVisible() ? source.value : ''}
      </button>
    );
  }
}

class CellData {
  constructor(index, cols) {
    this.index = index;

    this.x = Math.floor(index / cols);
    this.y = index % cols;

    this.value = '';
    this.visible = false;
  }

  isEmpty() {
    return this.value === '';
  }

  isVisible() {
    return this.visible;
  }
}

export { CellData };
