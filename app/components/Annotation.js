import React from 'react';
import { Sticky } from 'react-sticky';
import { DragSource } from 'react-dnd';

import ItemTypes from './ItemTypes';

const highlightSource = {
  beginDrag(props) {
    console.log('dragging', props.annotation);
    return {
      text: props.annotation.highlight,
      annotation: props.annotation
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    console.log('dragging', props.annotation);

    if (monitor.didDrop()) {
      dropResult.component.addHighlight(item)
    }
  }
}


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

class Annotation extends React.Component {
  props: {
    annotation: AnnotationObject,
    updateLocation: (boolean, AnnotationObject) => void,
    connectDragSource: () => void,
    isDragging: boolean
  }

  render() {
    let content;
    const { annotation, updateLocation } = this.props;
    const { isDragging, connectDragSource } = this.props

    const styles = {
      opacity: isDragging ? 0.4 : 1,
      cursor: 'move'
    }

    if (annotation.isChapter) {
      content = (
        <Sticky
          onStickyStateChange={(isCurrentChapter) => updateLocation(isCurrentChapter, annotation)}
          style={{ zIndex: 2000 }}
          className="bg-washed-blue"
        >
          <h2>
            {annotation.name}
          </h2>
        </Sticky>
      );
    } else {
      const location = annotation.location;

      content = (
        <article className="mw5 mw6-ns hidden ba mv4 m2 mr3">
          <a className="db f4 bg-near-black white mv0 pv2 ph3 no-underline" href={`kindle://book?action=open&asin=${annotation.asin}&location=${location}`}>
              Read more at location {location}...
            </a>
          <div className="pa3 bt">
            <p className="f6 f5-ns lh-copy measure mv0">
              {annotation.highlight}
            </p>
          </div>
        </article>
      );
    }

    return (
      connectDragSource(
        <div style={styles}>
          {content}
        </div>
      )
    );
  }
}

export default DragSource(ItemTypes.HIGHLIGHT, highlightSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(Annotation)
