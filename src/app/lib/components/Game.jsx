import React, { Component } from 'react';
import { forEach, zip } from 'lodash';

import { CellData } from './Cell';
import DigitalNumber from './DigitalNumber';
import FaceButton from './FaceButton';
import Field from './Field';

import { getRandomInRange } from '../utils';


const DIFFICULTIES = zip(
  ['beginner', 'intermediate', 'expert', 'super-expert'],
  [8, 16, 24, 24],
  [8, 16, 30, 30],
  [10, 40, 99, 200],
).reduce((hash, [key, height, width, bombCount]) =>
  ({ ...hash, [key]: { height, width, bombCount } }), {});


function generateField(difficulty) {
  const { height, width } = DIFFICULTIES[difficulty];
  const length = height * width;

  return Array.from({ length }, (element, index) => new CellData(index, height, width));
}


export default class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      field: generateField('beginner'),
      died: false,
      won: false,
      difficulty: 'beginner',
      populated: false,
      flagCount: 0,
      timer: 0,
    };
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  getDifficulty() {
    return DIFFICULTIES[this.state.difficulty];
  }

  changeDifficulty(difficulty) {
    this.reset(difficulty);
  }

  die(field) {
    field.forEach((cell) => {
      if (cell.isBomb()) {
        cell.show();
      }
    });

    this.stopTimer();
    this.setState({ field, died: true });
  }

  floodFill(field, cell, force) {
    if (cell.isVisible() && !force) {
      return;
    }

    cell.show();

    // Calculate number of bombs touching this cell.
    const count = cell.getNeighbors().reduce((aggregate, index) => {
      const neighbor = field[index];

      if (neighbor.isBomb()) {
        return aggregate + 1;
      }

      return aggregate;
    }, 0);

    if (count) {
      cell.setValue(count.toString());
    }

    if (cell.isEmpty() || force) {
      cell.getNeighbors().forEach((index) => {
        const neighbor = field[index];

        if (!neighbor.isBomb()) {
          this.floodFill(field, neighbor);
        }
      });
    }
  }

  handleClickEvent(event, cell) {
    event.preventDefault();

    if (this.state.died || this.state.won) {
      return;
    }

    if (!this.interval) {
      this.startTimer();
    }

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

    const neighbors = cell.getNeighbors();
    const unflaggedBombs = neighbors
      .reduce((aggregate, index) => aggregate - (1 * field[index].isFlagged()), Number(cell.value));

    // If they haven't flagged exactly the number of bombs around this cell, ignore.
    if (unflaggedBombs) {
      return;
    }

    // If they _did_ flag enough spaces but there was a bomb unflagged die.
    if (neighbors.some(index => field[index].isBomb() && !field[index].isFlagged())) {
      this.die(field);
      return;
    }

    this.floodFill(field, field[cell.index], true);
    this.updateField(field);
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
      return;
    }

    this.floodFill(field, field[cell.index]);
    this.updateField(field);
  }

  handleMouseEvent(event, direction) {
    if (event.button === 0) {
      this.setState({ isMouseDown: direction === 'down' });
    }
  }

  handleRightClick(cell) {
    const field = this.state.field.slice();

    field[cell.index].toggleFlag();

    this.setState({
      field,
      flagCount: this.state.flagCount + (cell.isFlagged() ? 1 : -1),
    });
  }

  populateFieldAroundCell(field, start) {
    const { height, width, bombCount } = this.getDifficulty();
    const length = height * width;

    forEach(Array(bombCount), () => {
      while (true) {
        const index = getRandomInRange(0, length);
        if (index !== start.index) {
          const cell = field[index];

          if (cell.isEmpty()) {
            cell.value = 'B';
            return;
          }
        }
      }
    });

    this.setState({ populated: true });
  }

  reset(difficulty) {
    const difficultyToSave = difficulty || this.state.difficulty;

    this.stopTimer();
    this.setState({
      field: generateField(difficultyToSave),
      died: false,
      won: false,
      difficulty: difficultyToSave,
      populated: false,
      flagCount: 0,
      timer: 0,
    });
  }

  startTimer() {
    this.interval = window.setInterval(() => this.tick(), 1000);
  }

  stopTimer() {
    this.interval = window.clearInterval(this.interval);
  }

  tick() {
    this.setState({ timer: this.state.timer + 1 });
  }

  updateField(field) {
    const { bombCount } = this.getDifficulty();
    const hiddenCells = field.filter(cell => !cell.isVisible() || cell.isFlagged());

    if (hiddenCells.length === bombCount) {
      this.stopTimer();

      hiddenCells.forEach((cell) => {
        if (!cell.isFlagged()) {
          cell.toggleFlag();
        }
      });

      this.setState({ field, won: true, flagCount: bombCount });
    } else {
      this.setState({ field });
    }
  }


  render() {
    const {
      field,
      died,
      flagCount,
      isMouseDown,
      timer,
      won,
    } = this.state;
    const { bombCount } = this.getDifficulty();

    return (
      <div>
        <div className="difficulties">
          {Object.keys(DIFFICULTIES).map(key => (
            <span key={key}>
              <input
                type="radio"
                checked={this.state.difficulty === key}
                onChange={() => this.changeDifficulty(key)}
              />
              {key}
            </span>
          ))}
        </div>
        <div className="game">
          <div className="controls">
            <DigitalNumber value={timer} digits={3} />
            <FaceButton
              onClick={() => this.reset()}
              anxious={isMouseDown}
              died={died}
              won={won}
            />
            <DigitalNumber value={bombCount - flagCount} digits={3} />
          </div>
          <div className="game-board">
            <Field
              field={field}
              onMouseDown={event => this.handleMouseEvent(event, 'down')}
              onMouseUp={event => this.handleMouseEvent(event, 'up')}
              onUpdate={(event, cell) => this.handleClickEvent(event, cell)}
            />
          </div>
        </div>
      </div>
    );
  }
}
