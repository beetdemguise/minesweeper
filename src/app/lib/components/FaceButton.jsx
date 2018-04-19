import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import '../../stylesheets/facebutton';


export default class FaceButton extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    died: PropTypes.bool.isRequired,
    won: PropTypes.bool.isRequired,
  };

  render() {
    const classes = classNames('face', {
      died: this.props.died,
      won: this.props.won,
    });

    return (
      <a className={classes} onClick={this.props.onClick}></a>
    );
  }
}
