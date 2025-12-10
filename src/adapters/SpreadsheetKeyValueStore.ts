import { KeyValueStorePort } from "../ports/KeyValueStore";

export default class SpreadsheetKeyValueStore implements KeyValueStorePort {
  private props: GoogleAppsScript.Properties.Properties;

  constructor() {
    this.props = PropertiesService.getScriptProperties();
  }

  public set(key: string, value: any): void {
    if (typeof value === "undefined" || value === null) {
      throw new Error("Undefined or null values cannot be stored.");
    }

    let strValue;
    if (typeof value !== "string") {
      strValue = JSON.stringify(value);
    } else strValue = value;

    this.props.setProperty(key, strValue);
  }

  public get(key: string): any {
    let storedValue = this.props.getProperty(key);
    try {
      return JSON.parse(storedValue as string);
    } catch {
      return storedValue;
    }
  }

  public delete(key: string): void {
    this.props.deleteProperty(key);
  }
}
