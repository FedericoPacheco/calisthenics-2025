import GeneralUtils from "../utils/GeneralUtils";

export type StrengthTest = {
  weight: number;
  bw: number;
  reps: number;
  rpe: number;
};

export default class OneRMEstimator {
  public static estimate(observation: StrengthTest): number {
    return OneRMEstimator.estimateMultipoint([observation]);
  }

  public static estimateMultipoint(observations: StrengthTest[]): number {
    const estimations: number[] = [];
    observations.forEach(({ weight, bw, reps, rpe }) => {
      if (weight < 0) throw new Error("Weight cannot be negative");
      if (bw < 0) throw new Error("Bodyweight cannot be negative");
      if (reps < 0) throw new Error("Repetitions cannot be negative");
      let adjustedReps;
      if (typeof rpe === "number") {
        if (!GeneralUtils.isWithin(0, rpe, 10))
          throw new Error("RPE value out of range");
        else adjustedReps = reps + 10 - rpe;
      } else adjustedReps = reps; // i.e. RPE = 10

      estimations.push(OneRMEstimator.estimateEpley(weight, bw, adjustedReps));
      estimations.push(OneRMEstimator.estimateBrzycki(weight, bw, adjustedReps));
      estimations.push(OneRMEstimator.estimateBerger(weight, bw, adjustedReps));
    });
    return GeneralUtils.average(estimations);
  }

  private static estimateBerger(weight: number, bw: number, reps: number) {
    return (
      (weight + bw) * (1 / (1.0261 * Math.pow(Math.E, -0.0262 * reps))) - bw
    );
  }
  private static estimateBrzycki(weight: number, bw: number, reps: number) {
    return ((weight + bw) * 36) / (37 - reps) - bw;
  }
  private static estimateEpley(weight: number, bw: number, reps: number) {
    return (weight + bw) * (1 + reps / 30) - bw;
  }
}
