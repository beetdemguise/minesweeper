import React, { Component } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { reverse, zip } from 'lodash';

import { getWordFromNumber } from '../utils';
import '../../stylesheets/digital';


export default class DigitalNumber extends Component {
  static propTypes = {
    digits: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  render() {
    const { digits, value } = this.props;

    const uiValue = value.toString().padStart(digits, ' ');
    return (
      <div className="digital-number">
        {zip(Array(digits).keys(), uiValue.split('')).map(([digit], index) => {
          const class_ = digit !== ' ' ? getWordFromNumber(Number(digit)) : '';

          return (
            <span key={index} className={`digit ${class_}`}></span>
          );
        })}
      </div>
    );
  }
}
