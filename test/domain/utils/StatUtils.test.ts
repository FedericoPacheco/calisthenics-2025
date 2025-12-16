import { suite, test } from "mocha";
import { assert } from "chai";
import StatUtils from "../../../src/domain/utils/StatUtils";

suite("StatUtils", function () {
  suite("median()", function () {
    test("should return the median of an array of numbers with odd length", function () {
      const arr = [1, 3, 2];

      const result = StatUtils.median(arr);

      assert.equal(result, 2);
    });

    test("should return the median of an array of numbers with even length", function () {
      const arr = [1, 3, 2, 4];

      const result = StatUtils.median(arr);

      assert.equal(result, 2.5);
    });

    test("should return NaN for an empty array", function () {
      const arr: number[] = [];

      const result = StatUtils.median(arr);

      assert.isNaN(result);
    });
  });

  suite("relativeFrequencies()", function () {
    test("should return the frequency of each element in an array", function () {
      const arr = [1, 2, 2, 3, 3, 3];

      const result = StatUtils.relativeFrequencies(arr);

      assert.deepEqual(result, { 1: 1 / 6, 2: 2 / 6, 3: 3 / 6 });
    });
  });
});
