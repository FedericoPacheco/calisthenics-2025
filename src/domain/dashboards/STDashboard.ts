import GeneralUtils from "../utils/GeneralUtils";
import { DashboardTemplateMethod } from "./DashboardTemplateMethod";
import { IOPort } from "../ports/IOPort";
import StatUtils from "../utils/StatUtils";

type STEntry = {
  sets: number;
  reps: number;
  targetRPE: number;
  intensity: number[];
  RPE: number[];
  TEC: number[];
};
type STArgs = {
  previous1RM: number;
  minSetsJumpPerMicrocycle: number[];
  startSequenceNumber: number;
};
type STEntryMetrics = {
  RPEStability: number[];
  totalVolume: number;
  relativeIntensity: number[];
};
type STGlobalMetrics = {
  movingAvgRelativeIntensity: number[];
  movingAvgTEC: number[];
};
type STMetrics = {
  entry: STEntryMetrics[];
  global: STGlobalMetrics;
};

export class STDashboard extends DashboardTemplateMethod {
  public constructor(
    inputs: IOPort[],
    output: IOPort,
    microcycleCount: number,
    args: STArgs
  ) {
    super(inputs, output, microcycleCount, args);
  }

  // Format: Sets, Reps, RPE(target), Intensity1, RPE1, TEC1, ..., Intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
  public parseEntry(input: IOPort, microcycle: number): STEntry {
    const rawTarget = input.read()[0];
    const [sets, reps, targetRPE] = rawTarget;

    const setsAndAvgsLength =
      Math.max(
        sets,
        (this.args as STArgs).minSetsJumpPerMicrocycle[microcycle]
      ) *
        3 +
      2;
    input.resizeReference(1, setsAndAvgsLength);
    input.moveReference(0, rawTarget.length);
    const rawIntensity = input.read()[0];
    const intensity = [],
      RPE = [],
      TEC = [];
    for (let i = 0; i < 3 * sets; i += 3) {
      intensity.push(rawIntensity[i]);
      RPE.push(rawIntensity[i + 1]);
      TEC.push(rawIntensity[i + 2]);
    }

    input.resizeReference(1, rawTarget.length);
    input.moveReference(0, setsAndAvgsLength);

    return {
      sets,
      reps,
      targetRPE,
      intensity,
      RPE,
      TEC,
    };
  }

  public computeMetrics(entryData: STEntry[]): STMetrics {
    const entryMetrics: STEntryMetrics[] = entryData.map((entry: STEntry) => {
      return {
        RPEStability: entry.RPE.map((rpe) => rpe - entry.targetRPE),
        totalVolume: entry.sets * entry.reps,
        relativeIntensity: entry.intensity.map((intensity) =>
          GeneralUtils.round(
            (intensity / (this.args as STArgs).previous1RM) * 100,
            2
          )
        ),
      };
    });

    const globalMetrics: STGlobalMetrics = {
      movingAvgRelativeIntensity: StatUtils.movingAverage(
        entryMetrics.map((em) => em.relativeIntensity).flat(),
        3
      ),
      movingAvgTEC: StatUtils.movingAverage(
        entryData.map((entry) => entry.TEC).flat(),
        3
      ),
    };

    return {
      entry: entryMetrics,
      global: globalMetrics,
    };
  }

  public transform(entryData: STEntry[], metrics: STMetrics): any[][] {
    const result: any[][] = [];
    let i = 0,
      entryMetrics;
    entryData.forEach((entry, entryIdx) => {
      entryMetrics = metrics.entry[entryIdx];
      for (let setIdx = 0; setIdx < entry.sets; setIdx++) {
        result.push([
          i + (this.args as STArgs).startSequenceNumber,
          entry.sets,
          entry.reps,
          entryMetrics.totalVolume,
          entry.targetRPE,
          entry.TEC[setIdx],
          metrics.global.movingAvgTEC[i],
          entryMetrics.RPEStability[setIdx],
          entryMetrics.relativeIntensity[setIdx],
          metrics.global.movingAvgRelativeIntensity[i],
        ]);
        i++;
      }
    });

    return result;
  }
}
