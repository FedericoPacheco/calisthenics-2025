export default class LinAlgUtils {
  public static concatMatricesHorizontally<T>(A: T[][], B: T[][]): T[][] {
    if (!LinAlgUtils.isMatrix(A))
      throw new Error("First argument is not a matrix");
    if (!LinAlgUtils.isMatrix(B))
      throw new Error("Second argument is not a matrix");
    if (A.length !== B.length) {
      throw new Error("Matrices have different number of rows");
    }
    return A.map((row, idx) => row.concat(B[idx]));
  }

  public static transpose<T>(A: T[][]): T[][] {
    if (!LinAlgUtils.isMatrix(A))
      throw new Error("Input is not a valid matrix");
    return A[0].map((_, j) => A.map((row) => row[j]));
  }

  public static dim(tensor: any[][][] | any[][] | any[] | any): number {
    if (!Array.isArray(tensor)) return 0;
    else return 1 + LinAlgUtils.dim(tensor[0]);
  }

  public static isScalar(data: any) {
    return LinAlgUtils.dim(data) === 0;
  }

  public static isVector(data: any[]) {
    return LinAlgUtils.dim(data) === 1;
  }

  public static isMatrix(data: any[][]) {
    return LinAlgUtils.dim(data) === 2;
  }

  public static isEmptyTensor(
    tensor: any[][][] | any[][] | any[] | any
  ): boolean {
    if (LinAlgUtils.isScalar(tensor)) {
      if (typeof tensor === "undefined" || tensor === null) return true;
      else return false;
    } else return LinAlgUtils.isEmptyTensor(tensor[0]);
  }

  public static isMatrixWithValues(matrix: any[][]) {
    return (
      LinAlgUtils.isMatrix(matrix) &&
      matrix.flat().some((value) => value.length > 0 || value > 0)
    );
  }

  public static sliceCols(matrix: any[][], start: number, end: number) {
    return matrix.map((row) => row.slice(start, end));
  }

  public static sliceRows(matrix: any[][], start: number, end: number) {
    return matrix.slice(start, end);
  }

  public static fillRows(
    matrix: any[][],
    numRows: number,
    numCols: number,
    value: string | number = ""
  ) {
    let finalData: any[][] = [...matrix];
    for (let i = matrix.length; i < numRows; i++) {
      finalData.push(Array(numCols).fill(value));
    }
    return finalData;
  }

  public static fillCols(
    matrix: any[][],
    numCols: number,
    value: string | number = ""
  ) {
    const finalData: any[][] = [];
    matrix.forEach((row) => {
      const missingValues = Array(numCols - row.length).fill(value);
      finalData.push([...row, ...missingValues]);
    });
    return finalData;
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

  public static getObjectFromMatrices(
    tensor: any | any[] | any[][] | any[][][],
    keys: string[]
  ): object[] {
    let enssembledMatrix: any[][];
    if (LinAlgUtils.isScalar(tensor)) enssembledMatrix = [[tensor]];
    else if (LinAlgUtils.isVector(tensor)) enssembledMatrix = [tensor];
    else if (LinAlgUtils.isMatrix(tensor)) enssembledMatrix = tensor;
    else {
      enssembledMatrix = tensor.reduce(
        (concatenation: any[][], matrix: any[][]) =>
          LinAlgUtils.concatMatricesHorizontally(concatenation, matrix)
      );
    }

    if (LinAlgUtils.isEmptyTensor(enssembledMatrix)) return [];

    const objects: object[] = [];
    for (let i = 0; i < enssembledMatrix.length; i++) {
      const obj: Record<string, any> = {};
      for (let j = 0; j < enssembledMatrix[0].length && j < keys.length; j++) {
        obj[keys[j]] = enssembledMatrix[i][j];
      }
      objects.push(obj);
    }

    return objects;
  }
}
