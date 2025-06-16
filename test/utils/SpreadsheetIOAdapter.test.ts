import { suite, test, setup, teardown } from "mocha";
import { assert } from "chai";
import { stub, restore } from "sinon";
import SpreadsheetIOAdapter from "../../src/utils/SpreadsheetIOAdapter";

// Docs:
// https://developers.google.com/apps-script/reference/spreadsheet/sheet
// https://developers.google.com/apps-script/reference/spreadsheet/range

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({}) as GoogleAppsScript.Spreadsheet.Spreadsheet,
} as GoogleAppsScript.Spreadsheet.SpreadsheetApp;

suite("SpreadsheetIOAdapter", function () {
  let spreadsheetStub: GoogleAppsScript.Spreadsheet.Spreadsheet,
    rangeStub: GoogleAppsScript.Spreadsheet.Range,
    sheetStub: GoogleAppsScript.Spreadsheet.Sheet;

  setup(function () {
    rangeStub = {
      setValue: stub(),
      setValues: stub(),
      getValue: stub(),
      getValues: stub(),
      getNumRows: stub(),
      getNumColumns: stub(),
      getRow: stub(),
      getColumn: stub(),
      getA1Notation: stub(),
    } as unknown as GoogleAppsScript.Spreadsheet.Range;
    sheetStub = {
      getRange: stub().returns(rangeStub),
    } as unknown as GoogleAppsScript.Spreadsheet.Sheet;
    spreadsheetStub = {
      getSheetByName: stub(),
    } as unknown as GoogleAppsScript.Spreadsheet.Spreadsheet;
    stub(SpreadsheetApp, "getActiveSpreadsheet").returns(spreadsheetStub);
  });

  suite("constructor", function () {
    teardown(function () {
      restore();
    });

    test("throws if sheet not found", function () {
      (spreadsheetStub.getSheetByName as sinon.SinonStub).returns(null);
      assert.throws(
        () => new SpreadsheetIOAdapter("UnknownSheet", "A1"),
        'Sheet "UnknownSheet" not found'
      );
    });

    test("throws if invalid default reference", function () {
      (spreadsheetStub.getSheetByName as sinon.SinonStub).returns(sheetStub);
      assert.throws(
        () => new SpreadsheetIOAdapter("Sheet1", "InvalidRef"),
        /Invalid reference/
      );
    });

    test("constructs with valid params", function () {
      (spreadsheetStub.getSheetByName as sinon.SinonStub).returns(sheetStub);
      assert.doesNotThrow(() => new SpreadsheetIOAdapter("Sheet1", "A1"));
    });
  });

  suite("read", function () {
    let IOAdapter: SpreadsheetIOAdapter;

    setup(function () {
      (spreadsheetStub.getSheetByName as sinon.SinonStub).returns(sheetStub);
      IOAdapter = new SpreadsheetIOAdapter("Sheet1");
    });

    teardown(function () {
      restore();
    });

    test("reads value when it's a cell", function () {
      (rangeStub.getValue as sinon.SinonStub).returns("someValue");

      const result = IOAdapter.read("A1");

      assert((rangeStub.getValue as sinon.SinonStub).calledOnce);
      assert.strictEqual(result, "someValue");
    });

    test("reads array of values when it's a range", function () {
      (rangeStub.getValues as sinon.SinonStub).returns([["v1", "v2"]]);

      const result = IOAdapter.read("A1:B1");

      assert((rangeStub.getValues as sinon.SinonStub).calledOnce);
      assert.deepEqual(result, [["v1", "v2"]]);
    });

    test("throws on read error", function () {
      sheetStub.getRange = stub().throws(new Error("Some error"));

      assert.throws(() => IOAdapter.read("A1"), /Error reading reference/);
    });

    test("truncates empty data, accounting for minimum rows and cols", function () {
      (rangeStub.getValues as sinon.SinonStub).returns([
        ["v1", "v2", "", "", ""],
        ["v3", "v4", "v5", "", ""],
        ["v6", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ]);

      const result = IOAdapter.read("A1:B4", 4, 4);

      assert.deepEqual(result, [
        ["v1", "v2", "", ""],
        ["v3", "v4", "v5", ""],
        ["v6", "", "", ""],
        ["", "", "", ""],
      ]);
    });
  });

  suite("write", function () {
    let IOAdapter: SpreadsheetIOAdapter;

    setup(function () {
      (spreadsheetStub.getSheetByName as sinon.SinonStub).returns(sheetStub);
      IOAdapter = new SpreadsheetIOAdapter("Sheet1");
    });

    teardown(function () {
      restore();
    });

    test("writes single value to cell", function () {
      IOAdapter.write("newValue", "A1");

      assert(
        (rangeStub.setValue as sinon.SinonStub).calledOnceWith("newValue")
      );
    });

    test("writes matrix to cell (takes first element of first row)", function () {
      IOAdapter.write(
        [
          ["val1", "val2"],
          ["val3", "val4"],
        ],
        "A1"
      );

      assert((rangeStub.setValue as sinon.SinonStub).calledOnceWith("val1"));
    });

    test("writes matrix to range (equal size)", function () {
      (rangeStub.getNumRows as sinon.SinonStub).returns(1);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);

      IOAdapter.write([["v1", "v2"]], "A1:B1");

      assert(
        (rangeStub.setValues as sinon.SinonStub).calledOnceWith([["v1", "v2"]])
      );
    });

    test("writes small matrix to range adding padding (both axis)", function () {
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);

      IOAdapter.write([["v1"]], "A1:B2");

      assert(
        (rangeStub.setValues as sinon.SinonStub).calledOnceWith([
          ["v1", ""],
          ["", ""],
        ])
      );
    });

    test("writes big matrix to range slicing excess data (both axis)", function () {
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);

      IOAdapter.write(
        [
          ["v1", "v2", "v3"],
          ["v4", "v5", "v6"],
          ["v7", "v8", "v9"],
        ],
        "A1:B2"
      );

      assert(
        (rangeStub.setValues as sinon.SinonStub).calledOnceWith([
          ["v1", "v2"],
          ["v4", "v5"],
        ])
      );
    });

    test("writes mixed matrix to range adding padding to rows and slicing cols", function () {
      (rangeStub.getNumRows as sinon.SinonStub).returns(3);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);

      IOAdapter.write(
        [
          ["v1", "v2", "v3"],
          ["v4", "v5", "v6"],
        ],
        "A1:B3"
      );

      assert(
        (rangeStub.setValues as sinon.SinonStub).calledOnceWith([
          ["v1", "v2"],
          ["v4", "v5"],
          ["", ""],
        ])
      );
    });

    test("writes mixed matrix to range slicing rows and adding padding to cols", function () {
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(4);

      IOAdapter.write(
        [
          ["v1", "v2", "v3"],
          ["v4", "v5", "v6"],
          ["v7", "v8", "v9"],
        ],
        "A1:D2"
      );

      assert(
        (rangeStub.setValues as sinon.SinonStub).calledOnceWith([
          ["v1", "v2", "v3", ""],
          ["v4", "v5", "v6", ""],
        ])
      );
    });

    test("writes single value to range", function () {
      (rangeStub.getNumRows as sinon.SinonStub).returns(2);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(2);

      IOAdapter.write("v1", "A1:B2");

      assert(
        (rangeStub.setValues as sinon.SinonStub).calledOnceWith([
          ["v1", "v1"],
          ["v1", "v1"],
        ])
      );
    });

    test("throws on write array to single cell", function () {
      assert.throws(
        () => IOAdapter.write(["v1", "v2"], "A1"),
        /Unsupported data structure/
      );
    });

    test("throws on write array to range", function () {
      assert.throws(
        () => IOAdapter.write(["v1", "v2"], "A1:B2"),
        /Unsupported data structure/
      );
    });

    test("throws if no data", function () {
      assert.throws(
        () => IOAdapter.write(undefined, "A1"),
        /Data not provided/
      );
    });

    test("throws on write error", function () {
      (rangeStub.setValue as sinon.SinonStub).throws(new Error("Write error"));
      assert.throws(
        () => IOAdapter.write("data", "A1"),
        /Error writing to reference/
      );
    });
  });

  suite("moveReference()", function () {
    let IOAdapter: SpreadsheetIOAdapter;

    setup(function () {
      (spreadsheetStub.getSheetByName as sinon.SinonStub).returns(sheetStub);
      IOAdapter = new SpreadsheetIOAdapter("Sheet1", "B2:D4");
    });

    teardown(function () {
      restore();
    });

    test("moves matrix reference correctly", function () {
      (rangeStub.getRow as sinon.SinonStub).returns(2);
      (rangeStub.getColumn as sinon.SinonStub).returns(2);
      (rangeStub.getNumRows as sinon.SinonStub).returns(3);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(3);

      // From B2:D4, move to E4:G6
      IOAdapter.moveReference(2, 3);

      assert.isTrue(
        (sheetStub.getRange as sinon.SinonStub).calledWith(4, 5, 3, 3)
      );
    });
  });

  suite("resizeReference()", function () {
    let IOAdapter: SpreadsheetIOAdapter;

    setup(function () {
      (spreadsheetStub.getSheetByName as sinon.SinonStub).returns(sheetStub);
      IOAdapter = new SpreadsheetIOAdapter("Sheet1", "B2:D4");
    });

    teardown(function () {
      restore();
    });

    test("resizes matrix reference correctly", function () {
      (rangeStub.getRow as sinon.SinonStub).returns(2);
      (rangeStub.getColumn as sinon.SinonStub).returns(2);
      (rangeStub.getNumRows as sinon.SinonStub).returns(3);
      (rangeStub.getNumColumns as sinon.SinonStub).returns(3);

      IOAdapter.resizeReference(4, 5);

      assert.isTrue(
        (sheetStub.getRange as sinon.SinonStub).calledWith(2, 2, 4, 5)
      );
    });
  });
});
