import STUtils from "../../STUtils";
import GeneralUtils from "../../utils/GeneralUtils";
import SpreadsheetIOAdapter from "../../utils/SpreadsheetIOAdapter";
import { ControlPanelTemplateMethod } from "./ControlPanelTemplateMethod";

type SWEntry = {
  sets: number;
  reps: string;
  suggestedIntensity: string;
  leftIntensity: number[];
  rightIntensity: number[];
  TEC: number[];
};
type SWArgs = {};
type SWMetrics = {
  medianLeftIntensity: number;
  medianRightIntensity: number;
  medianTEC: number;
  leftFingerUsage: number[];
  rightFingerUsage: number[];
};

export class SWControlPanel extends ControlPanelTemplateMethod {
  constructor(
    inputs: SpreadsheetIOAdapter[],
    output: SpreadsheetIOAdapter,
    microcycleCount: number,
    args: SWArgs
  ) {
    super(inputs, output, microcycleCount, args);
  }

  public parseEntry(input: SpreadsheetIOAdapter, microcycle: number): SWEntry {
    return {} as SWEntry;
  }

  public computeMetrics(entryData: object[]): SWMetrics {
    return {} as SWMetrics;
  }

  public transform(entryData: object[], metrics: SWMetrics): any[][] {
    return [[]];
  }
}
