const PdfPrinter = require('pdfmake');
const vfs = require('pdfmake/build/vfs_fonts');

const font = (name) => Buffer.from(vfs[name], 'base64');

const printer = new PdfPrinter({
  Roboto: {
    normal: font('Roboto-Regular.ttf'),
    bold: font('Roboto-Medium.ttf'),
    italics: font('Roboto-Italic.ttf'),
    bolditalics: font('Roboto-MediumItalic.ttf'),
  },
});

const cellText = (cell) => {
  const value = cell.value;
  if (value === null || value === undefined) return '';
  return String(value);
};

// Превращает двухколоночный лист Excel (Поле / Значение) в PDF-документ
function worksheetToPdf(worksheet, title = worksheet.name) {
  const body = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const field = cellText(row.getCell(1));
    const value = cellText(row.getCell(2));

    if (rowNumber === 1) {
      body.push([
        { text: field, style: 'tableHeader' },
        { text: value, style: 'tableHeader' },
      ]);
      return;
    }

    if (row.getCell(1).font?.bold && !value) {
      body.push([{ text: field, colSpan: 2, style: 'section' }, {}]);
      return;
    }

    body.push([field, value]);
  });

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      { text: title, style: 'title' },
      {
        table: { headerRows: 1, widths: ['40%', '60%'], body },
        layout: {
          hLineColor: () => '#9aa5b5',
          vLineColor: () => '#9aa5b5',
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
    ],
    defaultStyle: { font: 'Roboto', fontSize: 10 },
    styles: {
      title: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 14] },
      tableHeader: { bold: true, color: '#ffffff', fillColor: '#213659', alignment: 'center' },
      section: { bold: true, fillColor: '#e8edf4' },
    },
  };

  return new Promise((resolve, reject) => {
    const doc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

module.exports = { worksheetToPdf };
