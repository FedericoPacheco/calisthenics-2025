import NumberUtils from "../utils/NumberUtils";
import { DashboardTemplateMethod } from "./DashboardTemplateMethod";
import { IOPort } from "../ports/IOPort";
import LinAlgUtils from "../utils/LinAlgUtils";
import StatUtils from "../utils/StatUtils";

type SWEntry = {
  sets: number;
  reps: string;
  suggestedIntensity: string;
  leftIntensity: number[];
  rightIntensity: number[];
  leftTEC: number[];
  rightTEC: number[];
};
type SWArgs = {
  startMicrocycle: number;
};
type SWMicrocycleMetrics = {
  medianLeftIntensity: number;
  medianRightIntensity: number;
  medianLeftTEC: number;
  medianRightTEC: number;
};
type SWMesocycleMetrics = {
  medianLeftIntensity: number;
  medianRightIntensity: number;
  medianLeftTEC: number;
  medianRightTEC: number;
  leftFingerUsage: number[];
  rightFingerUsage: number[];
};
type SWMetrics = {
  microcycle: SWMicrocycleMetrics[];
  mesocycle: SWMesocycleMetrics;
};
export class SWDashboardV2 extends DashboardTemplateMethod {
  private static FINGERS = [10, 5, 4, 3, 2, 1, 0];

  constructor(
    inputs: IOPort[],
    output: IOPort,
    microcycleCount: number,
    args: SWArgs,
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
      leftTEC: workingSets.slice(sets * 2, sets * 3),
      rightTEC: workingSets.slice(sets * 3, sets * 4),
    };
  }

  public computeMetrics(entryData: SWEntry[]): SWMetrics {
    return {
      microcycle: this.computeMicrocycleMetrics(entryData),
      mesocycle: this.computeMesocycleMetrics(entryData),
    };
  }

  private computeMicrocycleMetrics(
    entryData: SWEntry[],
  ): SWMicrocycleMetrics[] {
    const sessionsPerMicrocycle = entryData.length / this.microcycleCount;
    const entriesPerMicrocycle = LinAlgUtils.split(
      entryData,
      sessionsPerMicrocycle,
    );
    const microcycleMetrics = entriesPerMicrocycle.map((microcycleEntries) => {
      const medianLeftIntensity = NumberUtils.round(
        StatUtils.median(
          microcycleEntries.map((entry) => entry.leftIntensity).flat(),
        ),
      );
      const medianRightIntensity = NumberUtils.round(
        StatUtils.median(
          microcycleEntries.map((entry) => entry.rightIntensity).flat(),
        ),
      );
      const medianLeftTEC = NumberUtils.round(
        StatUtils.median(
          microcycleEntries.map((entry) => entry.leftTEC).flat(),
        ),
      );
      const medianRightTEC = NumberUtils.round(
        StatUtils.median(
          microcycleEntries.map((entry) => entry.rightTEC).flat(),
        ),
      );

      return {
        medianLeftIntensity,
        medianRightIntensity,
        medianLeftTEC,
        medianRightTEC,
      };
    });

    return microcycleMetrics;
  }

  private computeMesocycleMetrics(entryData: SWEntry[]): SWMesocycleMetrics {
    const leftFingers = entryData.map((entry) => entry.leftIntensity).flat();
    const rightFingers = entryData.map((entry) => entry.rightIntensity).flat();

    const leftFrequencies = StatUtils.relativeFrequencies(leftFingers);
    const rightFrequencies = StatUtils.relativeFrequencies(rightFingers);

    const leftFingerUsage = SWDashboardV2.FINGERS.map((f) =>
      NumberUtils.round(leftFrequencies[f] || 0),
    );
    const rightFingerUsage = SWDashboardV2.FINGERS.map((f) =>
      NumberUtils.round(rightFrequencies[f] || 0),
    );

    const medianLeftIntensity = StatUtils.median(leftFingers);
    const medianRightIntensity = StatUtils.median(rightFingers);

    const medianLeftTEC = StatUtils.median(
      entryData.map((entry) => entry.leftTEC).flat(),
    );
    const medianRightTEC = StatUtils.median(
      entryData.map((entry) => entry.rightTEC).flat(),
    );

    return {
      leftFingerUsage,
      rightFingerUsage,
      medianLeftIntensity,
      medianRightIntensity,
      medianLeftTEC,
      medianRightTEC,
    };
  }

  public transform(entryData: SWEntry[], metrics: SWMetrics): any[][] {
    return metrics.microcycle.map((microcycleMetrics, idx) => [
      (this.args as SWArgs).startMicrocycle + idx,
      microcycleMetrics.medianLeftIntensity,
      metrics.mesocycle.medianLeftIntensity,
      microcycleMetrics.medianRightIntensity,
      metrics.mesocycle.medianRightIntensity,
      microcycleMetrics.medianLeftTEC,
      metrics.mesocycle.medianLeftTEC,
      microcycleMetrics.medianRightTEC,
      metrics.mesocycle.medianRightTEC,
      ...metrics.mesocycle.leftFingerUsage,
      ...metrics.mesocycle.rightFingerUsage,
    ]);
  }
}
