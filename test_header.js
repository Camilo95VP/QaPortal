const { Document, Packer, Header, Paragraph, TextRun, ImageRun, TabStopType, WidthType } = require('docx');
const fflate = require('./node_modules/fflate');
const fs = require('fs');

// Load actual project PNG files to simulate browser fetch
function fileToDataUri(path) {
  var buf = fs.readFileSync(path);
  return 'data:image/png;base64,' + buf.toString('base64');
}
const sofkaUri = fileToDataUri('src/assets/Logo Sofka.png');
const kuaraUri  = fileToDataUri('src/assets/Logo Kuara.png');
const cmToPx = function(cm) { return Math.round(cm * 37.7952755906); };

const headerPara = new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: 9026 }],
  children: [
    new ImageRun({ type: 'png', data: sofkaUri, transformation: { width: cmToPx(5.23), height: cmToPx(1.48) }, altText: { title: 'Sofka', description: '', name: 'img-sofka', id: 1 } }),
    new TextRun({ text: '\t' }),
    new ImageRun({ type: 'png', data: kuaraUri, transformation: { width: cmToPx(6.52), height: cmToPx(1.67) }, altText: { title: 'Kuara', description: '', name: 'img-kuara', id: 2 } }),
  ],
});

const doc = new Document({
  sections: [{
    headers: { default: new Header({ children: [headerPara] }) },
    children: [new Paragraph({ children: [new TextRun('Prueba de encabezado con logos reales')] })],
  }],
});

Packer.toBuffer(doc).then(function(buf) {
  fs.writeFileSync('test_real_header.docx', buf);
  var unzipped = fflate.unzipSync(buf);
  var headerXml = Buffer.from(unzipped['word/header1.xml']).toString();
  // Check for wp:docPr id values - they must be unique across the whole document
  var docPrIds = headerXml.match(/wp:docPr id="[^"]+"/g) || [];
  console.log('Drawing docPr IDs in header:', docPrIds.join(' | '));
  // Check for duplicates
  var ids = docPrIds.map(function(m) { return m.match(/id="([^"]+)"/)[1]; });
  var dups = ids.filter(function(v, i) { return ids.indexOf(v) !== i; });
  console.log(dups.length ? 'DUPLICATE IDs FOUND: ' + dups.join(', ') : 'All IDs unique - OK');
  // Also check document.xml for its own docPr ids
  var docXml = Buffer.from(unzipped['word/document.xml']).toString();
  var docDocPrIds = docXml.match(/wp:docPr id="[^"]+"/g) || [];
  console.log('Drawing docPr IDs in document body:', docDocPrIds.join(' | ') || 'none');
}).catch(function(e) { console.error('ERROR:', e.message); });
