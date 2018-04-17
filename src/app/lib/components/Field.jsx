import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual, range } from 'lodash';

import Cell from './Cell.jsx';


export default class Field extends Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { field: this.generateField(this.props.height, this.props.width) };
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props, nextProps)) {
      const { height, width } = nextProps;

      this.setState({ field: this.generateField(height, width) });
    }
  }

  generateField(height, width) {
    return Array.from({ length: height }, (element) => {
      return Array.from({ length: width }, () => 'X');
    });
  }

  handleClick(i) {
    const squares = this.state.squares.slice();
    squares[i] = this.getPlayer();

    this.setState({ squares: squares, xIsNext: !this.state.xIsNext });
  }

  renderSquare(x, y) {
    return <Cell value={this.state.field[x][y]} />;
  }

  render() {
    const field = this.state.field.map((column, x) => {
      const children = column.map((row, y) => {
        return this.renderSquare(x, y);
      });

      return (
        <div className="board-row">
          {children}
        </div>
      );
    });

    return (
      <div>
        {field}
      </div>
    );
  }
}
