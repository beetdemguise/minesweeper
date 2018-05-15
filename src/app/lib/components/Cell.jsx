import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { getWordFromNumber } from '../utils/general';


export default function Square({
  isBomb,
  isFlagged,
  isHidden,
  onClick,
  onMouseDown,
  onMouseUp,
  value,
  wasIncorrectlyFlagged,
  wasKiller,
}) {
  const classes = classNames('square', {
    bomb: isBomb && !isHidden,
    cod: wasKiller,
    flagged: isFlagged,
    hidden: isHidden,
    wrong: wasIncorrectlyFlagged,
    [getWordFromNumber(value)]: !isHidden,
  });

  return (
    <button
      className={classes}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onContextMenu={onClick}
      onDoubleClick={onClick}
    >
      {value || ''}
    </button>
  );
}

Square.propTypes = {
  isBomb: PropTypes.bool.isRequired,
  isFlagged: PropTypes.bool.isRequired,
  isHidden: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
  onMouseUp: PropTypes.func.isRequired,
  value: PropTypes.number,
  wasIncorrectlyFlagged: PropTypes.bool.isRequired,
  wasKiller: PropTypes.bool.isRequired,
};

Square.defaultProps = {
  value: 0,
};
