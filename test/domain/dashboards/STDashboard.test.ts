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
          },
          {
            RPEStability: [1, 0],
            avgTEC: 7.5,
            totalVolume: 8,
          },
        ],
        global: {
          // Use 3 last data points
          movingAverageIntensity: [80, 77.5, 75, 78.33, 81.67],
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
            avgIntensity: 75,
            avgTEC: 7.67,
            totalVolume: 15,
          },
          {
            RPEStability: [1, 0],
            avgIntensity: 87.5,
            avgTEC: 7.5,
            totalVolume: 8,
          },
        ],
        global: {
          movingAverageIntensity: [80, 77.5, 75, 78.33, 81.67],
        },
      };

      const transformed = controlPanel.transform(entryData, metricsData);

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, RPEStability, intensity, movingAvgIntensity
      assert.deepEqual(transformed, [
        [1, 3, 5, 15, 8, 7, 1, 80, 80],
        [2, 3, 5, 15, 8, 8, 0, 75, 77.5],
        [3, 3, 5, 15, 8, 8, -1, 70, 75],
        [4, 2, 4, 8, 9, 7, 1, 90, 78.33],
        [5, 2, 4, 8, 9, 8, 0, 85, 81.67],
      ]);
    });
  });

  suite("run()", function () {
    test("should run the control panel process correctly", function () {
      // sets, reps, targetRPE, intensity1, RPE1, TEC1, ..., intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
      (inputStub1.read as any).onCall(0).returns([[2, 12, 4]]);
      (inputStub1.read as any)
        .onCall(1)
        .returns([[11.24, 3, 9, 11.25, 5, 10, "", "", "", 4.0, 9.5]]);

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

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, RPEStability, intensity, movingAvgIntensity
      assert.deepEqual((outputStub.write as any).getCall(0).args[0], [
        [1, 2, 12, 24, 4, 9, -1, 11.24, 11.24],
        [2, 2, 12, 24, 4, 10, 1, 11.25, 11.25],
        [3, 3, 12, 36, 6, 7, 1, 38.75, 20.41],
        [4, 3, 12, 36, 6, 7, 2, 33.75, 27.92],
        [5, 3, 12, 36, 6, 8, 0, 23.75, 32.08],
        [6, 2, 10, 20, 5, 9, -2, 25, 27.5],
        [7, 2, 10, 20, 5, 9, 0, 30, 26.25],
        [8, 3, 10, 30, 7, 7.5, 0.5, 52.5, 35.83],
        [9, 3, 10, 30, 7, 7.5, 0, 50, 44.17],
        [10, 3, 10, 30, 7, 7, 0, 45, 49.17],
      ]);
    });
  });
});
