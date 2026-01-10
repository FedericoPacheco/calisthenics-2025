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

  suite("getObjectFromMatrix()", function () {
    test("should convert matrix to array of objects correctly with passed keys", function () {
      const matrix = [
        [30, 71.3, 6, 8.5],
        [40, 71.3, 4, 9.5],
      ];
      const keys = ["weight", "bw", "reps", "rpe"];

      const result = LinAlgUtils.getObjectFromMatrix(matrix, keys);

      assert.deepEqual(result, [
        { weight: 30, bw: 71.3, reps: 6, rpe: 8.5 },
        { weight: 40, bw: 71.3, reps: 4, rpe: 9.5 },
      ]);
    });

    test("should handle mismatching keys and columns gracefully", function () {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const keys = ["a"];

      const result = LinAlgUtils.getObjectFromMatrix(matrix, keys);

      assert.deepEqual(result, [{ a: 1 }, { a: 3 }]);
    });

    test("should handle empty matrix", function () {
      const matrix: any[][] = [[]];
      const keys: string[] = ["a", "b"];

      debugger;
      const result = LinAlgUtils.getObjectFromMatrix(matrix, keys);

      assert.deepEqual(result, []);
    });

    test("should handle empty keys", function () {
      const matrix = [
        [1, 2],
        [3, 4],
      ];
      const keys: string[] = [];

      const result = LinAlgUtils.getObjectFromMatrix(matrix, keys);

      assert.deepEqual(result, [{}, {}]);
    });

    test("should handle scalars", function () {
      const scalar = 1;
      const keys = ["a", "b"];

      // @ts-ignore
      const result = LinAlgUtils.getObjectFromMatrix(scalar, keys);

      assert.deepEqual(result, [{ a: 1 }]);
    });

    test("should handle arrays", function () {
      const array = [1, 2, 3];
      const keys = ["a", "b", "c"];
      
      // @ts-ignore
      const result = LinAlgUtils.getObjectFromMatrix(array, keys);

      assert.deepEqual(result, [{ a: 1, b: 2, c: 3 }]);
    });

    test("should convert multiple matrices to array of objects correctly", function () {
      const matrixA = [ 
        [1, 2],
        [3, 4],
      ];
      const matrixB = [
        [5, 6],
        [7, 8],
      ];
      const keys = ["a", "b", "c", "d"];

      const result = LinAlgUtils.getObjectFromMatrix([matrixA, matrixB], keys);

      assert.deepEqual(result, [
        { a: 1, b: 2, c: 5, d: 6 },
        { a: 3, b: 4, c: 7, d: 8 },
      ]);
    });
  });
});
