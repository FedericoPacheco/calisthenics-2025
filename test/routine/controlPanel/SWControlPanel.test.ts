import { suite, test, setup, teardown } from "mocha";
import { assert } from "chai";
import { createStubInstance, restore } from "sinon";
import { SWControlPanel } from "../../../src/routine/controlPanel/SWControlPanel";
import SpreadsheetIOAdapter from "../../../src/utils/SpreadsheetIOAdapter";

suite("STControlPanel", function () {
  let controlPanel: SWControlPanel;
  let inputStub1: SpreadsheetIOAdapter, inputStub2: SpreadsheetIOAdapter;
  let outputStub: SpreadsheetIOAdapter;

  setup(function () {
    inputStub1 = createStubInstance(SpreadsheetIOAdapter);
    inputStub2 = createStubInstance(SpreadsheetIOAdapter);
    outputStub = createStubInstance(SpreadsheetIOAdapter);
    controlPanel = new SWControlPanel(
      [inputStub1, inputStub2],
      outputStub,
      2,
      {}
    );
  });

  teardown(function () {
    restore();
  });

  suite.skip("should run the control panel process correctly", function () {
    // Row format: sets, reps, suggested intensity, left fingers arr, right fingers arr, TEC arr
    (inputStub1.read as any)
      .onCall(0)
      .returns([[3, '10"', "L: 1 finger (index), R: 1 finger (index)"]]);
    (inputStub1.read as any).onCall(1).returns([1, 1, 2, 2, 1, 3, 7, 8, 9]);
    (inputStub1.read as any)
      .onCall(2)
      .returns([[3, '15"', "L: 1 finger (index), R: 1 finger (index)"]]);
    (inputStub1.read as any).onCall(3).returns([3, 4, 5, 5, 4, 3, 7, 8, 9]);

    (inputStub2.read as any)
      .onCall(0)
      .returns([[3, '10"', "L: 1 finger (index), R: 1 finger (index)"]]);
    (inputStub2.read as any).onCall(1).returns([1, 1, 1, 1, 1, 2, 8, 8, 7]);
    (inputStub2.read as any)
      .onCall(2)
      .returns([[3, '15"', "L: 1 finger (index), R: 1 finger (index)"]]);
    (inputStub2.read as any).onCall(3).returns([0, 1, 2, 2, 1, 0, 8, 8, 7]);

    controlPanel.run();

    // Output format: seq (microcycle), left and right median fingers, median TEC, left and right usage per finger (5, 4, 3, 2, 1, 0)
    assert.deepEqual((outputStub.write as any).getCall(0).args[0], [
      1,
      ...[1, 1],
      8,
      ...[0.0, 0.0, 0.0, 0.17, 0.83, 0.0],
      ...[0.0, 0.0, 0.17, 0.33, 0.5, 0.0],
      2,
      ...[2.5, 2.5],
      8,
      ...[0.17, 0.17, 0.17, 0.17, 0.17, 0.17],
      ...[0.17, 0.17, 0.17, 0.17, 0.17, 0.17],
    ]);
  });

  suite("parseEntry()", function () {
    test("should parse the entry data correctly", function () {
      (inputStub1.read as any)
        .onCall(0)
        .returns([[3, '10"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub1.read as any).onCall(1).returns([1, 1, 2, 2, 1, 3, 7, 8, 9]);

      const entry = controlPanel.parseEntry(inputStub1, 0);

      assert.deepEqual(entry, {
        sets: 3,
        reps: '10"',
        suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
        leftIntensity: [1, 2, 3],
        rightIntensity: [2, 1, 3],
        TEC: [7, 8, 9],
      });
    });
  });
});
