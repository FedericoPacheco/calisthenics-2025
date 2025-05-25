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

  // public static round(
  //   num: number,
  //   lower: number = 0,
  //   upper: number = 5
  // ): number {
  //   const delta = upper - lower;
  //   const digits = delta.toString().length;
  //   const scale = 10 ** digits;

  //   const base = scale * Math.floor(Math.abs(num) / scale);
  //   const remainder = Math.abs(num) % scale;

  //   const multiples = Math.round((remainder - lower) / delta);
  //   const nearest = lower + multiples * delta;
  //   return Math.sign(num) * (base + nearest);
  // }

  public static round(num: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }
}
