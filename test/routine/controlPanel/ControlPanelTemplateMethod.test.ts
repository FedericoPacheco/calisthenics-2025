import { suite, test, setup, teardown } from "mocha";
import { assert } from "chai";
import { stub, createStubInstance, restore } from "sinon";
import { STControlPanel } from "../../../src/routine/controlPanel/TrainingDataReaderTemplateMethod";
import SpreadsheetIOAdapter from "../../../src/utils/SpreadsheetIOAdapter";

suite("STControlPanel", function () {
  let controlPanel: STControlPanel;
  let inputStub1: SpreadsheetIOAdapter, inputStub2: SpreadsheetIOAdapter;
  let outputStub: SpreadsheetIOAdapter;

  setup(function () {
    inputStub1 = createStubInstance(SpreadsheetIOAdapter);
    inputStub2 = createStubInstance(SpreadsheetIOAdapter);
    outputStub = createStubInstance(SpreadsheetIOAdapter);
    controlPanel = new STControlPanel([inputStub1, inputStub2], outputStub, 2);
  });

  teardown(function () {
    restore();
  });

  suite("parseEntry()", function () {
    test("should parse entry correctly", function () {
      (inputStub1.read as any).returns([
        3,
        5,
        6,
        "Str",
        6,
        8,
        "Adv one leg",
        6,
        8,
        "Adv tuck",
        6,
        8,
        6,
        8,
      ]);

      const result = controlPanel.parseEntry(inputStub1);

      //   assert.isTrue((inputStub1.moveReference as any).calledOnce);
      assert.deepEqual(result, {
        sets: 3,
        reps: 5,
        targetRPE: 6,
        intensity: ["Str", "Adv one leg", "Adv tuck"],
        RPE: [6, 6, 6],
        TEC: [8, 8, 8],
      });
    });
  });
});
