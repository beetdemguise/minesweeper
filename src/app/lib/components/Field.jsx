import React from 'react';
import PropTypes from 'prop-types';

import Cell from './Cell';


export default function Field({ field, onUpdate }) {
  const groupedField = field.reduce((aggregate, cell) => {
    const ui = (
      <Cell
        key={cell.index}
        source={cell}
        onClick={event => onUpdate(event, cell)}
      />
    );

    if (aggregate.length <= cell.x) {
      return [...aggregate, [ui]];
    }

    const last = aggregate[aggregate.length - 1];
    return [...aggregate.slice(0, -1), [...last, ui]];
  }, []);

  return (
    <div>
      {groupedField.map((children, row) =>
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
  field: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
  })).isRequired,
  onUpdate: PropTypes.func.isRequired,
};
