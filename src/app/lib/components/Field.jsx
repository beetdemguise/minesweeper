import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual, range } from 'lodash';

import Cell, { CellData } from './Cell.jsx';


function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

export default class Field extends Component {
  static propTypes = {
    density: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { field: this.generateField(this.props) };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props, nextProps)) {
      this.setState({ field: this.generateField(nextProps) });
    }
  }

  floodFill(field, cell) {
    if (cell.isVisible()) {
      return;
    }

    field[cell.index].visible = true;

    if (cell.isBomb()) {
      return;
    }

    // Calculate number of bombs touching this cell.
    let count = 0;
    for(let { x, y } of cell.getNeighbors()) {
      const neighbor = field[this.resolveCoordinates(x, y)];
      if (neighbor.isBomb()) {
        count++;
      }
    }

    if (count) {
      cell.value = count.toString();
    }

    if (cell.isEmpty()) {
      for(let { x, y } of cell.getNeighbors(true)) {
        const neighbor = field[this.resolveCoordinates(x, y)];

        if (!neighbor.isBomb()) {
          this.floodFill(field, neighbor);
        }
      }
    }
  }

  generateField(props) {
    const { height, width, density } = props;

    const numCells = height * width;
    const field = Array.from({ length: numCells }, (element, index) => {
      return new CellData(index, height, width);
    });

    var numBombs = Math.ceil(numCells * density);
    while (numBombs--) {
      while (true) {
        const cell = field[getRandomInRange(0, numCells)];
        if (cell.isEmpty()) {
          cell.value = 'B';
          break;
        }
      }
    }

    return field;
  }

  handleCellClick(cell) {
    const field = this.state.field.slice();

    if (cell.isBomb()) {
      field.map((cell) => cell.visible = cell.isBomb() || cell.isVisible());
    } else {
      this.floodFill(field, cell);
    }

    this.setState({ field: field });
  }

  resolveCoordinates(x, y) {
    return this.props.height * x + y;
  }

  render() {
    const field = this.state.field.reduce((aggregate, cell) => {
      const ui = (
        <Cell key={cell.index} source={cell} onClick={() => this.handleCellClick(cell)}/>
      );

      if (aggregate.length <= cell.x) {
        return [...aggregate, [ui]];
      }

      const last = aggregate[aggregate.length - 1];
      return [...aggregate.slice(0, -1), [...last, ui]];
    }, []);

    return (
      <div>
        {field.map((children, row) => {
            return (
              <div key={row} className="board-row">
                {children}
              </div>
            );
        })}
      </div>
    );
  }
}
