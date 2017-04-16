// @flow
import React from 'react';

import {
  Card,
  CardTitle,
  CardText
} from 'material-ui/Card';

import TextField from 'material-ui/TextField';
import AppBar from 'material-ui/AppBar';

import { Sticky } from 'react-sticky';

interface AnnotationObjectAttrs {
  type: string,
  name: string,
  highlight: string,
  location: number,
  timestamp: number,
  asin: string,
  annotations: AnnotationObject[],
  startLocation: number
}

export class AnnotationObject implements AnnotationObjectAttrs {
  type: string;
  name: string;
  highlight: string;
  location: number;
  timestamp: number;
  asin: string;
  annotations: AnnotationObject[];
  startLocation: number;
  linkId: string;

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

    if (this.isChapter) {
      this.linkId = `chapter-${this.location}`;
      this.annotations = payload.annotations.map((annotation) => new AnnotationObject(annotation));
    }
  }

  get isChapter(): boolean {
    return this.type === 'chapter';
  }
}

export default class Annotation extends React.Component {
  props: {
    annotation: AnnotationObject,
    updateLocation: (boolean, AnnotationObject) => void
  }

  render() {
    let content;
    const { annotation, updateLocation } = this.props;

    if (annotation.isChapter) {
      content = (
        <div id={annotation.linkId}>
          <Sticky
            onStickyStateChange={(isCurrentChapter) => updateLocation(isCurrentChapter, annotation) }
            style={{ zIndex: 2000 }}
          >
            <AppBar
              title={annotation.name}
              showMenuIconButton={false}
            />
          </Sticky>
          {annotation.annotations.map((annotation) =>
            <Annotation
              annotation={annotation}
              key={annotation.timestamp}
              updateLocation={(isSticky, chapter) => updateLocation(isSticky, chapter)}
            />
          )}
        </div>
      );
    } else {
      const location = annotation.location;
      content = (
        <Card>
          <CardTitle>
            <a href={`kindle://book?action=open&asin=${annotation.asin}&location=${location}`}>
              Read more at location {location}
            </a>;
          </CardTitle>
          <CardText>
            {annotation.highlight}
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
