import { suite, test, setup, teardown } from "mocha";
import { assert } from "chai";
import { stub, restore } from "sinon";
import { IOPort } from "../../../src/domain/ports/IOPort";
import { SWDashboardV2 } from "../../../src/domain/dashboards/SWDashboardV2";

suite("SWDashboardV2", function () {
  let controlPanel: SWDashboardV2;
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
    controlPanel = new SWDashboardV2([inputStub1, inputStub2], outputStub, 2, {
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
      (inputStub1.read as any)
        .onCall(1)
        .returns([[1, 1, 2, 2, 1, 3, 7, 8, 9, 6, 6, 7]]);
      (inputStub1.read as any)
        .onCall(2)
        .returns([[3, '15"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub1.read as any)
        .onCall(3)
        .returns([[3, 4, 5, 5, 4, 3, 7, 8, 9, 7, 8, 6]]);

      (inputStub2.read as any)
        .onCall(0)
        .returns([[3, '10"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub2.read as any)
        .onCall(1)
        .returns([[1, 1, 1, 1, 1, 2, 8, 8, 7, 6, 7, 7]]);
      (inputStub2.read as any)
        .onCall(2)
        .returns([[3, '15"', "L: 1 finger (index), R: 1 finger (index)"]]);
      (inputStub2.read as any)
        .onCall(3)
        .returns([[0, 1, 2, 2, 1, 0, 8, 8, 7, 7, 8, 7]]);

      controlPanel.run();

      /* Output format: 
          seq (microcycle), 
          left  median fingers per microcycle and mesocycle,
          right median fingers per microcycle and mesocycle,
          left median TEC per microcycle and mesocycle, 
          right median TEC per microcycle and mesocycle, 
          mesocycle left and right usage per finger (10 i.e. whole palm, 5, 4, 3, 2, 1, 0)
      */
      assert.deepEqual((outputStub.write as any).getCall(0).args[0], [
        [
          1,
          ...[1, 1, 1.5, 2],
          ...[8, 8, 6.5, 7],
          ...[0.0, 0.08, 0.08, 0.08, 0.17, 0.5, 0.08],
          ...[0.0, 0.08, 0.08, 0.17, 0.25, 0.33, 0.08],
        ],
        [
          2,
          ...[2.5, 1, 2.5, 2],
          ...[8, 8, 7, 7],
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
      (inputStub1.read as any)
        .onCall(1)
        .returns([[1, 1, 2, 2, 1, 3, 7, 8, 9, 6, 6, 7]]);

      const entry = controlPanel.parseEntry(inputStub1, 0);

      assert.deepEqual(entry, {
        sets: 3,
        reps: '10"',
        suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
        leftIntensity: [1, 1, 2],
        rightIntensity: [2, 1, 3],
        leftTEC: [7, 8, 9],
        rightTEC: [6, 6, 7],
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
          leftTEC: [7, 8, 9],
          rightTEC: [6, 6, 7],
        },
        {
          sets: 3,
          reps: '10"',
          suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
          leftIntensity: [1, 1, 1],
          rightIntensity: [1, 1, 2],
          leftTEC: [8, 8, 7],
          rightTEC: [7, 8, 6],
        },
        {
          sets: 3,
          reps: '15"',
          suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
          leftIntensity: [3, 4, 5],
          rightIntensity: [5, 4, 3],
          leftTEC: [7, 8, 9],
          rightTEC: [6, 7, 7],
        },
        {
          sets: 3,
          reps: '15"',
          suggestedIntensity: "L: 1 finger (index), R: 1 finger (index)",
          leftIntensity: [0, 1, 2],
          rightIntensity: [2, 1, 0],
          leftTEC: [8, 8, 7],
          rightTEC: [7, 8, 7],
        },
      ];

      const metrics = controlPanel.computeMetrics(entryData);

      assert.deepEqual(metrics, {
        microcycle: [
          {
            medianLeftIntensity: 1,
            medianRightIntensity: 1.5,
            medianLeftTEC: 8,
            medianRightTEC: 6.5,
          },
          {
            medianLeftIntensity: 2.5,
            medianRightIntensity: 2.5,
            medianLeftTEC: 8,
            medianRightTEC: 7,
          },
        ],
        mesocycle: {
          medianLeftIntensity: 1,
          medianRightIntensity: 2,
          medianLeftTEC: 8,
          medianRightTEC: 7,
          leftFingerUsage: [0.0, 0.08, 0.08, 0.08, 0.17, 0.5, 0.08],
          rightFingerUsage: [0.0, 0.08, 0.08, 0.17, 0.25, 0.33, 0.08],
        },
      });
    });
  });
});
