import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import { CellData } from './Cell';
import Field from './Field';
import Input from './Input';

import { getRandomInRange } from '../utils';


export default class Game extends Component {
  static propTypes = {
    density: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  };
  static defaultProps = {
    density: .10,
    height: 15,
    width: 15,
  };

  static doubleClicked = false;

  constructor(props) {
    super(props);

    this.state = {
      field: this.generateField(this.props),
      died: false,
      populated: false,
      settings: {
        density: this.props.density,
        height: this.props.height,
        width: this.props.width,
      },
      staging: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      field: this.generateField(nextProps),
      died: false,
      populated: false,
      settings: {
        density: nextProps.density,
        height: nextProps.height,
        width: nextProps.width,
      },
      staging: {}
    });
  }

  die(field) {
    field.map((cell) => cell.visible = cell.isBomb() || cell.isVisible());
    this.setState({ died: true });
  }

  doFieldUpdate(type, cell) {
  }

  floodFill(field, cell, force) {
    if (cell.isVisible() && !force) {
      return;
    }

    field[cell.index].visible = true;

    // Calculate number of bombs touching this cell.
    let count = 0;
    for(let index of cell.getNeighbors()) {
      const neighbor = field[index];

      if (neighbor.isBomb()) {
        count++;
      }
    }

    if (count) {
      cell.value = count.toString();
    }

    if (cell.isEmpty() || force) {
      for(let index of cell.getNeighbors()) {
        const neighbor = field[index];

        if (!neighbor.isBomb()) {
          this.floodFill(field, neighbor);
        }
      }
    }
  }

  generateField(props) {
    const { height, width, density } = props;

    return Array.from({ length: height * width }, (element, index) => {
      return new CellData(index, height, width);
    });
  }

  handleClickEvent(event, cell) {
    event.preventDefault();

    if (event.type === 'dblclick') {
      this.handleDoubleClick(cell);
    } else if (event.type === 'click') {
      this.handleLeftClick(cell);
    } else {
      this.handleRightClick(cell);
    }
  }

  handleDoubleClick(cell) {
    if (!cell.isVisible() || cell.isFlagged()) {
      return;
    }

    const field = this.state.field.slice();

    let exploded = false;
    let count = Number(cell.value);
    for(let index of cell.getNeighbors()) {
      const neighbor = this.state.field[index];

      if (neighbor.isFlagged()) {
        count--;
        continue;
      }

      exploded = exploded || neighbor.isBomb();
    }

    // If they haven't flagged exactly the number of bombs around this cell, ignore.
    if (count !== 0) {
      return;
    }

    if (exploded) {
      this.die(field);
    } else {
      this.floodFill(field, cell, true);
      this.setState({ field: field });
    }
  }

  handleLeftClick(cell) {
    if (cell.isVisible()) {
      return;
    }

    const field = this.state.field.slice();
    if (!this.state.populated) {
      this.populateFieldAroundCell(field, cell);
    }

    if (cell.isBomb()) {
      this.die(field);
    } else {
      this.floodFill(field, cell);
    }

    this.setState({ field: field });
  }

  handleRightClick(cell) {
    const field = this.state.field.slice();
    field[cell.index].toggleFlag();
    this.setState({ field: field });
  }

  hasStagedChanges() {
    return !isEmpty(this.state.staging);
  }

  populateFieldAroundCell(field, start) {
    const { height, width, density } = this.props;
    const numCells = height * width;

    var numBombs = Math.ceil(numCells * density);
    while (numBombs--) {
      while (true) {
        const index = getRandomInRange(0, numCells);
        if (index == start.index) {
          continue;
        }

        const cell = field[index];
        if (cell.isEmpty()) {
          cell.value = 'B';
          break;
        }
      }
    }

    this.setState({ populated: true });
  }

  reset() {
    this.setState({
      field: this.generateField(this.props),
      died: false,
      populated: false,
    });
  }

  stageUpdate(key, value) {
    this.setState({
      staging: {...this.state.staging, [key]: Number(value)}
    });
  }

  updateDimensions() {
    const { staging, settings } = this.state;

    this.setState({
      settings: {...settings, ...staging},
      staging: {},
    });
  }

  render() {
    const {
      field,
      died,
      settings: { height, width, density },
      staging: { density: uiDensity, height: uiHeight, width: uiWidth },
    } = this.state;

    return (
      <div className="game">
        <div className="controls">
          <Input label="Height"
                 value={uiHeight || height}
                 onChange={(event) => this.stageUpdate('height', event.target.value)}
          />
          <Input label="Width"
                 value={uiWidth || width}
                 onChange={(event) => this.stageUpdate('width', event.target.value)}
          />
          <Input label="Density"
                 value={uiDensity || density}
                 onChange={(event) => this.stageUpdate('density', event.target.value)}
          />
          <button disabled={!this.hasStagedChanges()}
                  onClick={() => this.updateDimensions()}>Update</button>
          <button onClick={() => this.reset()}>{died ? 'Restart' : 'Reset'}</button>
        </div>
        <div className="game-board">
          <Field field={field}
                 onUpdate={(event, cell) => this.handleClickEvent(event, cell)}/>
        </div>
      </div>
    );
  }
}
