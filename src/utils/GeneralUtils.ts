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
}
