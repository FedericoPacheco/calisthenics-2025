import { suite, test } from "mocha";
import { assert } from "chai";
import GeneralUtils from "../../../src/domain/utils/GeneralUtils";

suite("GeneralUtils", function () {
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
