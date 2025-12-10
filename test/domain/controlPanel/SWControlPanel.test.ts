import { suite, test, setup, teardown } from "mocha";
import { assert } from "chai";
import { stub, restore } from "sinon";
import { SWControlPanel } from "../../../src/domain/controlPanel/SWControlPanel";
import { IOPort } from "../../../src/domain/ports/IO";

suite("SWControlPanel", function () {
  let controlPanel: SWControlPanel;
  let inputStub1: IOPort, inputStub2: IOPort;
  let outputStub: IOPort;

  setup(function () {
    inputStub1 = {
      read: stub(),
      moveReference: stub(),
      resizeReference: stub(),
    } as any;
    inputStub2 = {
      read: stub(),
      moveReference: stub(),
      resizeReference: stub(),
    } as any;
    outputStub = { write: stub() } as any;
    controlPanel = new SWControlPanel([inputStub1, inputStub2], outputStub, 2, {
      startMicrocycle: 1,
    });
  });

  teardown(function () {
    restore();
  });

  suite("run()", function () {
    test("should run the control panel process correctly", function () {
      // Row format: sets, reps, suggested intensity, left fingers arr, right fingers arr, TEC arr
      (inputStub1.read as any)
        .onCall(0)
        .returns([[3, '10"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub1.read as any).onCall(1).returns([[1, 1, 2, 2, 1, 3, 7, 8, 9]]);
      (inputStub1.read as any)
        .onCall(2)
        .returns([[3, '15"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub1.read as any).onCall(3).returns([[3, 4, 5, 5, 4, 3, 7, 8, 9]]);

      (inputStub2.read as any)
        .onCall(0)
        .returns([[3, '10"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub2.read as any).onCall(1).returns([[1, 1, 1, 1, 1, 2, 8, 8, 7]]);
      (inputStub2.read as any)
        .onCall(2)
        .returns([[3, '15"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub2.read as any).onCall(3).returns([[0, 1, 2, 2, 1, 0, 8, 8, 7]]);

      controlPanel.run();

      /* Output format: 
          seq (microcycle), 
          left median fingers per microcycle and mesocycle, 
          right median fingers per microcycle and mesocycle, 
          median TEC, 
          mesoccyle left and right usage per finger (10 i.e. whole palm, 5, 4, 3, 2, 1, 0)
      */
      assert.deepEqual((outputStub.write as any).getCall(0).args[0], [
        [
          1,
          ...[1, 1, 1.5, 2],
          8,
          ...[0.0, 0.08, 0.08, 0.08, 0.17, 0.5, 0.08],
          ...[0.0, 0.08, 0.08, 0.17, 0.25, 0.33, 0.08],
        ],
        [
          2,
          ...[2.5, 1, 2.5, 2],
          8,
          ...[0.0, 0.08, 0.08, 0.08, 0.17, 0.5, 0.08],
          ...[0.0, 0.08, 0.08, 0.17, 0.25, 0.33, 0.08],
        ],
      ]);
    });
  });

  suite("parseEntry()", function () {
    test("should parse the entry data correctly", function () {
      (inputStub1.read as any)
        .onCall(0)
        .returns([[3, '10"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub1.read as any).onCall(1).returns([[1, 1, 2, 2, 1, 3, 7, 8, 9]]);

      const entry = controlPanel.parseEntry(inputStub1, 0);

      assert.deepEqual(entry, {
        sets: 3,
        reps: '10"',
        suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
        leftIntensity: [1, 1, 2],
        rightIntensity: [2, 1, 3],
        TEC: [7, 8, 9],
      });
    });
  });

  suite("computeMetrics()", function () {
    test("should compute metrics correctly", function () {
      const entryData = [
        {
          sets: 3,
          reps: '10"',
          suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
          leftIntensity: [1, 1, 2],
          rightIntensity: [2, 1, 3],
          TEC: [7, 8, 9],
        },
        {
          sets: 3,
          reps: '10"',
          suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
          leftIntensity: [1, 1, 1],
          rightIntensity: [1, 1, 2],
          TEC: [8, 8, 7],
        },
        {
          sets: 3,
          reps: '15"',
          suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
          leftIntensity: [3, 4, 5],
          rightIntensity: [5, 4, 3],
          TEC: [7, 8, 9],
        },
        {
          sets: 3,
          reps: '15"',
          suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
          leftIntensity: [0, 1, 2],
          rightIntensity: [2, 1, 0],
          TEC: [8, 8, 7],
        },
      ];

      const metrics = controlPanel.computeMetrics(entryData);

      assert.deepEqual(metrics, {
        microcycle: [
          {
            medianLeftIntensity: 1,
            medianRightIntensity: 1.5,
            medianTEC: 8,
          },
          {
            medianLeftIntensity: 2.5,
            medianRightIntensity: 2.5,
            medianTEC: 8,
          },
        ],
        mesocycle: {
          medianLeftIntensity: 1,
          medianRightIntensity: 2,
          leftFingerUsage: [0.0, 0.08, 0.08, 0.08, 0.17, 0.5, 0.08],
          rightFingerUsage: [0.0, 0.08, 0.08, 0.17, 0.25, 0.33, 0.08],
        },
      });
    });
  });
});
