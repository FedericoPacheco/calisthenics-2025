import { suite, test } from "mocha";
import { assert } from "chai";
import GeneralUtils from "../../../src/domain/utils/GeneralUtils";

suite("GeneralUtils", function () {
  suite("median()", function () {
    test("should return the median of an array of numbers with odd length", function () {
      const arr = [1, 3, 2];

      const result = GeneralUtils.median(arr);

      assert.equal(result, 2);
    });

    test("should return the median of an array of numbers with even length", function () {
      const arr = [1, 3, 2, 4];

      const result = GeneralUtils.median(arr);

      assert.equal(result, 2.5);
    });

    test("should return NaN for an empty array", function () {
      const arr: number[] = [];

      const result = GeneralUtils.median(arr);

      assert.isNaN(result);
    });
  });

  suite("relativeFrequencies()", function () {
    test("should return the frequency of each element in an array", function () {
      const arr = [1, 2, 2, 3, 3, 3];

      const result = GeneralUtils.relativeFrequencies(arr);

      assert.deepEqual(result, { 1: 1 / 6, 2: 2 / 6, 3: 3 / 6 });
    });
  });

  suite("getHours()", function () {
    test("should get hour part from denormalized minutes and seconds input", function () {
      const result = GeneralUtils.getHours([120, 60 * 60]);

      assert.equal(result, 3);
    });
  });

  suite("getMinutes()", function () {
    test("should get minutes part from denormalized minutes and seconds input", function () {
      const result = GeneralUtils.getMinutes([2, 90]);

      assert.equal(result, 3);
    });
  });

  suite("getSeconds()", function () {
    test("should get seconds part from denormalized minutes and seconds input", function () {
      const result = GeneralUtils.getSeconds([1, 125]);

      assert.equal(result, 5);
    });
  });
});
