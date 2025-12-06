export default class STUtils {
  public static computeE1RM(weight: number, bw: number, reps: number): number {
    const totalWeight = weight + bw;
    const epley = totalWeight * (1 + reps / 30) - bw;
    const brzycki = (totalWeight * 36) / (37 - reps) - bw;
    const berger =
      totalWeight * (1 / (1.0261 * Math.pow(Math.E, -0.0262 * reps))) - bw;

    return (epley + brzycki + berger) / 3;
  }
}
