export default class STUtils {
  public static computeE1RM(weight: number, bw: number, reps: number): number {
    const epley = STUtils.estimate1RMEpley(weight, bw, reps);
    const brzycki = STUtils.estimate1RMBrzycki(weight, bw, reps);
    const berger = STUtils.estimate1RMBerger(weight, bw, reps);
    return (epley + brzycki + berger) / 3;
  }

  private static estimate1RMBerger(weight: number, bw: number, reps: number) {
    return (weight + bw) * (1 / (1.0261 * Math.pow(Math.E, -0.0262 * reps))) - bw;
  }

  private static estimate1RMBrzycki(weight: number, bw: number, reps: number) {
    return ((weight + bw) * 36) / (37 - reps) - bw;
  }

  private static estimate1RMEpley(weight: number, bw: number, reps: number) {
    return (weight + bw) * (1 + reps / 30) - bw;
  }
}
