import { suite, test, setup, teardown } from 'mocha';
import { assert } from 'chai';
import { createStubInstance, restore } from 'sinon';
import { STControlPanel } from '../../../src/routine/controlPanel/ControlPanelTemplateMethod';
import SpreadsheetIOAdapter from '../../../src/utils/SpreadsheetIOAdapter';

suite('STControlPanel', function () {
  let controlPanel: STControlPanel;
  let inputStub1: SpreadsheetIOAdapter, inputStub2: SpreadsheetIOAdapter;
  let outputStub: SpreadsheetIOAdapter;

  setup(function () {
    inputStub1 = createStubInstance(SpreadsheetIOAdapter);
    inputStub2 = createStubInstance(SpreadsheetIOAdapter);
    outputStub = createStubInstance(SpreadsheetIOAdapter);
    controlPanel = new STControlPanel([inputStub1, inputStub2], outputStub, 2, {
      previous1RM: 80,
      bw: 72,
    });
  });

  teardown(function () {
    restore();
  });

  suite('parseEntry()', function () {
    test('should parse entry correctly', function () {
      // sets, reps, targetRPE, intensity1, RPE1, TEC1, ..., intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
      (inputStub1.read as any).onCall(0).returns([[3, 5, 6]]);
      (inputStub1.read as any)
        .onCall(1)
        .returns([[80, 6, 8, 75, 6, 8, 70, 6, 8, 6, 8]]);

      const entry = controlPanel.parseEntry(inputStub1);

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

  suite('computeMetrics()', function () {
    test('should compute metrics correctly', function () {
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
            e1RMChange: [25.42, 24.6, 23.6],
            totalVolume: 15,
          },
          {
            RPEStability: [1, 0],
            avgTEC: 7.5,
            e1RMChange: [26.55, 26.07],
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

  suite('transform()', function () {
    test('should transform data correctly', function () {
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
            e1RMChange: [25.42, 24.6, 23.6],
            totalVolume: 15,
          },
          {
            RPEStability: [1, 0],
            avgIntensity: 87.5,
            avgTEC: 7.5,
            e1RMChange: [26.55, 26.07],
            totalVolume: 8,
          },
        ],
        global: {
          movingAverageIntensity: [80, 77.5, 75, 78.33, 81.67],
        },
      };

      const transformed = controlPanel.transform(entryData, metricsData);

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, RPEStability, intensity, movingAvgIntensity, e1RMChange
      assert.deepEqual(transformed, [
        [1, 3, 5, 15, 8, 7, 1, 80, 80, 25.42],
        [2, 3, 5, 15, 8, 8, 0, 75, 77.5, 24.6],
        [3, 3, 5, 15, 8, 8, -1, 70, 75, 23.6],
        [4, 2, 4, 8, 9, 7, 1, 90, 78.33, 26.55],
        [5, 2, 4, 8, 9, 8, 0, 85, 81.67, 26.07],
      ]);
    });
  });

  suite('run()', function () {
    test('should run the control panel process correctly', function () {
      // sets, reps, targetRPE, intensity1, RPE1, TEC1, ..., intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
      (inputStub1.read as any).onCall(0).returns([[2, 12, 4]]);
      (inputStub1.read as any)
        .onCall(1)
        .returns([[11.24, 3, 9, 11.25, 5, 10, '', '', '', 4.0, 9.5]]);

      (inputStub1.read as any).onCall(2).returns([[2, 10, 5]]);
      (inputStub1.read as any)
        .onCall(3)
        .returns([[25, 3, 9, 30, 5, 9, '', '', '', 4.0, 9.0]]);

      (inputStub2.read as any).onCall(0).returns([[3, 12, 6]]);
      (inputStub2.read as any)
        .onCall(1)
        .returns([[38.75, 7, 7, 33.75, 8, 7, 23.75, 6, 8, 7.0, 7.3]]);

      (inputStub2.read as any).onCall(2).returns([[3, 10, 7]]);
      (inputStub2.read as any)
        .onCall(3)
        .returns([[52.5, 7.5, 7.5, 50, 7, 7.5, 45.0, 7, 7, 7.2, 7.3]]);

      controlPanel.run();

      // seqNumber, sets, reps, totalVolume, targetRPE, TEC, RPEStability, intensity, movingAvgIntensity, e1RMChange
      assert.deepEqual((outputStub.write as any).getCall(0).args[0], [
        [1, 2, 12, 24, 4, 9, -1, 11.24, 11.24, -6.7],
        [2, 2, 12, 24, 4, 10, 1, 11.25, 11.25, -16.36],
        [3, 3, 12, 36, 6, 7, 1, 38.75, 20.41, 17.08],
        [4, 3, 12, 36, 6, 7, 2, 33.75, 27.92, 4.45],
        [5, 3, 12, 36, 6, 8, 0, 23.75, 32.08, -1.04],
        [6, 2, 10, 20, 5, 9, -2, 25, 27.5, 6.05],
        [7, 2, 10, 20, 5, 9, 0, 30, 26.25, 3.72],
        [8, 3, 10, 30, 7, 7.5, 0.5, 52.5, 35.83, 23.89],
        [9, 3, 10, 30, 7, 7.5, 0, 50, 44.17, 23],
        [10, 3, 10, 30, 7, 7, 0, 45, 49.17, 15.83],
      ]);
    });
  });
});
