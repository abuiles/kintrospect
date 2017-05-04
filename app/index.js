import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import injectTapEventPlugin from 'react-tap-event-plugin';

import Root from './containers/Root';
import './app.global.css';

injectTapEventPlugin();

render(
  <AppContainer>
    <Root />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root') // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot />
      </AppContainer>,
      document.getElementById('root')
    )
  })
}
