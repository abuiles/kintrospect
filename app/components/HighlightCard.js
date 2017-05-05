import React from 'react';
import { classToDOMCard } from 'react-mobiledoc-editor';

class HighlightCard extends React.Component {
  render() {
    const annotation = this.props.payload.annotation
    const { isChapter, location, asin, highlight } = annotation
    let content

    if (isChapter) {
      content = (
        <h2>
          {annotation.name}
        </h2>
      )
    } else {
      content = (
        <article className="mw5 mw6-ns hidden ba bw1 mv4 m2 mr3">
          <a className="db f4 bg-near-black white mv0 pv2 ph3 no-underline" href={`kindle://book?action=open&asin=${asin}&location=${location}`}>
            Read more at location {location}...
          </a>
          <div className="pa3 bt">
            <p className="f6 f5-ns lh-copy measure mv0">
              {highlight}
            </p>
          </div>
        </article>
      )
    }

    return content;
  }
}

export default classToDOMCard(HighlightCard, 'HighlightCard');
