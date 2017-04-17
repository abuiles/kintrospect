import React from 'react';

export default class BookList extends React.Component {
  // constructor(props: { book: BookObject }) {
  //   super(props);
  //   // assume annotations are sorted
  //   const { location } = this.props.book.annotations[0];
  //   this.state = {
  //     open: false,
  //     currentLocation: location,
  //     locations: [location]
  //   };
  // }

  // state: BookState

  // props: {
  //   book: BookObject
  // }

  handleToggle() {
    this.setState({ open: !this.state.open });
  }

  updateLocation(isCurrent: boolean, { location }: AnnotationObject) {
    const { locations } = this.state;
    if (isCurrent) {
      if (locations.indexOf(location) < 0) {
        locations.unshift(location);
      }

      this.setState({
        currentLocation: location,
        locations
      });
    } else if (locations.length) {
      locations.shift();

      this.setState({
        currentLocation: locations[0],
        locations
      });
    }
  }

  render() {
    const { book } = this.props;
    const { open, currentLocation } = this.state;
    const chapters = book.annotations.filter((a) => a.isChapter);

    return (
      <div>
        <Drawer open={open} containerStyle={{ zIndex: 4000 }}>
          <AppBar
            title="Table of contents"
            iconElementRight={<IconButton><NavigationClose /></IconButton>}
            showMenuIconButton={false}
            onTitleTouchTap={() => this.handleToggle()}
            onRightIconButtonTouchTap={() => this.handleToggle()}
          />
          <SelectableList
            value={currentLocation}
          >
            {chapters.map((a) =>
              <ListItem
                key={a.location}
                value={a.location}
                primaryText={a.name}
                href={`#${a.linkId}`}
              />
            )}
          </SelectableList>
          <img alt="book cover" src={book.bookCover} />
        </Drawer>
        <StickyContainer>
          <Sticky style={{ zIndex: 2000 }}>
            <AppBar
              title={book.title}
              onTitleTouchTap={() => this.handleToggle()}
              onLeftIconButtonTouchTap={() => this.handleToggle()}
            />
          </Sticky>
          <StickyContainer>
            {book.annotations.map((annotation) =>
              <Annotation
                annotation={annotation}
                key={annotation.location || annotation.timestamp}
                updateLocation={(isSticky, chapter) => this.updateLocation(isSticky, chapter)}
              />
            )}
          </StickyContainer>
        </StickyContainer>
      </div>
    );
  }
}
