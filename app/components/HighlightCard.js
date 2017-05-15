import React from 'react';
import { classToDOMCard } from 'react-mobiledoc-editor';

class HighlightCard extends React.Component {
  render() {
    const { isChapter, location, asin, highlight } = this.props.payload.annotation

    if (isChapter) {
      return (
        <h2>
          {annotation.name}
        </h2>
      )
    } else {
      return (
        <blockquote className="serif pl4 bl bw2 b--blue ma0">
          <p className="f4 lh-copy measure mb3">
            {highlight}
          </p>
          <a className="f5" href={`kindle://book?action=open&asin=${asin}&location=${location}`}>
            Read more at location {location}...
          </a>
        </blockquote>
      )
    }
  }
}

export default classToDOMCard(HighlightCard, 'HighlightCard');
