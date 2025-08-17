import SpreadsheetIOAdapter from '../../utils/SpreadsheetIOAdapter';

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

