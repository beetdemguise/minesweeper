import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty, omit, pick } from 'lodash';

import Field from './Field';
import Input from './Input';


export default class Game extends Component {
  static propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
  };
  static defaultProps = {
    height: 5,
    width: 5,
  };

  constructor(props) {
    super(props);

    this.state = {
      settings: {
        height: this.props.height,
        width: this.props.width,
      },
      staging: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      settings: {
        height: nextProps.height,
        width: nextProps.width,
      },
      staging: {}
    });
  }

  hasStagedChanges() {
    return !isEmpty(this.state.staging);
  }

  stageHeightUpdate(value) {
    this.setState({
      staging: {...this.state.staging, height: Number(value)}
    });
  }

  stageWidthUpdate(value) {
    this.setState({
      staging: {...this.state.staging, width: Number(value)}
    });
  }

  updateDimensions() {
    const { staging, settings } = this.state;

    this.setState({
      settings: {...settings, ...pick(staging, 'height', 'width') },
      staging: omit(staging, 'height', 'width'),
    });
  }

  render() {
    const {
      settings: { height, width },
      staging: { height: uiHeight, width: uiWidth },
    } = this.state;

    return (
      <div className="game">
        <div className="controls">
          <Input label="Height"
                 value={uiHeight || height}
                 onChange={(event) => this.stageHeightUpdate(event.target.value)}
          />
          <Input label="Width"
                 value={uiWidth || width}
                 onChange={(event) => this.stageWidthUpdate(event.target.value)}
          />
          <button disabled={!this.hasStagedChanges()}
                  onClick={() => this.updateDimensions()}>Update</button>
        </div>
        <div className="game-board">
          <Field height={height} width={width}/>
        </div>
      </div>
    );
  }
}
