import React, { Component } from 'react';
import { flatten, range, zip } from 'lodash';
import seedrandom from 'seedrandom';

import DigitalNumber from './DigitalNumber';
import FaceButton from './FaceButton';
import Field from './Field';

import { generateSeed, getRandomInRange } from '../utils/general';
import { coordsToKey, getNeighbors } from '../utils/cells';


const DIFFICULTIES = zip(
  ['beginner', 'intermediate', 'expert', 'super-expert'],
  [8, 16, 24, 24],
  [8, 16, 30, 30],
  [10, 40, 99, 200],
).reduce((hash, [key, height, width, bombCount]) =>
  ({ ...hash, [key]: { height, width, bombCount } }), {});


const contains = (set, x, y) => set.has(coordsToKey(x, y));

export default class Game extends Component {
  constructor(props) {
    super(props);

    this.state = this.getInitialState('beginner');
  }

  getInitialState(difficulty) {
    const difficultyToSave = difficulty || this.state.difficulty;
    const dimensions = DIFFICULTIES[difficultyToSave];
    const { height, width } = dimensions;

    const field = {
      bombs: new Set(),
      flags: new Set(),
      hidden: new Set(flatten(range(height).map(x => range(width).map(y => coordsToKey(x, y))))),
    };

    const seed = generateSeed();

    this.stopTimer();
    return {
      counts: {},
      difficulty: difficultyToSave,
      dimensions,
      field,
      isMouseDown: false,
      killer: undefined,
      rng: seedrandom(seed),
      seed,
      timer: 0,
      won: false,
    };
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  getDifficulty() {
    return DIFFICULTIES[this.state.difficulty];
  }

  changeDifficulty(difficulty) {
    this.setState(this.getInitialState(difficulty));
  }

  die(x, y) {
    const { field } = this.state;
    const { bombs, flags } = field;

    const hidden = new Set([...field.hidden].filter(key => !bombs.has(key) || flags.has(key)));

    this.stopTimer();
    this.setState({ killer: coordsToKey(x, y), field: { ...field, hidden } });
  }

  floodFill(args) {
    const { counts, dimensions: { height, width }, field } = this.state;
    const { flags, hidden } = field;
    const { bombs = field.bombs } = args;

    const visible = new Set();
    const newCounts = new Set();
    const show = (x, y, force) => {
      const key = coordsToKey(x, y);

      if ((visible.has(key) || !hidden.has(key) || flags.has(key)) && !force) {
        return;
      }

      visible.add(key);

      // Calculate number of bombs touching this cell.
      const neighbors = getNeighbors(x, y, height, width);
      const count = neighbors
        .filter(({ x: neighborX, y: neighborY }) => bombs.has(coordsToKey(neighborX, neighborY))).length;

      newCounts[key] = count;

      if (!count || force) {
        neighbors.forEach(({ x: neighborX, y: neighborY }) => {
          if (!bombs.has(coordsToKey(neighborX, neighborY))) {
            show(neighborX, neighborY, false);
          }
        });
      }
    };

    show(args.x, args.y, args.force || false);

    this.setState({
      counts: {
        ...counts,
        ...newCounts,
      },
      field: {
        ...field,
        bombs,
        hidden: new Set([...hidden].filter(key => !visible.has(key))),
      },
    });
  }

  isBomb(x, y) {
    return contains(this.state.field.bombs, x, y);
  }

  isFlagged(x, y) {
    return contains(this.state.field.flags, x, y);
  }

  isVisible(x, y) {
    return !contains(this.state.field.hidden, x, y);
  }

  handleClickEvent(event, x, y) {
    event.preventDefault();

    if (!!this.state.killer || this.state.won) {
      return;
    }

    if (!this.interval) {
      this.startTimer();
    }

    if (event.type === 'dblclick') {
      this.handleDoubleClick(x, y);
    } else if (event.type === 'click') {
      this.handleLeftClick(x, y);
    } else {
      this.handleRightClick(x, y);
    }

    window.setTimeout(() => {
      this.checkForFinish();
    }, 0);
  }

  handleDoubleClick(x, y) {
    if (!this.isVisible(x, y) || this.isFlagged(x, y)) {
      return;
    }

    const {
      counts,
      dimensions: {
        height,
        width,
      },
    } = this.state;

    const neighbors = getNeighbors(x, y, height, width);
    const currentCount = counts[coordsToKey(x, y)];
    const unflaggedBombs = neighbors.reduce((count, { x: neighborX, y: neighborY }) => {
      const neighborDeccrement = (1 * this.isFlagged(neighborX, neighborY));
      return count - neighborDeccrement;
    }, currentCount);

    // If they haven't flagged exactly the number of bombs around this cell, ignore.
    if (unflaggedBombs) {
      return;
    }

    // If they _did_ flag enough spaces but there was a bomb unflagged die.
    const killers = neighbors.filter(({ x: neighborX, y: neighborY }) => {
      const isBomb = this.isBomb(neighborX, neighborY);
      const isFlagged = this.isFlagged(neighborX, neighborY);

      return isBomb && !isFlagged;
    });

    if (killers.length) {
      const { x: killerX, y: killerY } = killers[0];
      this.die(killerX, killerY);
      return;
    }

    this.floodFill({ x, y, force: true });
  }

  handleLeftClick(x, y) {
    if (this.isVisible(x, y) || this.isFlagged(x, y)) {
      return;
    }

    const { field } = this.state;
    let { bombs } = field;

    if (!bombs.size) {
      bombs = this.populateFieldAroundCell(x, y);
    }

    if (this.isBomb(x, y)) {
      this.die(x, y);
      return;
    }

    this.floodFill({ x, y, bombs });
  }

  handleMouseEvent(event, direction) {
    if (event.button === 0) {
      this.setState({ isMouseDown: direction === 'down' });
    }
  }

  handleRightClick(x, y) {
    if (!(coordsToKey(x, y) in this.state.counts)) {
      this.toggleFlag(x, y);
    }
  }

  populateFieldAroundCell(x, y) {
    const {
      dimensions: {
        bombCount,
      },
      field,
      rng,
    } = this.state;

    const bombs = new Set();
    const chooseFrom = (choices) => {
      const index = getRandomInRange(0, choices.length, rng);

      bombs.add(choices[index]);
      if (bombs.size !== bombCount) {
        chooseFrom(choices.filter((_, i) => i !== index));
      }
    };

    chooseFrom([...field.hidden].filter(key => key !== coordsToKey(x, y)));

    this.setState({ field: { ...field, bombs } });

    return bombs;
  }

  reset() {
    this.setState(this.getInitialState());
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

  toggleFlag(x, y) {
    const { field } = this.state;
    const flags = new Set(field.flags);
    const key = coordsToKey(x, y);

    if (flags.has(key)) {
      flags.delete(key);
    } else {
      flags.add(key);
    }

    this.setState({
      field: {
        ...field,
        flags,
      },
    });
  }

  checkForFinish() {
    const { dimensions: { bombCount }, field } = this.state;
    const { flags, hidden } = field;

    const hiddenButNotFlagged = new Set([...hidden].filter(key => !flags.has(key)));

    if (!hiddenButNotFlagged.size || (hiddenButNotFlagged.size + flags.size === bombCount)) {
      this.stopTimer();
      this.setState({
        field: {
          ...field,
          flags: new Set([...flags, ...hiddenButNotFlagged]),
        },
        won: true,
      });
    }
  }

  render() {
    const {
      counts,
      difficulty,
      dimensions: {
        bombCount,
        height,
        width,
      },
      field: {
        bombs,
        flags,
        hidden,
      },
      killer,
      isMouseDown,
      seed,
      timer,
      won,
    } = this.state;

    return (
      <div>
        <div className="difficulties">
          {Object.keys(DIFFICULTIES).map(key => (
            <span key={key}>
              <input
                type="radio"
                checked={difficulty === key}
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
              died={killer !== undefined}
              won={won}
            />
            <DigitalNumber value={bombCount - flags.size} digits={3} />
            <span>{seed}</span>
          </div>
          <div className="game-board">
            <Field
              height={height}
              width={width}
              counts={counts}
              bombs={bombs}
              flags={flags}
              hidden={hidden}
              killer={killer}
              onMouseDown={event => this.handleMouseEvent(event, 'down')}
              onMouseUp={event => this.handleMouseEvent(event, 'up')}
              onUpdate={(event, x, y) => this.handleClickEvent(event, x, y)}
            />
          </div>
        </div>
      </div>
    );
  }
}
