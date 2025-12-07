import { suite, test } from "mocha";
import { assert } from "chai";
import STUtils from "../../src/utils/STUtils";

suite("STUtils", function () {
  suite("estimate1RmMultipoint()", function () {
    test("should estimate 1RM correctly using multiple points", function () {
      const observations = [
        { weight: 70, bw: 70, reps: 8, rpe: 8 },
        { weight: 80, bw: 70, reps: 5, rpe: 9 },
      ];

      const result = STUtils.estimate1RmMultipoint(observations);

      /*
        First:
        * Epley: 116.67
        * Brzycki: 116.67
        * Berger: 107.31
        Second:
        * Epley: 110.00
        * Brzycki: 104.19
        * Berger: 101.07
      */
      assert.approximately(result, 109.32, 0.1);
    });

    test("should compensate for missing RPE by assuming RPE 10", function () {
      const observations = [{ weight: 70, bw: 70, reps: 10 }];

      // @ts-ignore
      const result = STUtils.estimate1RmMultipoint(observations);

      assert.approximately(result, 113.55, 0.1);
    });

    test("shoulde throw on out-of-range RPE", function () {
      const observations = [{ weight: 70, bw: 70, reps: 10, rpe: 15 }];

      assert.throws(() => {
        STUtils.estimate1RmMultipoint(observations);
      }, Error);
    });

    test("should throw on negative weight", function () {
        const observations = [{ weight: -70, bw: 70, reps: 10, rpe: 8 }];

        assert.throws(() => {
            STUtils.estimate1RmMultipoint(observations);
        }, Error);
    });

    test("should throw on negative bodyweight", function () {
        const observations = [{ weight: 70, bw: -70, reps: 10, rpe: 8 }];

        assert.throws(() => {
            STUtils.estimate1RmMultipoint(observations);
        }, Error);
    });

    test("should throw on negative reps", function () {
        const observations = [{ weight: 70, bw: 70, reps: -10, rpe: 8 }];
        
        assert.throws(() => {
            STUtils.estimate1RmMultipoint(observations);
        }, Error);
    });
  });
});
