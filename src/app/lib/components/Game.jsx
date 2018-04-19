import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, zip } from 'lodash';

import { CellData } from './Cell';
import DigitalNumber from './DigitalNumber';
import FaceButton from './FaceButton';
import Field from './Field';
import Input from './Input';

import { getRandomInRange } from '../utils';


const DIFFICULTIES = zip(
  ['beginner', 'intermediate', 'expert', 'super-expert'],
  [8, 16, 24, 24],
  [8, 16, 30, 30],
  [10, 40, 99, 200]
).reduce(
  (hash, [key, height, width, bombCount]) => {
    return {...hash, [key]: { height, width, bombCount }};
  },
{});


export default class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      field: this.generateField('beginner'),
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

  changeDifficulty(difficulty) {
    this.reset(difficulty);
  }

  die(field) {
    field.map((cell) => cell.visible = cell.isBomb() || cell.isVisible());
    this.stopTimer();
    this.setState({ field, died: true });
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

  generateField(difficulty) {
    const { height, width, bombCount } = DIFFICULTIES[difficulty];

    return Array.from({ length: height * width }, (element, index) => {
      return new CellData(index, height, width);
    });
  }

  getDifficulty() {
    return DIFFICULTIES[this.state.difficulty];
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
      return;
    }

    this.floodFill(field, cell, true);
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

    this.floodFill(field, cell);
    this.updateField(field);
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
    const difficulty = this.getDifficulty();
    const { height, width } = difficulty;
    const numCells = height * width;
    let { bombCount } = difficulty;

    while (bombCount--) {
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

  reset(difficulty) {
    const difficultyToSave = difficulty || this.state.difficulty;

    this.stopTimer();
    this.setState({
      field: this.generateField(difficultyToSave),
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
    this.setState({ timer: this.state.timer + 1});
  }

  updateField(field) {
    const { bombCount } = this.getDifficulty();
    const hiddenCells = field.filter(cell => !cell.isVisible() || cell.isFlagged());

    if (hiddenCells.length === bombCount) {
      this.stopTimer();

      hiddenCells.map(cell => {
        if (!cell.isFlagged()) {
          cell.toggleFlag();
        }
      });

      this.setState({ field, won: true, flagCount: bombCount });
    }
    else {
      this.setState({ field });
    }
  }


  render() {
    const {
      field,
      died,
      flagCount,
      timer,
      won,
    } = this.state;
    const { height, width, bombCount } = this.getDifficulty();

    return (
      <div>
        <div className="difficulties">
          {Object.keys(DIFFICULTIES).map(key => {
            return (
              <span key={key}>
                <input type="radio"
                       checked={this.state.difficulty === key}
                       onChange={() => this.changeDifficulty(key)}/>
                {key}
              </span>
            );
          })}
        </div>
        <div className="game">
          <div className="controls">
            <DigitalNumber value={timer} digits={3}/>
            <FaceButton onClick={() => this.reset()} died={died} won={won}/>
            <DigitalNumber value={bombCount - flagCount} digits={3}/>
          </div>
          <div className="game-board">
            <Field field={field}
                   onUpdate={(event, cell) => this.handleClickEvent(event, cell)}/>
          </div>
        </div>
      </div>
    );
  }
}
