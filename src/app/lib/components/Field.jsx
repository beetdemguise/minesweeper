import React from 'react';
import PropTypes from 'prop-types';
import { range } from 'lodash';

import Cell from './Cell';

import { coordsToKey } from '../utils/cells';


export default function Field({
  height,
  width,
  bombs,
  counts,
  flags,
  hidden,
  killer,
  onMouseDown,
  onMouseUp,
  onUpdate,
}) {
  const field = range(height).map(x => range(width).map((y) => {
    const key = coordsToKey(x, y);
    const isBomb = bombs.has(key);
    const isFlagged = flags.has(key);

    return (
      <Cell
        key={key}
        isBomb={bombs.has(key)}
        isFlagged={flags.has(key)}
        isHidden={hidden.has(key)}
        onClick={event => onUpdate(event, x, y)}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        value={counts[key]}
        wasIncorrectlyFlagged={!!killer && isFlagged && !isBomb}
        wasKiller={key === killer}
      />
    );
  }));

  return (
    <div>
      {field.map((children, row) =>
        (
          /* eslint-disable react/no-array-index-key */
          <div key={row} className="board-row">
            {children}
          </div>
          /* eslint- react/no-array-index-key */
        ))}
    </div>
  );
}

Field.propTypes = {
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  bombs: PropTypes.instanceOf(Set).isRequired,
  /* eslint-disable react/forbid-prop-types */
  counts: PropTypes.object.isRequired,
  /* eslint-enable react/forbid-prop-types */
  flags: PropTypes.instanceOf(Set).isRequired,
  hidden: PropTypes.instanceOf(Set).isRequired,
  killer: PropTypes.string,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

Field.defaultProps = {
  killer: undefined,
};
