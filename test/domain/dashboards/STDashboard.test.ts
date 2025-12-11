import { suite, test, setup, teardown } from "mocha";
import { assert } from "chai";
import { stub, restore } from "sinon";
import { STDashboard } from "../../../src/domain/dashboards/STDashboard";
import { IOPort } from "../../../src/domain/ports/IOPort";

suite("STDashboard", function () {
  let controlPanel: STDashboard;
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
    const minSetsJumpPerMicrocycle = [2, 2];
    controlPanel = new STDashboard(
      [inputStub1, inputStub2],
      outputStub,
      minSetsJumpPerMicrocycle.length,
      {
        previous1RM: 80,
        minSetsJumpPerMicrocycle,
      }
    );
  });

  teardown(function () {
    restore();
  });

  suite("parseEntry()", function () {
    test("should parse entry correctly", function () {
      // sets, reps, targetRPE, intensity1, RPE1, TEC1, ..., intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
      (inputStub1.read as any).onCall(0).returns([[3, 5, 6]]);
      (inputStub1.read as any)
        .onCall(1)
        .returns([[80, 6, 8, 75, 6, 8, 70, 6, 8, 6, 8]]);

      const entry = controlPanel.parseEntry(inputStub1, 0);

      assert.deepEqual(entry, {
        sets: 3,
        reps: 5,
        targetRPE: 6,
        intensity: [80, 75, 70],
        RPE: [6, 6, 6],
        TEC: [8, 8, 8],
      });
    });
  });

  suite("computeMetrics()", function () {
    test("should compute metrics correctly", function () {
      const entryData = [
        {
          sets: 3,
          reps: 5,
          targetRPE: 8,
          intensity: [80, 75, 70],
          RPE: [9, 8, 7],
          TEC: [7, 8, 8],
        },
        {
          sets: 2,
          reps: 4,
          targetRPE: 9,
          intensity: [90, 85],
          RPE: [10, 9],
          TEC: [7, 8],
        },
      ];

      const metrics = controlPanel.computeMetrics(entryData);

      assert.deepEqual(metrics, {
        entry: [
          {
            RPEStability: [1, 0, -1],
            avgTEC: 7.67,
            totalVolume: 15,
            relativeIntensity: [1, 0.94, 0.88],
          },
          {
            RPEStability: [1, 0],
            avgTEC: 7.5,
            totalVolume: 8,
            relativeIntensity: [1.13, 1.06],
          },
        ],
        global: {
          // Use 3 last data points
          movingAverageRelativeIntensity: [1, 0.97, 0.94, 0.98, 1.02],
        },
      });
    });
  });

  suite("transform()", function () {
    test("should transform data correctly", function () {
      const entryData = [
        {
          sets: 3,
          reps: 5,
          targetRPE: 8,
          intensity: [80, 75, 70],
          RPE: [9, 8, 7],
          TEC: [7, 8, 8],
        },
        {
          sets: 2,
          reps: 4,
          targetRPE: 9,
          intensity: [90, 85],
          RPE: [10, 9],
          TEC: [7, 8],
        },
      ];
      const metricsData = {
        entry: [
          {
            RPEStability: [1, 0, -1],
            avgTEC: 7.67,
            totalVolume: 15,
            relativeIntensity: [1, 0.94, 0.88],
          },
          {
            RPEStability: [1, 0],
            avgTEC: 7.5,
            totalVolume: 8,
            relativeIntensity: [1.13, 1.06],
          },
        ],
        global: {
          movingAverageRelativeIntensity: [1, 0.97, 0.94, 0.98, 1.02],
        },
      };

      const transformed = controlPanel.transform(entryData, metricsData);

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, RPEStability, intensity, movingAvgIntensity
      assert.deepEqual(transformed, [
        [1, 3, 5, 15, 8, 7, 1, 1, 1],
        [2, 3, 5, 15, 8, 8, 0, 0.94, 0.97],
        [3, 3, 5, 15, 8, 8, -1, 0.88, 0.94],
        [4, 2, 4, 8, 9, 7, 1, 1.13, 0.98],
        [5, 2, 4, 8, 9, 8, 0, 1.06, 1.02],
      ]);
    });
  });

  suite("run()", function () {
    test("should run the control panel process correctly", function () {
      // sets, reps, targetRPE, intensity1, RPE1, TEC1, ..., intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
      (inputStub1.read as any).onCall(0).returns([[2, 12, 4]]);
      (inputStub1.read as any)
        .onCall(1)
        .returns([[11.25, 3, 9, 11.25, 5, 10, "", "", "", 4.0, 9.5]]);

      (inputStub1.read as any).onCall(2).returns([[2, 10, 5]]);
      (inputStub1.read as any)
        .onCall(3)
        .returns([[25, 3, 9, 30, 5, 9, "", "", "", 4.0, 9.0]]);

      (inputStub2.read as any).onCall(0).returns([[3, 12, 6]]);
      (inputStub2.read as any)
        .onCall(1)
        .returns([[38.75, 7, 7, 33.75, 8, 7, 23.75, 6, 8, 7.0, 7.3]]);

      (inputStub2.read as any).onCall(2).returns([[3, 10, 7]]);
      (inputStub2.read as any)
        .onCall(3)
        .returns([[52.5, 7.5, 7.5, 50, 7, 7.5, 45.0, 7, 7, 7.2, 7.3]]);

      controlPanel.run();

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, RPEStability, relativeIntensity, movingAvgRelativeIntensity
      assert.deepEqual((outputStub.write as any).getCall(0).args[0], [
        [1, 2, 12, 24, 4, 9, -1, 0.14, 0.14],
        [2, 2, 12, 24, 4, 10, 1, 0.14, 0.14],
        [3, 3, 12, 36, 6, 7, 1, 0.48, 0.25],
        [4, 3, 12, 36, 6, 7, 2, 0.42, 0.35],
        [5, 3, 12, 36, 6, 8, 0, 0.30, 0.40],
        [6, 2, 10, 20, 5, 9, -2, 0.31, 0.34],
        [7, 2, 10, 20, 5, 9, 0, 0.38, 0.33],
        [8, 3, 10, 30, 7, 7.5, 0.5, 0.66, 0.45],
        [9, 3, 10, 30, 7, 7.5, 0, 0.63, 0.56],
        [10, 3, 10, 30, 7, 7, 0, 0.56, 0.62],
      ]);
    });
  });
});
