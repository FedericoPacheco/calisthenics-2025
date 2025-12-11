import STUtils from "../utils/STUtils";
import GeneralUtils from "../utils/GeneralUtils";
import { ControlPanelTemplateMethod } from "./ControlPanelTemplateMethod";
import { IOPort } from "../ports/IOPort";

type SWEntry = {
  sets: number;
  reps: string;
  suggestedIntensity: string;
  leftIntensity: number[];
  rightIntensity: number[];
  TEC: number[];
};
type SWArgs = {
  startMicrocycle: number;
};
type SWMicrocycleMetrics = {
  medianLeftIntensity: number;
  medianRightIntensity: number;
  medianTEC: number;
};
type SWMesocycleMetrics = {
  medianLeftIntensity: number;
  medianRightIntensity: number;
  leftFingerUsage: number[];
  rightFingerUsage: number[];
};
type SWMetrics = {
  microcycle: SWMicrocycleMetrics[];
  mesocycle: SWMesocycleMetrics;
};
export class SWControlPanel extends ControlPanelTemplateMethod {
  private static FINGERS = [10, 5, 4, 3, 2, 1, 0];

  constructor(
    inputs: IOPort[],
    output: IOPort,
    microcycleCount: number,
    args: SWArgs
  ) {
    super(inputs, output, microcycleCount, args);
  }

  public parseEntry(input: IOPort, microcycle: number): SWEntry {
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
    return {
      microcycle: this.computeMicrocycleMetrics(entryData),
      mesocycle: this.computeMesocycleMetrics(entryData),
    };
  }

  private computeMicrocycleMetrics(
    entryData: SWEntry[]
  ): SWMicrocycleMetrics[] {
    const sessionsPerMicrocycle = entryData.length / this.microcycleCount;
    const entriesPerMicrocycle = GeneralUtils.split(
      entryData,
      sessionsPerMicrocycle
    );
    const microcycleMetrics = entriesPerMicrocycle.map((microcycleEntries) => {
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

      return {
        medianLeftIntensity,
        medianRightIntensity,
        medianTEC,
      };
    });

    return microcycleMetrics;
  }

  private computeMesocycleMetrics(entryData: SWEntry[]): SWMesocycleMetrics {
    const leftFingers = entryData.map((entry) => entry.leftIntensity).flat();
    const rightFingers = entryData.map((entry) => entry.rightIntensity).flat();

    const leftFrequencies = GeneralUtils.relativeFrequencies(leftFingers);
    const rightFrequencies = GeneralUtils.relativeFrequencies(rightFingers);

    const leftFingerUsage = SWControlPanel.FINGERS.map((f) =>
      GeneralUtils.round(leftFrequencies[f] || 0)
    );
    const rightFingerUsage = SWControlPanel.FINGERS.map((f) =>
      GeneralUtils.round(rightFrequencies[f] || 0)
    );

    const medianLeftIntensity = GeneralUtils.median(leftFingers);
    const medianRightIntensity = GeneralUtils.median(rightFingers);

    return {
      leftFingerUsage,
      rightFingerUsage,
      medianLeftIntensity,
      medianRightIntensity,
    };
  }

  public transform(entryData: SWEntry[], metrics: SWMetrics): any[][] {
    return metrics.microcycle.map((microcycleMetrics, idx) => [
      (this.args as SWArgs).startMicrocycle + idx,
      microcycleMetrics.medianLeftIntensity,
      metrics.mesocycle.medianLeftIntensity,
      microcycleMetrics.medianRightIntensity,
      metrics.mesocycle.medianRightIntensity,
      microcycleMetrics.medianTEC,
      ...metrics.mesocycle.leftFingerUsage,
      ...metrics.mesocycle.rightFingerUsage,
    ]);
  }
}
