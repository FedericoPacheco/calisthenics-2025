export default class GeneralUtils {
  public static concatMatricesHorizontally<T>(A: T[][], B: T[][]): T[][] {
    if (!Array.isArray(A) || !Array.isArray(A[0])) {
      throw new Error('First argument is not a matrix');
    }
    if (!Array.isArray(B) || !Array.isArray(B[0])) {
      throw new Error('Second argument is not a matrix');
    }
    if (A.length !== B.length) {
      throw new Error('Matrices have different number of rows');
    }
    return A.map((row, idx) => row.concat(B[idx]));
  }

  public static round(num: number, decimalPlaces: number = 2): number {
    if (isNaN(num)) throw new Error('Input is not a valid number');
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  public static sum(arr: number[]): number {
    if (!Array.isArray(arr)) throw new Error('Input is not a valid array');
    return GeneralUtils.round(arr.reduce((acc, curr) => acc + curr, 0));
  }

  public static average(arr: number[]): number {
    if (!Array.isArray(arr)) throw new Error('Input is not a valid array');
    if (arr.length === 0) return 0;
    return GeneralUtils.round(
      arr.reduce((acc, curr) => acc + curr, 0) / arr.length
    );
  }

  public static movingAverage(arr: number[], windowSize: number = 3): number[] {
    if (!Array.isArray(arr)) throw new Error('Input is not a valid array');
    if (windowSize <= 0) throw new Error('Window size must be greater than 0');

    const result: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const end = i + 1;
      const window = arr.slice(start, end);
      result.push(this.average(window));
    }

    return result;
  }

  public static transpose<T>(A: T[][]): T[][] {
    if (!Array.isArray(A) || !Array.isArray(A[0]))
      throw new Error('Input is not a valid matrix');
    return A[0].map((_, j) => A.map((row) => row[j]));
  }

  public static isMatrix(data: any) {
    return Array.isArray(data) && Array.isArray(data[0]);
  }

  public static isScalar(data: any) {
    return !Array.isArray(data) && !Array.isArray(data[0]);
  }

  public static isNonEmptyMatrix(data: any) {
    return GeneralUtils.isMatrix(data) && data[0].length > 0;
  }
}
