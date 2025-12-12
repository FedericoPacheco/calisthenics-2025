import GSheetsIOAdapter from "./adapters/GSheetsIOAdapter";
import { STDashboard } from "../domain/dashboards/STDashboard";
import { onPeriodizationEdit } from "../domain/periodization/IntensityVolumeDecisionMatrix";
import STUtils, { StrengthTest } from "../domain/utils/STUtils";
import { SWDashboard } from "../domain/dashboards/SWDashboard";
import GeneralUtils from "../domain/utils/GeneralUtils";
import GSheetsKeyValueStore from "./adapters/GSheetsKeyValueStore";
import GSheetsEditEventAdapter from "./adapters/GsheetsEditEventAdapter";

// Don't forget to add this line. Otherwise, the function won't be exported to the global scope.
// https://www.npmjs.com/package/gas-webpack-plugin
// (global as any).func = func;

// Use multiple github accounts:
// Source: https://stackoverflow.com/a/27407168
// Make sure to run: git remote set-url origin https://<USERNAME>:<TOKEN>@github.com/<USERNAME>/<REMOTE-NAME>
// Then, login on the browser.
// Get the token by going to: Github > Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token
// Also set the git email and name:
// git config user.email "<email>"
// git config user.name "<name>"
// Check:
// git config user.email
// git config user.name

// General info:
// https://developers.google.com/apps-script/guides/typescript

////////////////////////////////////////////////////////////////////////////////////////
// Dashboards

// -------------------------------------------------------------------------------------
// One arm handstands
const OAHSParams = [
  {
    inputs: [
      new GSheetsIOAdapter("22-SW", "H9:J9"),
      new GSheetsIOAdapter("22-SW", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-SWDashboard", "C14:W17"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 1,
    },
  },
  {
    inputs: [new GSheetsIOAdapter("32-SW", "H9:J9")],
    output: new GSheetsIOAdapter("04-SWDashboard", "C18:W21"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 5,
    },
  },
  {
    inputs: [new GSheetsIOAdapter("42-SW", "H14:J14")],
    output: new GSheetsIOAdapter("04-SWDashboard", "C22:W25"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 9,
    },
  },
  {
    inputs: [new GSheetsIOAdapter("52-SW", "H14:J14"),
      new GSheetsIOAdapter("52-SW", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-SWDashboard", "C26:W29"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 13,
    },
  },
];
export function runOAHSDashboard() {
  OAHSParams.forEach((mesoParams) => {
    new SWDashboard(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args
    ).run();
  });
}
(global as any).runOAHSDashboard = runOAHSDashboard;

// -------------------------------------------------------------------------------------
// Dips
const dipsParams = [
  {
    inputs: [
      new GSheetsIOAdapter("13-ST", "H14:J14"),
      new GSheetsIOAdapter("13-ST", "H22:J22"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "F7:N42"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter(
        "04-STDashboard",
        "C10"
      ).read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 1,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("23-ST", "H14:J14"),
      new GSheetsIOAdapter("23-ST", "H22:J22"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "F43:N78"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter(
        "04-STDashboard",
        "C11"
      ).read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 37,
    },
  },
];
export function runDipsDashboard() {
  dipsParams.forEach((mesoParams) => {
    new STDashboard(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args
    ).run();
  });
}
(global as any).runDipsDashboard = runDipsDashboard;

// -------------------------------------------------------------------------------------
// Pull-ups
const pullUpParams = [
  {
    inputs: [
      new GSheetsIOAdapter("13-ST", "H10:J10"),
      new GSheetsIOAdapter("13-ST", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "P7:X42"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter(
        "04-STDashboard",
        "D10"
      ).read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 1,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("23-ST", "H10:J10"),
      new GSheetsIOAdapter("23-ST", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "P43:X78"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter(
        "04-STDashboard",
        "D11"
      ).read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 37,
    },
  },
];
export function runPullUpsDashboard() {
  pullUpParams.forEach((mesoParams) => {
    new STDashboard(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args
    ).run();
  });
}
(global as any).runPullUpsDashboard = runPullUpsDashboard;

////////////////////////////////////////////////////////////////////////////////////////
// Periodization

const e1RMMatrixInput = {
  e1RM: new GSheetsIOAdapter("03-e1RM", "O3"),
  bw: new GSheetsIOAdapter("03-e1RM", "O4"),
  requiredRPE: new GSheetsIOAdapter("03-e1RM", "O5"),
  intensities: new GSheetsIOAdapter("03-e1RM", "R5:R44"),
  reps: new GSheetsIOAdapter("03-e1RM", "S4:AA4"),
};
const store = new GSheetsKeyValueStore();
const e1RMMatrixOutput = {
  differences: new GSheetsIOAdapter("03-e1RM", "S5:AB44"),
};
(global as any).onPeriodizationEdit = (
  e: GoogleAppsScript.Events.SheetsOnEdit
) =>
  onPeriodizationEdit(
    new GSheetsEditEventAdapter(e, "03-e1RM", "O3:O5"),
    e1RMMatrixInput,
    store,
    e1RMMatrixOutput
  );

/** @customfunction */
function E1RM(weight: number, bw: number, reps: number, rpe: number): number {
  return STUtils.estimate1RM({ weight, bw, reps, rpe });
}
(global as any).E1RM = E1RM;

/** @customfunction */
function E1RM_MULTIPOINT(
  weights: number[][],
  bws: number[][],
  reps: number[][],
  rpes: number[][]
): number {
  const observations: StrengthTest[] = [];
  for (let i = 0; i < weights.length; i++) {
    observations.push({
      weight: weights[i][0],
      bw: bws[i][0],
      reps: reps[i][0],
      rpe: rpes[i][0],
    });
  }
  return STUtils.estimate1RmMultipoint(observations);
}
(global as any).E1RM_MULTIPOINT = E1RM_MULTIPOINT;

////////////////////////////////////////////////////////////////////////////////////////
// Time utils

/** @customfunction */
function GET_HOURS(input: number[][]): number {
  return GeneralUtils.getHours(input[0]);
}
(global as any).GET_HOURS = GET_HOURS;

/** @customfunction */
function GET_MINUTES(input: number[][]): number {
  return GeneralUtils.getMinutes(input[0]);
}
(global as any).GET_MINUTES = GET_MINUTES;

/** @customfunction */
function GET_SECONDS(input: number[][]): number {
  return GeneralUtils.getSeconds(input[0]);
}
(global as any).GET_SECONDS = GET_SECONDS;
