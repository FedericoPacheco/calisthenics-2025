export default class NumberUtils {
  public static round(num: number, decimalPlaces: number = 2): number {
    if (isNaN(num)) return num;
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  public static div(dividend: number, divisor: number): number {
    return Math.floor(dividend / divisor);
  }
}
