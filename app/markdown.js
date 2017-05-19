config = require('electron-settings')
mobiledoc = config.get('notes.B003V1WXKU')
dr = require('mobiledoc-dom-renderer')
SimpleDOM = require('simple-dom')
simpleHtmlTokenizer  = require('simple-html-tokenizer')
MobiledocDOMRenderer = dr.default
document = new SimpleDOM.Document

const HighlightCard = {
 name: 'HighlightCard',
 type: 'dom',
  render({env, options, payload}) {
    const { isChapter, location, asin, highlight } = payload.annotation
    let x = document.createElement("BLOCKQUOTE");
    let t = document.createTextNode(highlight)
    let cite = `kindle://book?action=open&asin=${asin}&location=${location}`
    x.setAttribute("cite", cite)

    x.appendChild(t)

    var m = document.createElement("CITE");

    let a = document.createElement('a');
    a.setAttribute('href', cite)
    let content = document.createTextNode(`Read more at location ${location}...`)
    a.appendChild(content)
    m.appendChild(a);

    x.appendChild(m)

   return x
 }
};

const LinkCard = {
 name: 'LinkCard',
 type: 'dom',
 render({env, options, payload}) {
   let a = document.createElement('a');
   a.href = payload.href;
   a.innerText = payload.href

   return a;
 }
};
renderer = new MobiledocDOMRenderer({
  cards: [HighlightCard, LinkCard],
  dom: new SimpleDOM.Document()
})


rendered = renderer.render(mobiledoc);
serializer = new SimpleDOM.HTMLSerializer([]);
var html = serializer.serializeChildren(rendered.result);

toMarkdown = require('to-markdown')
md = toMarkdown(html)

app = require('electron').app
title = 'book.md'

   dir = app.getPath('downloads')
   filePath = path.join(dir, title);

  fs.writeFileSync(filePath, md)
