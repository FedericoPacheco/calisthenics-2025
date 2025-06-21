import SpreadsheetIOAdapter from '../../utils/SpreadsheetIOAdapter';
import GeneralUtils from '../../utils/GeneralUtils';
import STUtils from '../../STUtils';

// https://refactoring.guru/design-patterns/template-method

export abstract class ControlPanelTemplateMethod {
  protected inputs: SpreadsheetIOAdapter[];
  protected output: SpreadsheetIOAdapter;
  protected microcycleCount: number;
  protected args: object;

  public constructor(
    inputs: SpreadsheetIOAdapter[],
    output: SpreadsheetIOAdapter,
    microcycleCount: number,
    args: object
  ) {
    this.inputs = inputs;
    this.output = output;
    this.microcycleCount = microcycleCount;
    this.args = args;
  }

  public run(): void {
    let accumulated: object[] = [];
    let current: object;
    for (let microcycle = 0; microcycle < this.microcycleCount; microcycle++) {
      this.inputs.forEach((input) => {
        current = this.parseEntry(input, microcycle);
        accumulated.push(current);
      });
    }
    const metrics = this.computeMetrics(accumulated);
    const output = this.transform(accumulated, metrics);
    this.output.write(output);
  }

  public abstract parseEntry(
    input: SpreadsheetIOAdapter,
    microcycle: number
  ): object;
  public abstract computeMetrics(entryData: object[]): any;
  public abstract transform(entryData: object[], metrics: object): any[][];
}

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
  bw: number;
  minSetsJumpPerMicrocycle: number[];
};

type STEntryMetrics = {
  RPEStability: number[];
  avgTEC: number;
  e1RMChange: number[];
  totalVolume: number;
};
type STGlobalMetrics = {
  movingAverageIntensity: number[];
};
type STMetrics = {
  entry: STEntryMetrics[];
  global: STGlobalMetrics;
};

export class STControlPanel extends ControlPanelTemplateMethod {
  public constructor(
    inputs: SpreadsheetIOAdapter[],
    output: SpreadsheetIOAdapter,
    microcycleCount: number,
    args: STArgs
  ) {
    super(inputs, output, microcycleCount, args);
  }

  // Format: Sets, Reps, RPE(target), Intensity1, RPE1, TEC1, ..., Intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
  public parseEntry(input: SpreadsheetIOAdapter, microcycle: number): STEntry {
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
      const RPEStability = entry.RPE.map((rpe) => rpe - entry.targetRPE);

      const avgTEC = GeneralUtils.average(entry.TEC);

      const e1RMChange = entry.intensity.map((intensity: number, idx: number) =>
        GeneralUtils.round(
          STUtils.computeE1RM(
            intensity,
            (this.args as STArgs).bw,
            entry.reps + (10 - entry.RPE[idx])
          ) - (this.args as STArgs).previous1RM
        )
      );

      const totalVolume = entry.sets * entry.reps;

      return {
        RPEStability,
        avgTEC,
        e1RMChange,
        totalVolume,
      };
    });

    const globalMetrics: STGlobalMetrics = {
      movingAverageIntensity: GeneralUtils.movingAverage(
        entryData.map((entry) => entry.intensity).flat(),
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
    let seq = 1,
      entryMetrics;
    entryData.forEach((entry, entryIdx) => {
      entryMetrics = metrics.entry[entryIdx];
      for (let setIdx = 0; setIdx < entry.sets; setIdx++) {
        result.push([
          seq,
          entry.sets,
          entry.reps,
          entryMetrics.totalVolume,
          entry.targetRPE,
          entry.TEC[setIdx],
          entryMetrics.RPEStability[setIdx],
          entry.intensity[setIdx],
          metrics.global.movingAverageIntensity[seq - 1],
          entryMetrics.e1RMChange[setIdx],
        ]);
        seq++;
      }
    });

    return result;
  }
}
