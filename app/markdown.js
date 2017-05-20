const config = require('electron-settings')
const MobiledocDOMRenderer = require('mobiledoc-dom-renderer')
const SimpleDOM = require('simple-dom')
const simpleHtmlTokenizer = require('simple-html-tokenizer')
const toMarkdown = require('to-markdown')

const document = new SimpleDOM.Document

const HighlightCard = {
 name: 'HighlightCard',
 type: 'dom',
  render({env, options, payload}) {
    const { isChapter, location, asin, highlight } = payload.annotation
    const blockquote = document.createElement("BLOCKQUOTE");
    const text = document.createTextNode(highlight)
    const href = `kindle://book?action=open&asin=${asin}&location=${location}`
    blockquote.setAttribute('cite', href)
    blockquote.appendChild(text)

    const cite = document.createElement('CITE');

    const a = document.createElement('a');
    a.setAttribute('href', href)
    const content = document.createTextNode(`Read more at location ${location}...`)
    a.appendChild(content)
    cite.appendChild(a);

    blockquote.appendChild(cite)

    return blockquote
  }
}

const LinkCard = {
 name: 'LinkCard',
 type: 'dom',
 render({env, options, payload}) {
   const a = document.createElement('a');
   a.href = payload.href;
   a.innerText = payload.href

   return a;
 }
}

module.exports = function(mobiledoc) {
  const renderer = new MobiledocDOMRenderer.default({
    cards: [HighlightCard, LinkCard],
    dom: new SimpleDOM.Document()
  })

  const rendered = renderer.render(mobiledoc);
  const serializer = new SimpleDOM.HTMLSerializer([]);
  const html = serializer.serializeChildren(rendered.result);

  return html
}
