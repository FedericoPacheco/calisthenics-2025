import { suite, test, setup, teardown } from 'mocha';
import { assert } from 'chai';
import GeneralUtils from '../../src/utils/GeneralUtils';

suite('GeneralUtils', function () {
  suite('tranpose()', function () {
    test('should transpose a matrix correctly', function () {
      const A = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      const result = GeneralUtils.transpose(A);

      assert.deepEqual(result, [
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
      ]);
    });
  });
});
