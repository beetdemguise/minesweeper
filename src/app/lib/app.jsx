import React, { Component } from 'react';

import Game from './components/Game';
import '../stylesheets/main';


export default class App extends Component {
  render() {
    return <Game height={10} width={10}/>;
  }
}
