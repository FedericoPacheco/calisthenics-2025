import { suite, test, setup, teardown } from 'mocha';
import { assert } from 'chai';
import { computeIntensityVolumeMatrix } from '../../../src/periodization/IntensityVolumeDecisionMatrix';

suite('e1RMMatrix', function () {
  suite('computeE1RMMatrix()', function () {
    test('should compute e1RM matrix correctly', function () {
      const axes = {
        fractions: [1, 0.75, 0.5],
        reps: [1, 3, 5],
      };
      const input = {
        previousE1RM: 100,
        requiredRPE: 10,
        bw: 72,
      };

      const result = computeIntensityVolumeMatrix(axes, input);

      assert.deepEqual(result, [
        [2.5, 12.5, 22.5],
        [-23.75, -15, -5],
        [-48.75, -41.25, -33.75],
      ]);
    });
  });
});
