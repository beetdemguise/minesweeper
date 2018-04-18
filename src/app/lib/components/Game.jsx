import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import Field from './Field';
import Input from './Input';


export default class Game extends Component {
  static propTypes = {
    density: PropTypes.number,
    height: PropTypes.number,
    width: PropTypes.number,
  };
  static defaultProps = {
    density: .25,
    height: 15,
    width: 15,
  };

  constructor(props) {
    super(props);

    this.state = {
      settings: {
        density: this.props.density,
        height: this.props.height,
        width: this.props.width,
      },
      staging: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      settings: {
        density: nextProps.density,
        height: nextProps.height,
        width: nextProps.width,
      },
      staging: {}
    });
  }

  hasStagedChanges() {
    return !isEmpty(this.state.staging);
  }

  stageUpdate(key, value) {
    this.setState({
      staging: {...this.state.staging, [key]: Number(value)}
    });
  }

  updateDimensions() {
    const { staging, settings } = this.state;

    this.setState({
      settings: {...settings, ...staging},
      staging: {},
    });
  }

  render() {
    const {
      settings: { height, width, density },
      staging: { density: uiDensity, height: uiHeight, width: uiWidth },
    } = this.state;

    return (
      <div className="game">
        <div className="controls">
          <Input label="Height"
                 value={uiHeight || height}
                 onChange={(event) => this.stageUpdate('height', event.target.value)}
          />
          <Input label="Width"
                 value={uiWidth || width}
                 onChange={(event) => this.stageUpdate('width', event.target.value)}
          />
          <Input label="Density"
                 value={uiDensity || density}
                 onChange={(event) => this.stageUpdate('density', event.target.value)}
          />
          <button disabled={!this.hasStagedChanges()}
                  onClick={() => this.updateDimensions()}>Update</button>
        </div>
        <div className="game-board">
          <Field height={height} width={width} density={density}/>
        </div>
      </div>
    );
  }
}
