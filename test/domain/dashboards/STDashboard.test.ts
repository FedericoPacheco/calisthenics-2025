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
    controlPanel = new STDashboard([inputStub1, inputStub2], outputStub, 2, {
      previous1RM: 80,
      minSetsJumpPerMicrocycle: [2, 2],
      startSequenceNumber: 1,
    });
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
            totalVolume: 15,
            relativeIntensity: [100, 93.75, 87.5],
          },
          {
            RPEStability: [1, 0],
            totalVolume: 8,
            relativeIntensity: [112.5, 106.25],
          },
        ],
        global: {
          // Use 3 last data points
          movingAvgRelativeIntensity: [100, 96.88, 93.75, 97.92, 102.08],
          movingAvgTEC: [7, 7.5, 7.67, 7.67, 7.67],
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
            totalVolume: 15,
            relativeIntensity: [100, 93.75, 87.5],
          },
          {
            RPEStability: [1, 0],
            totalVolume: 8,
            relativeIntensity: [112.5, 106.25],
          },
        ],
        global: {
          movingAvgRelativeIntensity: [100, 96.88, 93.75, 97.92, 102.08],
          movingAvgTEC: [7, 7.5, 7.67, 7.67, 7.67],
        },
      };

      const transformed = controlPanel.transform(entryData, metricsData);

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, avg TEC per session, RPEStability, intensity, movingAvgIntensity
      assert.deepEqual(transformed, [
        [1, 3, 5, 15, 8, 7, 7, 1, 100, 100],
        [2, 3, 5, 15, 8, 8, 7.5, 0, 93.75, 96.88],
        [3, 3, 5, 15, 8, 8, 7.67, -1, 87.5, 93.75],
        [4, 2, 4, 8, 9, 7, 7.67, 1, 112.5, 97.92],
        [5, 2, 4, 8, 9, 8, 7.67, 0, 106.25, 102.08],
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

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, avg TEC per session, RPEStability, relativeIntensity, movingAvgRelativeIntensity
      assert.deepEqual((outputStub.write as any).getCall(0).args[0], [
        [1, 2, 12, 24, 4, 9, 9.0, -1, 14.06, 14.06],
        [2, 2, 12, 24, 4, 10, 9.5, 1, 14.06, 14.06],
        [3, 3, 12, 36, 6, 7, 8.67, 1, 48.44, 25.52],
        [4, 3, 12, 36, 6, 7, 8.0, 2, 42.19, 34.9],
        [5, 3, 12, 36, 6, 8, 7.33, 0, 29.69, 40.11],
        [6, 2, 10, 20, 5, 9, 8.0, -2, 31.25, 34.38],
        [7, 2, 10, 20, 5, 9, 8.67, 0, 37.5, 32.81],
        [8, 3, 10, 30, 7, 7.5, 8.5, 0.5, 65.63, 44.79],
        [9, 3, 10, 30, 7, 7.5, 8.0, 0, 62.5, 55.21],
        [10, 3, 10, 30, 7, 7, 7.33, 0, 56.25, 61.46],
      ]);
    });
  });
});
