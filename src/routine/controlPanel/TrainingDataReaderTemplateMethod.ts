import SpreadsheetIOAdapter from "../../utils/SpreadsheetIOAdapter";
import GeneralUtils from "../../utils/GeneralUtils";

export abstract class ControlPanelTemplateMethod {
  private inputs: SpreadsheetIOAdapter[];
  private output: SpreadsheetIOAdapter;
  private microcycleCount: number;
  private args: object;

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
        current = this.parseEntry(input);
        accumulated.push(current);
      });
    }
    const metrics = this.computeMetrics(accumulated, this.args);
    const output = this.transform(accumulated, metrics);
    this.output.write(output);
  }

  public abstract parseEntry(input: SpreadsheetIOAdapter): object;
  public abstract computeMetrics(entryData: object[], args: object): any;
  public abstract transform(
    entryData: object[],
    entryMetrics: object[]
  ): any[][];
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
};

type STEntryMetrics = {
  RPEStability: number[];
  avgIntensity: number;
  avgTEC: number;
  e1RMChange: number[];
};

export class STControlPanel extends ControlPanelTemplateMethod {
  // Format: Sets, Reps, RPE(target), Intensity1, RPE1, TEC1, ..., Intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
  public parseEntry(input: SpreadsheetIOAdapter): STEntry {
    const [sets, reps, targetRPE, ...setsData] = input.read();
    const intensity = [],
      RPE = [],
      TEC = [];
    for (let i = 0; i < 3 * sets; i += 3) {
      intensity.push(setsData[i]);
      RPE.push(setsData[i + 1]);
      TEC.push(setsData[i + 2]);
    }

    input.moveReference(0, 3 + 3 * sets + 2);

    return {
      sets,
      reps,
      targetRPE,
      intensity,
      RPE,
      TEC,
    };
  }

  public computeMetrics(entryData: STEntry[], args: STArgs): STEntryMetrics[] {
    return entryData.map((entry: STEntry) => {
      const RPEStability = entry.RPE.map((rpe) => rpe - entry.targetRPE);

      const avgIntensity = GeneralUtils.round(
        entry.intensity.reduce((acc, curr) => acc + curr, 0) /
          entry.intensity.length,
        2
      );

      const avgTEC = GeneralUtils.round(
        entry.TEC.reduce((acc, curr) => acc + curr, 0) / entry.TEC.length,
        2
      );

      const e1RMChange = entry.intensity.map((intensity: number, idx: number) =>
        GeneralUtils.round(
          this.computeE1RM(
            intensity,
            args.bw,
            entry.reps + (10 - entry.RPE[idx])
          ) - args.previous1RM,
          2
        )
      );

      return {
        RPEStability,
        avgIntensity,
        avgTEC,
        e1RMChange,
      };
    });
  }

  private computeE1RM(weight: number, bw: number, reps: number): number {
    const totalWeight = weight + bw;
    const epley = totalWeight * (1 + reps / 30) - bw;
    const brzycki = (totalWeight * 36) / (37 - reps) - bw;
    const berger =
      totalWeight * (1 / (1.0261 * Math.pow(Math.E, -0.0262 * reps))) - bw;

    return (epley + brzycki + berger) / 3;
  }

  public transform(
    entryData: STEntry[],
    entryMetrics: STEntryMetrics[]
  ): any[][] {
    const result: any[][] = [];
    let seq = 1,
      metrics;
    entryData.forEach((entry, entryIdx) => {
      metrics = entryMetrics[entryIdx];
      for (let setIdx = 0; setIdx < entry.sets; setIdx++) {
        result.push([
          seq,
          entry.sets,
          entry.reps,
          entry.targetRPE,
          entry.TEC[setIdx],
          metrics.RPEStability[setIdx],
          entry.intensity[setIdx],
          metrics.avgIntensity,
          metrics.e1RMChange[setIdx],
        ]);
        seq++;
      }
    });

    return result;
  }
}
