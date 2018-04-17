import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class Input extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    return (
      <div className="input">
        <span>{this.props.label}</span>
        <input type="number" value={this.props.value} onChange={this.props.onChange}/>
      </div>
    );
  }
}
