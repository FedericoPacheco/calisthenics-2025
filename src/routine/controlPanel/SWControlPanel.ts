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
type SWMicrocycleMetrics = {
  medianLeftIntensity: number;
  medianRightIntensity: number;
  medianTEC: number;
  leftFingerUsage: number[];
  rightFingerUsage: number[];
};
type SWMetrics = {
  microcycle: SWMicrocycleMetrics[];
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
    const [sets, reps, suggestedIntensity] = input.read()[0];

    input.resizeReference(1, sets * 3);
    input.moveReference(0, 3);
    const workingSets = input.read()[0];

    input.resizeReference(1, 3);
    input.moveReference(0, sets * 3);

    return {
      sets,
      reps,
      suggestedIntensity,
      leftIntensity: workingSets.slice(0, sets),
      rightIntensity: workingSets.slice(sets, sets * 2),
      TEC: workingSets.slice(sets * 2, sets * 3),
    };
  }

  public computeMetrics(entryData: SWEntry[]): SWMetrics {
    const sessionsPerMicrocycle = entryData.length / this.microcycleCount;
    const fingers = [10, 5, 4, 3, 2, 1, 0];

    const microcycleMetrics = GeneralUtils.split(
      entryData,
      sessionsPerMicrocycle
    ).map((microcycleEntries) => {
      const medianLeftIntensity = GeneralUtils.round(
        GeneralUtils.median(
          microcycleEntries.map((entry) => entry.leftIntensity).flat()
        )
      );
      const medianRightIntensity = GeneralUtils.round(
        GeneralUtils.median(
          microcycleEntries.map((entry) => entry.rightIntensity).flat()
        )
      );

      const medianTEC = GeneralUtils.round(
        GeneralUtils.median(microcycleEntries.map((entry) => entry.TEC).flat())
      );

      const leftFrequencies = GeneralUtils.relativeFrequencies(
        microcycleEntries.map((entry) => entry.leftIntensity).flat()
      );
      const rightFrequencies = GeneralUtils.relativeFrequencies(
        microcycleEntries.map((entry) => entry.rightIntensity).flat()
      );
      const leftFingerUsage = fingers.map((f) =>
        GeneralUtils.round(leftFrequencies[f] || 0)
      );
      const rightFingerUsage = fingers.map((f) =>
        GeneralUtils.round(rightFrequencies[f] || 0)
      );

      return {
        medianLeftIntensity,
        medianRightIntensity,
        medianTEC,
        leftFingerUsage,
        rightFingerUsage,
      };
    });

    return {
      microcycle: microcycleMetrics,
    };
  }

  public transform(entryData: SWEntry[], metrics: SWMetrics): any[][] {
    return metrics.microcycle.map((metrics, microcycle) => [
      microcycle + 1,
      metrics.medianLeftIntensity,
      metrics.medianRightIntensity,
      metrics.medianTEC,
      ...metrics.leftFingerUsage,
      ...metrics.rightFingerUsage,
    ]);
  }
}
