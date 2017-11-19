const MobiledocDOMRenderer = require('mobiledoc-dom-renderer')
const SimpleDOM = require('simple-dom')
const simpleHtmlTokenizer = require('simple-html-tokenizer')

const document = new SimpleDOM.Document

const promesify = require('promesify')
var upndown = require('upndown')

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
    const content = document.createTextNode(`Read more`)
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

  var und = new upndown();

  const Promesify = promesify({
    methods: ['convert']
  });

  und = new Promesify(und)

  return und.convert(html);
}
