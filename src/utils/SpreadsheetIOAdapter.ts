import GeneralUtils from './GeneralUtils';

export default class SpreadsheetIOAdapter {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet | null;
  private sheetName: string;
  private defaultReference: string = '';

  constructor(sheetName: string, defaultReference?: string) {
    if (!sheetName) {
      throw new Error('Sheet name not provided');
    }

    this.sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!this.sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }
    this.sheetName = sheetName;

    if (defaultReference) {
      this.setReference(defaultReference);
    }
  }

  public read(
    reference?: string,
    minRows?: number,
    minCols?: number
  ): any | any[][] {
    const ref = reference || this.defaultReference;
    if (!ref) throw new Error('Reference not provided');
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" not found`);

    let values: any[][];
    try {
      const range: GoogleAppsScript.Spreadsheet.Range =
        this.sheet.getRange(ref);
      if (this.isCell(ref)) return range.getValue();
      values = range.getValues();
    } catch (error) {
      throw new Error(`Error reading reference "${ref}`);
    }

    // Remove empty rows and columns
    const hasData = (matrix: any[][]) =>
      matrix.reduce(
        (hasData, row) =>
          hasData || row.some((value) => value.length > 0 || value > 0),
        false
      );
    const isValidMinDim = (min: number | undefined) =>
      typeof min === 'number' && min >= 0;
    if (values.length > 0 && values[0].length > 0) {
      let i: number, rows: any[][];
      const finalMinRows = isValidMinDim(minRows) ? (minRows as number) - 1 : 0;
      for (i = 0; i < values.length; i++) {
        rows = values.slice(i);
        if (i > finalMinRows && !hasData(rows)) {
          values = values.slice(0, i);
        }
      }

      let j: number, cols: any[][];
      const finalMinCols = isValidMinDim(minCols) ? (minCols as number) - 1 : 0;
      for (j = 0; j < values[0].length; j++) {
        cols = values.map((row) => row.slice(j));
        if (j > finalMinCols && !hasData(cols)) {
          values = values.map((row) => row.slice(0, j));
        }
      }
    }

    return values;
  }

  public write(data: any | any[] | any[][], reference?: string): void {
    if (typeof data === 'undefined' || data === null)
      throw new Error('Data not provided');
    const ref = reference || this.defaultReference;
    if (!ref) throw new Error('Reference not provided');
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" not found`);

    let range: GoogleAppsScript.Spreadsheet.Range;
    try {
      range = this.sheet.getRange(ref);
    } catch (error) {
      throw new Error(`Error reading reference "${ref}"`);
    }

    try {
      if (this.isCell(ref)) range.setValue(this.writeCell(data));
      else range.setValues(this.writeRange(data, range));
    } catch (error) {
      throw new Error(`Error writing to reference "${ref}: ${error}"`);
    }
  }

  private writeCell(data: any) {
    if (GeneralUtils.isScalar(data)) {
      // Fill with the single value
      return data;
    } else if (GeneralUtils.isMatrix(data)) {
      // Fill with the upper-left value of the matrix
      return data[0][0];
    } else {
      throw new Error('Unsupported data structure');
    }
  }

  private writeRange(data: any, range: GoogleAppsScript.Spreadsheet.Range) {
    let finalData: any[][];
    if (GeneralUtils.isScalar(data)) {
      finalData = this.writeSingleValueToRange(data, range);
    } else if (GeneralUtils.isMatrix(data)) {
      finalData = this.writeMatrixToRange(data, range);
    } else throw new Error('Unsupported data structure');

    return finalData;
  }

  private writeSingleValueToRange(
    data: any,
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    let finalData: any[][] = [[data]];
    finalData = this.fillRows(finalData, range, data);
    finalData = this.fillCols(finalData, range, data);
    return finalData;
  }

  private writeMatrixToRange(
    data: any[][],
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    let finalData: any[][] = [...data];

    const areRowsSmaller = data.length < range.getNumRows();
    const areRowsBigger = data.length > range.getNumRows();
    if (areRowsSmaller) finalData = this.fillRows(finalData, range);
    else if (areRowsBigger) finalData = this.sliceRows(finalData, range);

    const areColsSmaller = data[0].length < range.getNumColumns();
    const areColsBigger = data[0].length > range.getNumColumns();
    if (areColsSmaller) finalData = this.fillCols(finalData, range);
    else if (areColsBigger) finalData = this.sliceCols(finalData, range);

    return finalData;
  }

  private sliceCols(data: any[], range: GoogleAppsScript.Spreadsheet.Range) {
    return data.map((row) => row.slice(0, range.getNumColumns()));
  }

  private sliceRows(data: any[], range: GoogleAppsScript.Spreadsheet.Range) {
    return data.slice(0, range.getNumRows());
  }

  private fillRows(
    data: any[],
    range: GoogleAppsScript.Spreadsheet.Range,
    value: string | number = ''
  ) {
    let finalData: any[][] = [...data];
    for (let i = data.length; i < range.getNumRows(); i++) {
      finalData.push(Array(range.getNumColumns()).fill(value));
    }
    return finalData;
  }

  private fillCols(
    data: any[],
    range: GoogleAppsScript.Spreadsheet.Range,
    value: string | number = ''
  ) {
    const finalData: any[][] = [];
    data.forEach((row) => {
      const missingValues = Array(range.getNumColumns() - row.length).fill(
        value
      );
      finalData.push([...row, ...missingValues]);
    });
    return finalData;
  }

  private isCell(reference: string): boolean {
    const ref = reference || this.defaultReference;
    const cellRegex = /^[A-Z]+[0-9]+$/;
    return cellRegex.test(ref);
  }

  private isRange(reference: string): boolean {
    const ref = reference || this.defaultReference;
    const rangeRegex = /^[A-Z]+[0-9]+:[A-Z]+[0-9]+$/;
    return rangeRegex.test(ref);
  }

  public setReference(reference: string): void {
    if (!this.isCell(reference) && !this.isRange(reference)) {
      throw new Error(`Invalid reference: "${reference}"`);
    }
    this.defaultReference = reference;
  }

  public moveReference(i: number, j: number): void {
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" not found`);
    if (!this.defaultReference) throw new Error(`Reference not set`);

    const oldRange: GoogleAppsScript.Spreadsheet.Range = this.sheet.getRange(
      this.defaultReference
    );
    const row = oldRange.getRow() + i;
    const col = oldRange.getColumn() + j;
    const newRange = this.sheet.getRange(
      row,
      col,
      oldRange.getNumRows(),
      oldRange.getNumColumns()
    );
    this.defaultReference =
      newRange?.getA1Notation() || this.defaultReference || '';
  }

  public resizeReference(newRowsCount: number, newColsCount: number): void {
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" not found`);
    if (!this.defaultReference) throw new Error(`Reference not set`);

    const oldRange: GoogleAppsScript.Spreadsheet.Range = this.sheet.getRange(
      this.defaultReference
    );
    const newRange = this.sheet.getRange(
      oldRange.getRow(),
      oldRange.getColumn(),
      newRowsCount,
      newColsCount
    );
    this.defaultReference =
      newRange?.getA1Notation() || this.defaultReference || '';
  }
}
