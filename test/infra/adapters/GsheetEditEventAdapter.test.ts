import { suite, test, setup, teardown } from "mocha";
import { assert } from "chai";
import { stub, restore } from "sinon";
import GSheetsEditEventAdapter from "../../../src/infra/adapters/GSheetsEditEventAdapter";

// https://developers.google.com/apps-script/guides/triggers/events

suite("GSheetsEditEventAdapter", function () {
  let rangeStub: GoogleAppsScript.Spreadsheet.Range,
    sheetStub: GoogleAppsScript.Spreadsheet.Sheet,
    spreadsheetStub: GoogleAppsScript.Spreadsheet.Spreadsheet;

  let eventRangeStub: GoogleAppsScript.Spreadsheet.Range,
    eventSheetStub: GoogleAppsScript.Spreadsheet.Sheet,
    eventSpreadsheetStub: GoogleAppsScript.Spreadsheet.Spreadsheet,
    event: GoogleAppsScript.Events.SheetsOnEdit;

  let adapter: GSheetsEditEventAdapter;

  setup(function () {
    // Base spreadsheet stubs
    rangeStub = {
      getNumRows: stub(),
      getNumColumns: stub(),
      getRow: stub(),
      getColumn: stub(),
    } as unknown as GoogleAppsScript.Spreadsheet.Range;
    sheetStub = {
      getRange: stub().returns(rangeStub),
      getName: stub(),
    } as unknown as GoogleAppsScript.Spreadsheet.Sheet;
    spreadsheetStub = {
      getSheetByName: stub().returns(sheetStub),
    } as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
    global.SpreadsheetApp = {
      getActiveSpreadsheet: () =>
        spreadsheetStub as GoogleAppsScript.Spreadsheet.Spreadsheet,
    } as unknown as GoogleAppsScript.Spreadsheet.SpreadsheetApp;

    // Event stubs
    eventSheetStub = {
      getName: stub(),
    } as unknown as GoogleAppsScript.Spreadsheet.Sheet;
    eventRangeStub = {
      getNumRows: stub(),
      getNumColumns: stub(),
      getRow: stub(),
      getColumn: stub(),
      getSheet: stub().returns(eventSheetStub),
    } as unknown as GoogleAppsScript.Spreadsheet.Range;
    eventSpreadsheetStub = {
      getSheetByName: stub().returns(eventSheetStub),
    } as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
    event = {
      range: eventRangeStub,
      source: eventSpreadsheetStub,
      oldValue: null,
      value: null,
    } as unknown as GoogleAppsScript.Events.SheetsOnEdit;
  });

  teardown(function () {
    restore();
  });

  suite("shouldHandle()", function () {
    test("should match exact range matches", function () {
      // Target range: A1:B2
      (rangeStub.getRow as sinon.SinonStub).returns(1);
      (rangeStub.getColumn as sinon.SinonStub).returns(2);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: A1:B2
      (eventRangeStub.getRow as sinon.SinonStub).returns(1);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(2);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "A1:B2");
      const result = adapter.shouldHandle();

      assert.isTrue(result);
    });

    test("should match horizontally overlapping ranges from the left", function () {
      // Target range: C1:D2
      (rangeStub.getRow as sinon.SinonStub).returns(1);
      (rangeStub.getColumn as sinon.SinonStub).returns(4);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: B1:C2
      (eventRangeStub.getRow as sinon.SinonStub).returns(1);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(3);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(2);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "C1:D2");
      const result = adapter.shouldHandle();

      assert.isTrue(result);
    });

    test("should match horizontally overlapping ranges from the right", function () {
      // Target range: B1:C2
      (rangeStub.getRow as sinon.SinonStub).returns(1);
      (rangeStub.getColumn as sinon.SinonStub).returns(3);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: C1:D2
      (eventRangeStub.getRow as sinon.SinonStub).returns(1);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(4);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(2);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "B1:C2");
      const result = adapter.shouldHandle();

      assert.isTrue(result);
    });

    test("should match vertically overlapping ranges from the top", function () {
      // Target range: A2:B3
      (rangeStub.getRow as sinon.SinonStub).returns(2);
      (rangeStub.getColumn as sinon.SinonStub).returns(2);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: A1:B2
      (eventRangeStub.getRow as sinon.SinonStub).returns(1);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(2);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "A2:B3");
      const result = adapter.shouldHandle();

      assert.isTrue(result);
    });

    test("should match vertically overlapping ranges from the bottom", function () {
      // Target range: A1:B2
      (rangeStub.getRow as sinon.SinonStub).returns(1);
      (rangeStub.getColumn as sinon.SinonStub).returns(2);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: A2:B3
      (eventRangeStub.getRow as sinon.SinonStub).returns(2);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(2);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "A1:B2");
      const result = adapter.shouldHandle();

      assert.isTrue(result);
    });

    test("should match single cell with range", function () {
      // Target range: A1:B2
      (rangeStub.getRow as sinon.SinonStub).returns(1);
      (rangeStub.getColumn as sinon.SinonStub).returns(1);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: A1
      (eventRangeStub.getRow as sinon.SinonStub).returns(1);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(1);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(1);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(1);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "A1:B2");
      const result = adapter.shouldHandle();

      assert.isTrue(result);
    });

    test("should match big event with small target range", function () {
      // Target range: B2:C3
      (rangeStub.getRow as sinon.SinonStub).returns(2);
      (rangeStub.getColumn as sinon.SinonStub).returns(2);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: A1:D4
      (eventRangeStub.getRow as sinon.SinonStub).returns(1);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(1);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(4);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(4);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "B2:C3");
      const result = adapter.shouldHandle();

      assert.isTrue(result);
    });

    test("should not match non-overlapping ranges", function () {
      // Target range: A1:B2
      (rangeStub.getRow as sinon.SinonStub).returns(1);
      (rangeStub.getColumn as sinon.SinonStub).returns(1);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      // Event range: C3:D4
      (eventRangeStub.getRow as sinon.SinonStub).returns(3);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(3);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(2);

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "A1:B2");
      const result = adapter.shouldHandle();

      assert.isFalse(result);
    });

    test("should not match on different sheets despite exact range match", function () {
      // Target range: A1:B2
      (rangeStub.getRow as sinon.SinonStub).returns(1);
      (rangeStub.getColumn as sinon.SinonStub).returns(2);
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);
      (sheetStub.getName as sinon.SinonStub).returns("Sheet1");
      // Event range: A1:B2
      (eventRangeStub.getRow as sinon.SinonStub).returns(1);
      (eventRangeStub.getColumn as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumRows as sinon.SinonStub).returns(2);
      (eventRangeStub.getNumColumns as sinon.SinonStub).returns(2);
      (eventSheetStub.getName as sinon.SinonStub).returns("Sheet2");

      adapter = new GSheetsEditEventAdapter(event, "Sheet1", "A1:B2");
      const result = adapter.shouldHandle();

      assert.isFalse(result);
    });
  });
});
