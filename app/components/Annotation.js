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

class AnnotationView extends React.Component {
  props: {
    annotation: any,
    updateLocation: (boolean, any) => void,
    connectDragSource: () => void,
    isDragging: boolean
  }

  render() {
    let content;
    const { annotation } = this.props;
    const { isDragging, connectDragSource } = this.props

    const styles = {
      opacity: isDragging ? 0.4 : 1,
      cursor: 'move'
    }

    if (annotation.isChapter) {
      content = (
        <div className="bg-washed-blue ba bw1">
          <h2>{annotation.name}</h2>
        </div>
      )
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
}))(AnnotationView)
