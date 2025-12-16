import NumberUtils from "./GeneralUtils";

export default class TimeUtils {
  public static getHours(input: number[]): number {
    const minutes = input[0];
    const seconds = input[1];
    return NumberUtils.div(minutes * 60 + seconds, 60 * 60);
  }
  public static getMinutes(input: number[]): number {
    const minutes = input[0];
    const seconds = input[1];
    return NumberUtils.div((minutes * 60 + seconds) % (60 * 60), 60);
  }
  public static getSeconds(input: number[]): number {
    const minutes = input[0];
    const seconds = input[1];
    return ((minutes * 60 + seconds) % (60 * 60)) % 60;
  }
}
