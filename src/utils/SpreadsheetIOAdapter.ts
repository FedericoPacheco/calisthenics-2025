export default class SpreadsheetIOAdapter {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet | null;
  private sheetName: string;
  private defaultReference: string = "";

  constructor(sheetName: string, defaultReference?: string) {
    if (!sheetName) {
      throw new Error("Sheet name not provided");
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
    if (!ref) throw new Error("Reference not provided");
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
      typeof min === "number" && min >= 0;
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
    if (typeof data === "undefined" || data === null)
      throw new Error("Data not provided");
    const ref = reference || this.defaultReference;
    if (!ref) throw new Error("Reference not provided");
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" not found`);

    let range: GoogleAppsScript.Spreadsheet.Range;
    try {
      range = this.sheet.getRange(ref);
    } catch (error) {
      throw new Error(`Error reading reference "${ref}"`);
    }

    try {
      if (this.isCell(ref)) range.setValue(this.writeSingleCell(data));
      else range.setValues(this.writeRange(data, range));
    } catch (error) {
      throw new Error(`Error writing to reference "${ref}: ${error}"`);
    }
  }

  private writeRange(data: any, range: GoogleAppsScript.Spreadsheet.Range) {
    let finalData: any[][];
    if (this.isSingleValue(data)) {
      finalData = this.writeSingleValueToRange(data, range);
    } else if (this.isMatrix(data)) {
      finalData = this.writeMatrixToRange(data, range);
    } else throw new Error("Unsupported data structure");

    return finalData;
  }

  private writeMatrixToRange(
    data: any[],
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    let finalData: any[][];
    const isMatrixSmaller =
      data.length < range.getNumRows() ||
      data[0].length < range.getNumColumns();
    if (isMatrixSmaller) {
      // Fill remaining space
      finalData = this.writeSmallMatrixToRange(data, range);
    } else if (
      data.length > range.getNumRows() ||
      data[0].length > range.getNumColumns()
    ) {
      // Truncate data
      finalData = this.writeBigMatrixToRange(data, range);
    } else {
      // Use data as is
      finalData = data;
    }
    return finalData;
  }

  private writeBigMatrixToRange(
    data: any[],
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    const slicedRows = this.sliceRows(data, range);
    const slicedCols = this.sliceCols(slicedRows, range);
    return slicedCols;
  }

  private sliceCols(data: any[], range: GoogleAppsScript.Spreadsheet.Range) {
    return data.map((row) => row.slice(0, range.getNumColumns()));
  }

  private sliceRows(data: any[], range: GoogleAppsScript.Spreadsheet.Range) {
    return data.slice(0, range.getNumRows());
  }

  private writeSmallMatrixToRange(
    data: any[],
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    let finalData = this.fillCols(data, range);
    finalData = this.fillRows(finalData, range);
    return finalData;
  }

  private fillRows(data: any[], range: GoogleAppsScript.Spreadsheet.Range) {
    let finalData: any[][] = [...data];
    for (let i = data.length; i < range.getNumRows(); i++) {
      finalData.push(Array(range.getNumColumns()).fill(""));
    }
    return finalData;
  }

  private fillCols(data: any[], range: GoogleAppsScript.Spreadsheet.Range) {
    const finalData: any[][] = [];
    data.forEach((row) => {
      const missingValues = Array(range.getNumColumns() - row.length).fill("");
      finalData.push([...row, ...missingValues]);
    });
    return finalData;
  }

  private writeSingleValueToRange(
    data: any,
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    let finalData = [];
    let row;
    for (let i = 0; i < range.getNumRows(); i++) {
      row = [];
      for (let j = 0; j < range.getNumColumns(); j++) {
        row.push(data);
      }
      finalData.push(row);
    }
    return finalData;
  }

  private writeSingleCell(data: any) {
    if (this.isSingleValue(data)) {
      // Fill with the single value
      return data;
    } else if (this.isMatrix(data)) {
      // Fill with the upper-left value of the matrix
      return data[0][0];
    } else {
      throw new Error("Unsupported data structure");
    }
  }

  private isMatrix(data: any) {
    return Array.isArray(data) && Array.isArray(data[0]);
  }

  private isSingleValue(data: any) {
    return !Array.isArray(data) && !Array.isArray(data[0]);
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
      newRange?.getA1Notation() || this.defaultReference || "";
  }
}
