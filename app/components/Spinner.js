// @flow
import React, { Component } from 'react';
import { PulseLoader } from 'halogen'

export default class Spinner extends Component {
  render() {
    // try change me to a custom color like "red" or "#000000"
    const color = '#357edd';

    return (
      <div className="flex flex-column justify-center items-center vh-100">
        <PulseLoader color={color}/>
        <p className="blue f3">Fun Message</p>
      </div>
    );
  }
}
