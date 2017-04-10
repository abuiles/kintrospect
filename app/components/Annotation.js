// @flow
import React from 'react';

import {
  Card,
  CardTitle,
  CardText
} from 'material-ui/Card';

import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';

export class AnnotationObject {
  type: string;
  name: string;
  highlight: string;
  location: number;
  timestamp: number;
  asin: string;
  annotations: Array<AnnotationObject>;
  startLocation: number;

  constructor(payload) {
    this.highlight = payload.highlight;
    this.location = payload.location;
    this.timestamp = payload.timestamp;
    this.name = payload.name;
    this.type = payload.type;
    this.annotations = [];
    this.startLocation = 0;

    if (payload.asin) {
      this.asin = payload.asin;
    }

    if (payload.startLocation) {
      // https://www.amazon.com/forum/kindle/Tx2S4K44LSXEWRI?_encoding=UTF8&cdForum=Fx1D7SY3BVSESG
      this.location = Math.ceil(payload.startLocation / 150);
    }

    if (this.isChapter()) {
      this.annotations = payload.annotations.map((annotation) => new AnnotationObject(annotation));
    }
  }

  isChapter(): boolean {
    return this.type === 'chapter';
  }
}

// annotations
// annotations.type == 'chapter'
// annotation.name
// annotation.location
// annotation.annotations
// asin: asin,
// highlight: highlight,
// startLocation: startLocation,
// endLocation: endLocation,
// timestamp: timestamp,
// location: location

        // <div data-tid="container">
        //   {annotations.map((annotation) =>
        //     <Annotation
        //       annotation={annotation}
        //       key={annotation.location || annotation.timestamp}
        //     />
        //   )}
        // </div>


export default class Annotation extends React.Component {
  props: {
    annotation: AnnotationObject
  }

  render() {
    let content;

    if (this.props.annotation.isChapter()) {
      content = (
        <div>
          <AppBar
            title={this.props.annotation.name}
            showMenuIconButton={false}
          />
          {this.props.annotation.annotations.map((annotation) =>
            <Annotation annotation={annotation} key={annotation.timestamp} />
          )}
        </div>
      );
    } else {
      const location = this.props.annotation.location;
      content = (
        <Card>
          <CardTitle>
            <a href={`kindle://book?action=open&asin=${this.props.annotation.asin}&location=${location}`}>
              Read more at location {location}
            </a>;
          </CardTitle>
          <CardText>
            {this.props.annotation.highlight}
            <TextField
              floatingLabelText="Your notes"
              multiLine
              fullWidth
            />
          </CardText>
        </Card>
      );
    }

    return (
      <div>
        {content}
      </div>
    );
  }
}
