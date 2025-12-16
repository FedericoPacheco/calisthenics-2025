export default class GeneralUtils {
  public static round(num: number, decimalPlaces: number = 2): number {
    if (isNaN(num)) return num;
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  public static div(dividend: number, divisor: number): number {
    return Math.floor(dividend / divisor);
  }

  public static average(arr: number[]): number {
    if (!Array.isArray(arr)) throw new Error("Input is not a valid array");
    if (arr.length === 0) return 0;
    return GeneralUtils.round(
      arr.reduce((acc, curr) => acc + curr, 0) / arr.length
    );
  }

  public static movingAverage(arr: number[], windowSize: number = 3): number[] {
    debugger;
    if (!Array.isArray(arr)) throw new Error("Input is not a valid array");
    if (windowSize <= 0) throw new Error("Window size must be greater than 0");

    const result: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const end = i + 1;
      const window = arr.slice(start, end);
      result.push(this.average(window));
    }

    return result;
  }

  public static median(arr: number[]): number {
    const sorted = [...arr].sort((a1, a2) => a1 - a2);
    const midIdx = Math.floor(sorted.length / 2);
    const isOdd = sorted.length % 2 !== 0;
    if (isOdd) return sorted[midIdx];
    else return (sorted[midIdx - 1] + sorted[midIdx]) / 2;
  }

  public static relativeFrequencies<T extends string | number | symbol>(
    arr: T[]
  ): Record<T, number> {
    const frequencies = {} as Record<T, number>;
    arr.forEach((item) => {
      if (!frequencies[item]) frequencies[item] = 0;
      frequencies[item]++;
    });
    Object.keys(frequencies).forEach((item) => {
      frequencies[item as T] /= arr.length;
    });
    return frequencies;
  }

  public static getHours(input: number[]): number {
    const minutes = input[0];
    const seconds = input[1];
    return GeneralUtils.div(minutes * 60 + seconds, 60 * 60);
  }
  public static getMinutes(input: number[]): number {
    const minutes = input[0];
    const seconds = input[1];
    return GeneralUtils.div((minutes * 60 + seconds) % (60 * 60), 60);
  }
  public static getSeconds(input: number[]): number {
    const minutes = input[0];
    const seconds = input[1];
    return ((minutes * 60 + seconds) % (60 * 60)) % 60;
  }
}
