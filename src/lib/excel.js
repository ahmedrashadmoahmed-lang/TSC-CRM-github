// Excel Import/Export Utilities
import * as XLSX from 'xlsx';

/**
 * Import data from Excel file
 */
export async function importFromExcel(file, options = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = options.sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: options.header || 1,
          defval: '',
          blankrows: false,
        });

        resolve({
          data: jsonData,
          sheetNames: workbook.SheetNames,
          totalRows: jsonData.length,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export data to Excel file
 */
export function exportToExcel(data, filename = 'export.xlsx', options = {}) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: options.headers,
      skipHeader: options.skipHeader || false,
    });

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = [];

    if (data.length > 0) {
      Object.keys(data[0]).forEach((key, i) => {
        const maxLen = Math.max(key.length, ...data.map((row) => String(row[key] || '').length));
        colWidths[i] = { wch: Math.min(maxLen + 2, maxWidth) };
      });
    }

    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');

    // Use XLSX.writeFile which works in browser
    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    console.error('Export to Excel failed:', error);
    return false;
  }
}

/**
 * Export multiple sheets to Excel
 */
export function exportMultipleSheets(sheets, filename = 'export.xlsx') {
  try {
    const workbook = XLSX.utils.book_new();

    sheets.forEach(({ name, data, headers }) => {
      const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });

    XLSX.writeFile(workbook, filename);
    return true;
  } catch (error) {
    console.error('Export multiple sheets failed:', error);
    return false;
  }
}

/**
 * Validate Excel data structure
 */
export function validateExcelData(data, requiredFields) {
  const errors = [];

  if (!Array.isArray(data) || data.length === 0) {
    return { valid: false, errors: ['No data found in file'] };
  }

  const firstRow = data[0];
  const missingFields = requiredFields.filter((field) => !(field in firstRow));

  if (missingFields.length > 0) {
    errors.push(`Missing required columns: ${missingFields.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    rowCount: data.length,
    columns: Object.keys(firstRow),
  };
}
