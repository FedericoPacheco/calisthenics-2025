import { EditEventPort } from "../../domain/ports/EditEventPort";
import { IOPort } from "../../domain/ports/IOPort";
import GSheetsIOAdapter from "./GSheetsIOAdapter";

export default class GSheetsEditEventAdapter implements EditEventPort {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  private range: GoogleAppsScript.Spreadsheet.Range;
  private eventRange: GoogleAppsScript.Spreadsheet.Range;

  constructor(
    event: GoogleAppsScript.Events.SheetsOnEdit,
    sheetName: string,
    rangeReference: string
  ) {
    const sheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
    this.sheet = sheet;
    this.range = sheet.getRange(rangeReference);

    this.eventRange = event.range;
  }

  shouldHandle(): boolean {
    if (this.eventRange.getSheet().getName() !== this.sheet.getName())
      return false;
    
    const targetStartI = this.range.getColumn();
    const targetEndI = targetStartI + this.range.getNumColumns() - 1;
    const targetStartJ = this.range.getRow();
    const targetEndJ = targetStartJ + this.range.getNumRows() - 1;

    const eventStartI = this.eventRange.getColumn();
    const eventEndI = eventStartI + this.eventRange.getNumColumns() - 1;
    const eventStartJ = this.eventRange.getRow();
    const eventEndJ = eventStartJ + this.eventRange.getNumRows() - 1;

    const isOverlappedHorizontally =
      (eventStartI <= targetStartI && eventEndI >= targetStartI) ||
      (eventStartI <= targetEndI && eventEndI >= targetEndI);
    const isOverlappedVertically =
      (eventStartJ <= targetStartJ && eventEndJ >= targetStartJ) ||
      (eventStartJ <= targetEndJ && eventEndJ >= targetEndJ);
    const isWithinHorizontally =
      eventStartI >= targetStartI && eventEndI <= targetEndI;
    const isWithinVertically =
      eventStartJ >= targetStartJ && eventEndJ <= targetEndJ;

    if (isOverlappedHorizontally && isOverlappedVertically) return true;
    if (isWithinHorizontally && isOverlappedVertically) return true;
    if (isOverlappedHorizontally && isWithinVertically) return true;
    if (isWithinHorizontally && isWithinVertically) return true;
    return false;
  }

  getIOAdapter(): IOPort {
    return new GSheetsIOAdapter(
      this.sheet.getName(),
      this.range.getA1Notation()
    );
  }
}
