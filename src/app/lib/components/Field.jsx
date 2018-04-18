import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEqual, range } from 'lodash';

import Cell, { CellData } from './Cell.jsx';


export default class Field extends Component {
  static propTypes = {
    field: PropTypes.array.isRequired,
    onUpdate: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = { populated: false };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ populated: false });
  }

  render() {
    const field = this.props.field.reduce((aggregate, cell) => {
      const ui = (
        <Cell key={cell.index}
              source={cell}
              onClick={(event) => this.props.onUpdate(event, cell)} />
      );

      if (aggregate.length <= cell.x) {
        return [...aggregate, [ui]];
      }

      const last = aggregate[aggregate.length - 1];
      return [...aggregate.slice(0, -1), [...last, ui]];
    }, []);

    return (
      <div>
        {field.map((children, row) => {
            return (
              <div key={row} className="board-row">
                {children}
              </div>
            );
        })}
      </div>
    );
  }
}
