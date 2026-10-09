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

const CONTENT_WIDTH = 515;
const BOX = 16;

const str = (value) => (value === null || value === undefined ? '' : String(value).trim());

const noBorders = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

const thinBorders = {
  hLineWidth: () => 0.7,
  vLineWidth: () => 0.7,
  paddingLeft: () => 3,
  paddingRight: () => 3,
  paddingTop: () => 2,
  paddingBottom: () => 1,
};

const underlineLayout = {
  hLineWidth: (i) => (i === 1 ? 0.7 : 0),
  vLineWidth: () => 0,
  paddingLeft: () => 2,
  paddingRight: () => 2,
  paddingTop: () => 2,
  paddingBottom: () => 1,
};

const sectionTitle = (text) => ({ text, style: 'section' });

// Поле в рамке
const box = (value, width = '*') => ({
  width,
  table: { widths: ['*'], body: [[{ text: str(value) || ' ' }]] },
  layout: thinBorders,
});

// Поле с подчёркиванием
const line = (value, width = '*') => ({
  width,
  table: { widths: ['*'], body: [[{ text: str(value) || ' ' }]] },
  layout: underlineLayout,
});

const label = (text, width) => ({ text, width, margin: [0, 3, 6, 0] });

const row = (columns, marginTop = 4) => ({ columns, columnGap: 0, margin: [0, marginTop, 0, 0] });

// Ряд клеток по одному символу; separators — индексы, перед которыми вставляется разделитель
function cells(chars, { width = BOX, separators = {} } = {}) {
  const widths = [];
  const body = [];
  chars.forEach((char, index) => {
    if (separators[index] !== undefined) {
      widths.push(10);
      body.push({ text: separators[index], alignment: 'center', bold: true, border: [false, false, false, false] });
    }
    widths.push(width);
    body.push({ text: str(char) || ' ', alignment: 'center', border: [true, true, true, true] });
  });
  return {
    width: 'auto',
    table: { widths, body: [body] },
    layout: { ...thinBorders, paddingLeft: () => 0, paddingRight: () => 0 },
  };
}

const checkbox = (checked, text) => ({
  width: '*',
  columns: [
    {
      width: 'auto',
      table: { widths: [12], heights: [12], body: [[{ text: checked ? 'X' : ' ', alignment: 'center', bold: true }]] },
      layout: { ...thinBorders, paddingLeft: () => 0, paddingRight: () => 0, paddingTop: () => 0 },
    },
    { text, width: '*', margin: [6, 2, 0, 0] },
  ],
});

// Таблица с заголовками колонок и строками данных
function grid(headers, rows) {
  return {
    table: {
      widths: headers.map(() => '*'),
      body: [
        headers.map((text) => ({ text, alignment: 'center' })),
        ...rows.map((cols) => cols.map((value) => ({ text: str(value) || ' ' }))),
      ],
    },
    layout: { ...thinBorders, paddingTop: () => 3, paddingBottom: () => 2 },
    margin: [0, 4, 0, 0],
  };
}

function eltCodeCells(code) {
  const chars = Array.isArray(code) ? code : str(code).split('');
  const padded = Array.from({ length: 15 }, (_, i) => chars[i] || '');
  return cells(padded, { width: (CONTENT_WIDTH - 2) / 15 - 0.7 });
}

function registrationMarkCells(value) {
  const raw = str(value).toUpperCase();
  let prefix;
  let suffix;
  if (raw.includes('-')) {
    [prefix, suffix] = [raw.slice(0, raw.indexOf('-')), raw.slice(raw.indexOf('-') + 1)];
  } else {
    [prefix, suffix] = [raw.slice(0, 2), raw.slice(2)];
  }
  const left = Array.from({ length: Math.max(2, prefix.length) }, (_, i) => prefix[i] || '');
  const right = Array.from({ length: Math.max(5, suffix.length) }, (_, i) => suffix[i] || '');
  return cells([...left, ...right], { separators: { [left.length]: '–' } });
}

function dateCells(value) {
  const parts = str(value).split(/[./\-\s]+/).filter(Boolean);
  const [day = '', month = '', year = ''] = parts.length === 3 ? parts : ['', '', ''];
  const pad = (text, length) => Array.from({ length }, (_, i) => text.padStart(length, text ? '0' : '')[i] || '');
  return cells([...pad(day, 2), ...pad(month, 2), ...pad(year, 4)], { separators: { 2: '/', 4: '/' } });
}

function billingSection(formData) {
  return [
    sectionTitle('РЕКВИЗИТЫ ДЛЯ ВЫСТАВЛЕНИЯ СЧЁТА'),
    row([label('Полное название организации', 190), line(formData.billingFullName)]),
    row([line('')]),
    row([label('Сокращенное название организации', 190), line(formData.billingShortName)]),
    row([label('Место нахождения (юридический адрес)', 190), line(formData.billingLegalAddress)]),
    row([line('')]),
    row([label('Почтовый адрес', 190), line(formData.billingMailingAddress)]),
    row([line('')]),
    row([label('УНП:', 30), line(formData.billingUNP, 200), { text: '', width: 50 }, line('')]),
  ];
}

function signatureSection(formData) {
  return [
    {
      columns: [
        { text: '', width: 40 },
        label('Дата', 'auto'),
        dateCells(formData.date),
        { text: '', width: '*' },
        label('Подпись', 'auto'),
        box(formData.signature, 170),
        { text: '', width: 20 },
      ],
      margin: [0, 2, 0, 2],
    },
  ];
}

// Каждая секция — строка внешней таблицы, между секциями толстая серая линия
function formDocument(title, sections) {
  return {
    pageSize: 'A4',
    pageMargins: [36, 30, 36, 30],
    content: [
      {
        table: {
          widths: ['*'],
          body: [
            [{ text: title, style: 'title' }],
            ...sections.map((section) => [{ stack: section }]),
          ],
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0.8 : 3),
          vLineWidth: () => 0.8,
          hLineColor: (i, node) => (i === 0 || i === node.table.body.length ? '#000000' : '#b3b3b3'),
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 6,
          paddingBottom: () => 8,
        },
      },
    ],
    defaultStyle: { font: 'Roboto', fontSize: 8.5 },
    styles: {
      title: { fontSize: 13, bold: true, alignment: 'center', margin: [0, 6, 0, 6] },
      section: { fontSize: 10, bold: true, alignment: 'center', margin: [0, 0, 0, 4] },
    },
  };
}

function registrationDocument(formData) {
  const contacts = (formData.emergencyContacts || []).map((c) => [c.workPhone, c.mobilePhone, c.email]);
  const persons = (formData.responsiblePersons || []).filter((p) => p.name || p.phone || p.email);
  const address = (formData.operatorAddress || []).map(str).filter(Boolean).join(', ');

  return formDocument('ЗАЯВЛЕНИЕ О РЕГИСТРАЦИИ ELT', [
    [
      sectionTitle('ОСНОВАНИЕ ДЛЯ РЕГИСТРАЦИИ ELT'),
      {
        columns: [
          checkbox(formData.registrationType === 'registration', 'регистрация ELT'),
          checkbox(formData.registrationType === 'reregistration', 'перерегистрация ELT'),
        ],
      },
    ],
    [
      sectionTitle('ИНФОРМАЦИЯ ПО ELT'),
      { text: '15-ЗНАЧНЫЙ ШЕСТНАДЦАТЕРИЧНЫЙ КОД ПОСЫЛКИ', alignment: 'center', margin: [0, 0, 0, 4] },
      eltCodeCells(formData.eltCode),
      row([
        label('Модель', 85), box(formData.eltModel, 175), { text: '', width: '*' },
        label('Заводской номер', 'auto'), box(formData.eltSerialNumber, 155),
      ], 6),
      row([label('Изготовитель', 175), box(formData.eltManufacturer)]),
    ],
    [
      sectionTitle('ИНФОРМАЦИЯ О ВОЗДУШНОМ СУДНЕ'),
      row([label('Тип воздушного судна', 155), box(formData.aircraftType)], 0),
      row([label('Модель воздушного судна', 155), box(formData.aircraftModel)]),
      row([label('Регистрационный знак воздушного судна', 210), registrationMarkCells(formData.aircraftRegistration)]),
      row([label('Максимальное число людей на борту (экипаж и пассажиры)', 345), box(formData.maxPeopleOnBoard, 80)]),
    ],
    [
      sectionTitle('ИНФОРМАЦИЯ ОБ ЭКСПЛУАТАНТЕ ВОЗДУШНОГО СУДНА'),
      row([label('Эксплуатант воздушного судна', 230), line(formData.operator)], 0),
      row([line('')]),
      row([line('')]),
      row([label('Почтовый адрес', 190), line(address)], 8),
    ],
    [
      sectionTitle('ДАННЫЕ ДЛЯ СВЯЗИ В СЛУЧАЕ БЕДСТВИЯ'),
      grid(['Рабочий телефон', 'Мобильный телефон', 'E-mail'], contacts.length ? contacts : [['', '', ''], ['', '', '']]),
    ],
    [
      sectionTitle('ДАННЫЕ ОТВЕТСТВЕННОГО ЗА РЕГИСТРАЦИЮ'),
      grid(['Ответственное лицо', 'Телефон', 'E-mail'], persons.length ? persons.map((p) => [p.name, p.phone, p.email]) : [['', '', '']]),
    ],
    billingSection(formData),
    signatureSection(formData),
  ]);
}

function deregistrationDocument(formData) {
  return formDocument('ЗАЯВЛЕНИЕ О СНЯТИИ С РЕГИСТРАЦИИ ELT', [
    [
      sectionTitle('ИНФОРМАЦИЯ ПО ELT'),
      { text: '15-ЗНАЧНЫЙ ШЕСТНАДЦАТЕРИЧНЫЙ КОД ПОСЫЛКИ', alignment: 'center', margin: [0, 0, 0, 4] },
      eltCodeCells(formData.eltCode),
      row([
        label('Модель', 85), box(formData.eltModel, 175), { text: '', width: '*' },
        label('Заводской номер', 'auto'), box(formData.eltSerialNumber, 155),
      ], 6),
    ],
    [
      sectionTitle('ИНФОРМАЦИЯ О ВОЗДУШНОМ СУДНЕ'),
      row([label('Тип воздушного судна', 155), box(formData.aircraftType)], 0),
      row([label('Модель воздушного судна', 155), box(formData.aircraftModel)]),
      row([label('Регистрационный знак воздушного судна', 210), registrationMarkCells(formData.aircraftRegistration)]),
    ],
    [
      sectionTitle('ИНФОРМАЦИЯ ОБ ЭКСПЛУАТАНТЕ ВОЗДУШНОГО СУДНА'),
      row([label('Эксплуатант воздушного судна', 230), line(formData.operator)], 0),
      row([line('')]),
      row([label('Почтовый адрес', 190), line(formData.operatorAddress)], 8),
      grid(['Рабочий телефон', 'Мобильный телефон', 'E-mail'], [[formData.operatorWorkPhone, formData.operatorMobilePhone, formData.operatorEmail]]),
    ],
    [
      sectionTitle('ДАННЫЕ ОТВЕТСТВЕННОГО ЗА СНЯТИЕ С РЕГИСТРАЦИИ ELT'),
      grid(['Ответственное лицо', 'Телефон', 'E-mail'], [[formData.responsiblePerson, formData.responsiblePhone, formData.responsibleEmail]]),
    ],
    billingSection(formData),
    signatureSection(formData),
  ]);
}

function renderPdf(docDefinition) {
  return new Promise((resolve, reject) => {
    const doc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.end();
  });
}

module.exports = {
  createRegistrationPdf: (formData) => renderPdf(registrationDocument(formData)),
  createDeregistrationPdf: (formData) => renderPdf(deregistrationDocument(formData)),
};
