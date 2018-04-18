import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import { CellData } from './Cell';
import Field from './Field';
import Input from './Input';

import { getRandomInRange, resolveCoordinates } from '../utils';


export default class Game extends Component {
  static propTypes = {
    density: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  };
  static defaultProps = {
    density: .25,
    height: 15,
    width: 15,
  };

  constructor(props) {
    super(props);

    this.state = {
      field: this.generateField(this.props),
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
      populated: false,
      settings: {
        density: nextProps.density,
        height: nextProps.height,
        width: nextProps.width,
      },
      staging: {}
    });
  }

  floodFill(field, cell) {
    if (cell.isVisible()) {
      return;
    }

    field[cell.index].visible = true;

    // Calculate number of bombs touching this cell.
    let count = 0;
    for(let { x, y } of cell.getNeighbors()) {
      const neighbor = field[resolveCoordinates(x, y, this.props.width)];

      if (neighbor.isBomb()) {
        count++;
      }
    }

    if (count) {
      cell.value = count.toString();
    }

    if (cell.isEmpty()) {
      for(let { x, y } of cell.getNeighbors(true)) {
        const neighbor = field[resolveCoordinates(x, y, this.props.width)];

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

  handleFieldUpdate(cell) {
    const field = this.state.field.slice();
    if (!this.state.populated) {
      this.populateFieldAroundCell(field, cell);
    }

    if (cell.isBomb()) {
      field.map((cell) => cell.visible = cell.isBomb() || cell.isVisible());
    } else {
      this.floodFill(field, cell);
    }

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
        </div>
        <div className="game-board">
          <Field field={field} onUpdate={(cell) => this.handleFieldUpdate(cell)}/>
        </div>
      </div>
    );
  }
}
