const MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const SAFE_NAME = /[^a-z0-9._-]+/gi;
const loadExcelJS = async () => (await import('exceljs')).default;

const safeFileName = (value) => String(value || 'export.xlsx').replace(SAFE_NAME, '-');
// ExcelJS represents clickable hyperlinks and rich-text cells as objects.
// Read their displayed text instead of coercing the object to "[object Object]".
const displayValue = (value) => {
  if (value == null) return '';
  if (value instanceof Date) return value;
  if (typeof value !== 'object') return value;
  if (typeof value.text === 'string') return value.text;
  if (Array.isArray(value.richText)) return value.richText.map(part => part.text || '').join('');
  if ('result' in value) return displayValue(value.result);
  return value;
};

const text = (value) => {
  const displayed = displayValue(value);
  return displayed == null ? '' : String(displayed).trim();
};

const saveWorkbook = async (workbook, fileName) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: MIME }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = safeFileName(fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const styleSheet = (sheet, columns, rowCount) => {
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, rowCount + 1), column: columns.length } };
  const header = sheet.getRow(1);
  header.height = 28;
  header.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF18181B' } };
  header.alignment = { vertical: 'middle', horizontal: 'center' };
  header.eachCell(cell => {
    cell.border = { right: { style: 'thin', color: { argb: 'FF3F3F46' } } };
  });
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    row.height = 23;
    row.font = { name: 'Arial', size: 10, color: { argb: 'FF27272A' } };
    row.alignment = { vertical: 'middle' };
    row.eachCell(cell => {
      cell.border = { bottom: { style: 'thin', color: { argb: 'FFE4E4E7' } } };
    });
  });
  columns.forEach((column, index) => {
    const target = sheet.getColumn(index + 1);
    target.width = Math.min(42, Math.max(column.width || 14, text(column.header).length + 3));
    if (column.numberFormat) target.numFmt = column.numberFormat;
  });
};

export const downloadWorkbook = async ({ fileName, sheets }) => {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AutoAudit AI';
  workbook.created = new Date();
  sheets.forEach(({ name, columns, rows = [] }) => {
    const sheet = workbook.addWorksheet(name.slice(0, 31), { properties: { defaultRowHeight: 22 } });
    sheet.columns = columns.map(column => ({ header: column.header, key: column.key }));
    rows.forEach(row => sheet.addRow(row));
    styleSheet(sheet, columns, rows.length);
  });
  await saveWorkbook(workbook, fileName);
};

export const CUSTOMER_EXCEL_COLUMNS = [
  { header: 'Customer Name', key: 'name', width: 24 },
  { header: 'Mobile Number', key: 'mobile', width: 18, numberFormat: '@' },
  { header: 'Email Address', key: 'email', width: 30 },
  { header: 'Vehicle Number', key: 'vehicleNumber', width: 18, numberFormat: '@' },
  { header: 'Vehicle Model', key: 'vehicleModel', width: 22 },
  { header: 'Service Center', key: 'serviceCenter', width: 24 },
  { header: 'Service Date', key: 'serviceDate', width: 16, numberFormat: 'yyyy-mm-dd' },
];

export const downloadCustomerTemplate = async () => {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AutoAudit AI';
  const sheet = workbook.addWorksheet('Customers');
  sheet.columns = CUSTOMER_EXCEL_COLUMNS.map(column => ({ header: column.header, key: column.key }));
  styleSheet(sheet, CUSTOMER_EXCEL_COLUMNS, 0);
  for (let row = 2; row <= 501; row += 1) {
    sheet.getCell(row, 2).numFmt = '@';
    sheet.getCell(row, 4).numFmt = '@';
    sheet.getCell(row, 7).numFmt = 'yyyy-mm-dd';
  }
  const instructions = workbook.addWorksheet('Instructions');
  instructions.getColumn(1).width = 28;
  instructions.getColumn(2).width = 76;
  instructions.addRows([
    ['Field', 'Requirement'],
    ['Customer Name', 'Required. Minimum 2 characters.'],
    ['Mobile Number', 'Required. Include country code where possible, for example +919876543210.'],
    ['Email Address', 'Required. Used for the automated feedback invitation.'],
    ['Vehicle Number', 'Required. Must be unique within the selected dealer.'],
    ['Vehicle Model', 'Required.'],
    ['Service Center', 'Required. Use the branch name shown in AutoAudit AI.'],
    ['Service Date', 'Optional. Use YYYY-MM-DD; blank values use the import date.'],
    ['Import limit', 'Maximum 500 customer rows per workbook.'],
  ]);
  styleSheet(instructions, [{ header: 'Field', key: 'field', width: 28 }, { header: 'Requirement', key: 'requirement', width: 76 }], 8);
  await saveWorkbook(workbook, 'autoaudit-customer-import-template.xlsx');
};

const dateValue = (value) => {
  if (!value) return new Date().toISOString();
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  const parsed = new Date(text(value));
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid service date "${text(value)}". Use YYYY-MM-DD.`);
  return parsed.toISOString();
};

export const readCustomerWorkbook = async (file) => {
  if (!file?.name?.toLowerCase().endsWith('.xlsx')) throw new Error('Choose an .xlsx Excel workbook.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Workbook is larger than the 5 MB upload limit.');
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.getWorksheet('Customers') || workbook.worksheets[0];
  if (!sheet) throw new Error('The workbook does not contain a worksheet.');

  const headers = new Map();
  sheet.getRow(1).eachCell((cell, col) => headers.set(text(cell.text).toLowerCase(), col));
  const missing = CUSTOMER_EXCEL_COLUMNS.filter(column => !headers.has(column.header.toLowerCase())).map(column => column.header);
  if (missing.length) throw new Error(`Missing required headers: ${missing.join(', ')}.`);

  const rows = [];
  const errors = [];
  for (let rowNumber = 2; rowNumber <= sheet.actualRowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const read = header => row.getCell(headers.get(header.toLowerCase())).value;
    const raw = {
      name: text(read('Customer Name')),
      mobile: text(read('Mobile Number')),
      email: text(read('Email Address')).toLowerCase(),
      vehicleNumber: text(read('Vehicle Number')).toUpperCase(),
      vehicleModel: text(read('Vehicle Model')),
      serviceCenter: text(read('Service Center')),
    };
    if (!Object.values(raw).some(Boolean)) continue;
    const missingValues = Object.entries(raw).filter(([, value]) => !value).map(([key]) => key);
    if (missingValues.length) {
      errors.push(`Row ${rowNumber}: missing ${missingValues.join(', ')}`);
      continue;
    }
    if (!/^\S+@\S+\.\S+$/.test(raw.email)) {
      errors.push(`Row ${rowNumber}: invalid email address`);
      continue;
    }
    if (raw.mobile.replace(/\D/g, '').length < 10) {
      errors.push(`Row ${rowNumber}: mobile number must contain at least 10 digits`);
      continue;
    }
    try {
      rows.push({ ...raw, serviceDate: dateValue(read('Service Date')) });
    } catch (error) {
      errors.push(`Row ${rowNumber}: ${error.message}`);
    }
  }
  if (!rows.length && !errors.length) throw new Error('The workbook contains headers but no customer rows.');
  if (rows.length > 500) throw new Error('A maximum of 500 customer rows can be imported at once.');
  return { rows, errors };
};

export const dateStamp = () => new Date().toISOString().slice(0, 10);
