export default class GeneralUtils {
  public static round(num: number, decimalPlaces: number = 2): number {
    if (isNaN(num)) return num;
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
  }

  public static div(dividend: number, divisor: number): number {
    return Math.floor(dividend / divisor);
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
