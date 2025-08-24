export default class GeneralUtils {
  public static concatMatricesHorizontally<T>(A: T[][], B: T[][]): T[][] {
    if (!Array.isArray(A) || !Array.isArray(A[0])) {
      throw new Error("First argument is not a matrix");
    }
    if (!Array.isArray(B) || !Array.isArray(B[0])) {
      throw new Error("Second argument is not a matrix");
    }
    if (A.length !== B.length) {
      throw new Error("Matrices have different number of rows");
    }
    return A.map((row, idx) => row.concat(B[idx]));
  }

  public static round(num: number, decimalPlaces: number = 2): number {
    if (isNaN(num)) throw new Error("Input is not a valid number");
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  public static sum(arr: number[]): number {
    if (!Array.isArray(arr)) throw new Error("Input is not a valid array");
    return GeneralUtils.round(arr.reduce((acc, curr) => acc + curr, 0));
  }

  public static average(arr: number[]): number {
    if (!Array.isArray(arr)) throw new Error("Input is not a valid array");
    if (arr.length === 0) return 0;
    return GeneralUtils.round(
      arr.reduce((acc, curr) => acc + curr, 0) / arr.length
    );
  }

  public static movingAverage(arr: number[], windowSize: number = 3): number[] {
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

  public static transpose<T>(A: T[][]): T[][] {
    if (!Array.isArray(A) || !Array.isArray(A[0]))
      throw new Error("Input is not a valid matrix");
    return A[0].map((_, j) => A.map((row) => row[j]));
  }

  public static isMatrix(data: any) {
    return Array.isArray(data) && Array.isArray(data[0]);
  }

  public static isScalar(data: any) {
    return !Array.isArray(data);
  }

  public static isNonEmptyMatrix(data: any) {
    return GeneralUtils.isMatrix(data) && data[0].length > 0;
  }

  public static sliceCols(matrix: any[][], start: number, end: number) {
    return matrix.map((row) => row.slice(start, end));
  }

  public static sliceRows(matrix: any[][], start: number, end: number) {
    return matrix.slice(start, end);
  }

  public static median(arr: number[]): number {
    const sorted = [...arr].sort((a1, a2) => a1 - a2);
    const midIdx = Math.floor(sorted.length / 2);
    const isOdd = sorted.length % 2 !== 0;
    if (isOdd) return sorted[midIdx];
    else return (sorted[midIdx - 1] + sorted[midIdx]) / 2;
  }

  public static split<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    let remainder = [...arr];
    let idx = 0;
    while (remainder.length > 0) {
      chunks.push(arr.slice(idx, idx + size));
      idx += size;
      remainder = remainder.slice(size);
    }
    return chunks;
  }

  public static relativeFrequencies<T extends string | number | symbol>(arr: T[]): Record<T, number> {
    const frequencies = {} as Record<T, number>;
    arr.forEach((item) => {
      if (!frequencies[item]) 
        frequencies[item] = 0;
      frequencies[item]++;
    });
    Object.keys(frequencies).forEach((item) => {
      frequencies[item as T] /= arr.length;
    });
    return frequencies;
  }
}
