import { IOPort } from "../../domain/ports/IOPort";
import GeneralUtils from "../../domain/utils/GeneralUtils";

export default class GSheetsIOAdapter implements IOPort {
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

    if (GeneralUtils.isNonEmptyMatrix(values)) {
      values = this.filterEmptyRows(values, minRows);
      values = this.filterEmptyCols(values, minCols);
    }

    return values;
  }

  private filterEmptyCols(matrix: any[][], minCols: number = 1) {
    if (!GeneralUtils.isMatrixWithValues(matrix)) return [[]];

    const numCols = matrix[0].length;
    for (let j = Math.max(minCols, 1); j < numCols; j++) {
      const nextCols = GeneralUtils.sliceCols(matrix, j, numCols);
      if (!GeneralUtils.isMatrixWithValues(nextCols)) {
        const pastCols = GeneralUtils.sliceCols(matrix, 0, j);
        return pastCols;
      }
    }
    return matrix;
  }

  private filterEmptyRows(matrix: any[][], minRows: number = 1) {
    if (!GeneralUtils.isMatrixWithValues(matrix)) return [[]];

    const numRows = matrix.length;
    for (let i = Math.max(minRows, 1); i < numRows; i++) {
      const nextRows = GeneralUtils.sliceRows(matrix, i, numRows);
      if (!GeneralUtils.isMatrixWithValues(nextRows)) {
        const pastRows = GeneralUtils.sliceRows(matrix, 0, i);
        return pastRows;
      }
    }
    return matrix;
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
      throw new Error("Unsupported data structure");
    }
  }

  private writeRange(data: any, range: GoogleAppsScript.Spreadsheet.Range) {
    let finalData: any[][];
    if (GeneralUtils.isScalar(data)) {
      finalData = this.writeSingleValueToRange(data, range);
    } else if (GeneralUtils.isMatrix(data)) {
      finalData = this.writeMatrixToRange(data, range);
    } else throw new Error("Unsupported data structure");

    return finalData;
  }

  private writeSingleValueToRange(
    data: any,
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    let finalData: any[][] = [[data]];
    finalData = GeneralUtils.fillRows(
      finalData,
      range.getNumRows(),
      range.getNumColumns(),
      data
    );
    finalData = GeneralUtils.fillCols(finalData, range.getNumColumns(), data);
    return finalData;
  }

  private writeMatrixToRange(
    data: any[][],
    range: GoogleAppsScript.Spreadsheet.Range
  ) {
    let finalData: any[][] = [...data];

    const areRowsSmaller = data.length < range.getNumRows();
    const areRowsBigger = data.length > range.getNumRows();
    if (areRowsSmaller)
      finalData = GeneralUtils.fillRows(
        finalData,
        range.getNumRows(),
        range.getNumColumns()
      );
    else if (areRowsBigger)
      finalData = GeneralUtils.sliceRows(finalData, 0, range.getNumRows());

    const areColsSmaller = data[0].length < range.getNumColumns();
    const areColsBigger = data[0].length > range.getNumColumns();
    if (areColsSmaller)
      finalData = GeneralUtils.fillCols(finalData, range.getNumColumns());
    else if (areColsBigger)
      finalData = GeneralUtils.sliceCols(finalData, 0, range.getNumColumns());

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

  private setReference(reference: string): void {
    if (!this.isCell(reference) && !this.isRange(reference)) {
      throw new Error(`Invalid reference: "${reference}"`);
    }
    this.defaultReference = reference;
  }

  public moveReference(rowDisplacement: number, colDisplacement: number): void {
    if (!this.sheet) throw new Error(`Sheet "${this.sheetName}" not found`);
    if (!this.defaultReference) throw new Error(`Reference not set`);

    const oldRange: GoogleAppsScript.Spreadsheet.Range = this.sheet.getRange(
      this.defaultReference
    );
    const row = oldRange.getRow() + rowDisplacement;
    const col = oldRange.getColumn() + colDisplacement;
    const newRange = this.sheet.getRange(
      row,
      col,
      oldRange.getNumRows(),
      oldRange.getNumColumns()
    );
    this.defaultReference =
      newRange?.getA1Notation() || this.defaultReference || "";
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
      newRange?.getA1Notation() || this.defaultReference || "";
  }
}
