import { suite, test } from "mocha";
import { assert } from "chai";
import LinAlgUtils from "../../../src/domain/utils/LinAlgUtils";

suite("LinAlgUtils", function () {
  suite("tranpose()", function () {
    test("should transpose a matrix correctly", function () {
      const A = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ];

      const result = LinAlgUtils.transpose(A);

      assert.deepEqual(result, [
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9],
      ]);
    });
  });

  suite("split()", function () {
    test("should split an array into multiple chunks of specified size", function () {
      const arr = [1, 2, 3, 4, 5];
      const size = 2;

      const result = LinAlgUtils.split(arr, size);

      assert.deepEqual(result, [[1, 2], [3, 4], [5]]);
    });
  });
});
