import GeneralUtils from "./GeneralUtils";

export type StrengthTest = {
  weight: number;
  bw: number;
  reps: number;
  rpe: number;
};

export default class STUtils {
  public static estimate1RM(observation: StrengthTest): number {
    return STUtils.estimate1RmMultipoint([observation]);
  }

  public static estimate1RmMultipoint(observations: StrengthTest[]): number {
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

      estimations.push(STUtils.estimate1RMEpley(weight, bw, adjustedReps));
      estimations.push(STUtils.estimate1RMBrzycki(weight, bw, adjustedReps));
      estimations.push(STUtils.estimate1RMBerger(weight, bw, adjustedReps));
    });
    return GeneralUtils.average(estimations);
  }

  private static estimate1RMBerger(weight: number, bw: number, reps: number) {
    return (
      (weight + bw) * (1 / (1.0261 * Math.pow(Math.E, -0.0262 * reps))) - bw
    );
  }
  private static estimate1RMBrzycki(weight: number, bw: number, reps: number) {
    return ((weight + bw) * 36) / (37 - reps) - bw;
  }
  private static estimate1RMEpley(weight: number, bw: number, reps: number) {
    return (weight + bw) * (1 + reps / 30) - bw;
  }
}
