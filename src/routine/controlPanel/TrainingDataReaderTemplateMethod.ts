import SpreadsheetIOAdapter from "../../utils/SpreadsheetIOAdapter";

export abstract class ControlPanelTemplateMethod {
  private inputs: SpreadsheetIOAdapter[];
  private output: SpreadsheetIOAdapter;
  private microcycleCount: number;

  public constructor(
    inputs: SpreadsheetIOAdapter[],
    output: SpreadsheetIOAdapter,
    microcycleCount: number
  ) {
    this.inputs = inputs;
    this.output = output;
    this.microcycleCount = microcycleCount;
  }

  public run(): void {
    let accumulated: object[] = [];
    let current: object;
    for (let microcycle = 0; microcycle < this.microcycleCount; microcycle++) {
      this.inputs.forEach((input) => {
        current = this.parseEntry(input);
        accumulated = this.aggregateData(accumulated, current);
      });
    }
    const metrics = this.computeMetrics(accumulated);
    const data = this.transform(accumulated, metrics);
    this.output.write(data);
  }

  public abstract parseEntry(input: SpreadsheetIOAdapter): object;
  public abstract aggregateData(
    accumulated: object[],
    current: object
  ): object[];
  public abstract computeMetrics(data: object): any;
  public abstract transform(data: object, metrics: any): any[][];
}

export class STControlPanel extends ControlPanelTemplateMethod {
  // Format: Sets, Reps, RPE(target), Intensity1, RPE1, TEC1, ..., Intensity_N, RPE_N, TEC_N, avg RPE, avg TEC
  public parseEntry(input: SpreadsheetIOAdapter): object {
    const raw = input.read();

    console.log("raw", raw);
    const intensity = [],
      RPE = [],
      TEC = [];
    for (let i = 3; i <= 3 * raw[0]; i += 3) {
      intensity.push(raw[i]);
      RPE.push(raw[i + 1]);
      TEC.push(raw[i + 2]);
    }

    const parsed = {
      sets: raw[0],
      reps: raw[1],
      targetRPE: raw[2],
      intensity,
      RPE,
      TEC,
    };

    // input.moveReference(2 + raw[0] * 3);
    return parsed;
  }

  public aggregateData(accumulated: object[], current: object): object[] {
    return [];
  }

  public computeMetrics(data: object): object {
    return {};
  }

  public transform(data: object, metrics: object): any[][] {
    return [[]];
  }
}
