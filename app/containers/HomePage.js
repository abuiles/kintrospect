// @flow
import React, { Component } from 'react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { deepOrange500 } from 'material-ui/styles/colors';

import Home from '../components/Home';

const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500
  },
});

export default class HomePage extends Component {
  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Home />
      </MuiThemeProvider>
    );
  }
}
