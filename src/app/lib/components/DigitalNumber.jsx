import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { zip } from 'lodash';

import { getWordFromNumber } from '../utils';
import '../../stylesheets/digital.scss';


export default function DigitalNumber({ digits, value }) {
  const uiValue = value.toString().padStart(digits, ' ');

  return (
    <div className="digital-number">
      {zip(Array(digits).keys(), uiValue.split('')).map(([digit], index) => {
        const classes = classNames('digit', {
          [getWordFromNumber(Number(digit))]: digit !== ' ',
        });

        /* eslint-disable react/no-array-index-key */
        return (
          <span key={index} className={classes} />
        );
        /* eslint-enable react/no-array-index-key */
      })}
    </div>
  );
}

DigitalNumber.propTypes = {
  digits: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
