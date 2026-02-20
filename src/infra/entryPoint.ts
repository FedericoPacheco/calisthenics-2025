import GSheetsIOAdapter from "./adapters/GSheetsIOAdapter";
import { STDashboard } from "../domain/dashboards/STDashboard";
import { onPeriodizationEdit } from "../domain/estimation/IntensityVolumeDecisionMatrix";
import OneRMEstimator, {
  StrengthTest,
} from "../domain/estimation/OneRMEstimator";
import { SWDashboard } from "../domain/dashboards/SWDashboard";
import GSheetsKeyValueStoreAdapter from "./adapters/GSheetsKeyValueStoreAdapter";
import GSheetsEditEventAdapter from "./adapters/GSheetsEditEventAdapter";
import TimeUtils from "../domain/utils/TimeUtils";
import LinAlgUtils from "../domain/utils/LinAlgUtils";

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
    output: new GSheetsIOAdapter("04-SWDashboard", "C11:W14"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 1,
    },
  },
  {
    inputs: [new GSheetsIOAdapter("32-SW", "H9:J9")],
    output: new GSheetsIOAdapter("04-SWDashboard", "C15:W18"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 5,
    },
  },
  {
    inputs: [new GSheetsIOAdapter("42-SW", "H14:J14")],
    output: new GSheetsIOAdapter("04-SWDashboard", "C19:W22"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 9,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("52-SW", "H14:J14"),
      new GSheetsIOAdapter("52-SW", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-SWDashboard", "C23:W26"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 13,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("62-SW", "H14:J14"),
      new GSheetsIOAdapter("62-SW", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-SWDashboard", "C27:W30"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 17,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("72-SW", "H14:J14"),
      new GSheetsIOAdapter("72-SW", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-SWDashboard", "C31:W34"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 21,
    },
  },
];
export function runOAHSDashboard() {
  OAHSParams.forEach((mesoParams) => {
    new SWDashboard(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args,
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
    output: new GSheetsIOAdapter("04-STDashboard", "F7:O42"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "C10").read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 1,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("23-ST", "H14:J14"),
      new GSheetsIOAdapter("23-ST", "H22:J22"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "F43:O78"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "C11").read(),
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
      mesoParams.args,
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
    output: new GSheetsIOAdapter("04-STDashboard", "Q7:Z42"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "D10").read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 1,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("23-ST", "H10:J10"),
      new GSheetsIOAdapter("23-ST", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "Q43:Z78"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "D11").read(),
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
      mesoParams.args,
    ).run();
  });
}
(global as any).runPullUpsDashboard = runPullUpsDashboard;

////////////////////////////////////////////////////////////////////////////////////////
// 1RM estimation

const e1RMMatrixInput = {
  e1RM: new GSheetsIOAdapter("03-STEstimation", "O5"),
  bw: new GSheetsIOAdapter("03-STEstimation", "O6"),
  requiredRPE: new GSheetsIOAdapter("03-STEstimation", "O7"),
  intensities: new GSheetsIOAdapter("03-STEstimation", "R7:R46"),
  reps: new GSheetsIOAdapter("03-STEstimation", "S6:AA6"),
};
const store = new GSheetsKeyValueStoreAdapter();
const e1RMMatrixOutput = {
  differences: new GSheetsIOAdapter("03-STEstimation", "S7:AB46"),
};
(global as any).onPeriodizationEdit = (
  e: GoogleAppsScript.Events.SheetsOnEdit,
) =>
  onPeriodizationEdit(
    new GSheetsEditEventAdapter(e, "03-STEstimation", "O5:O7"),
    e1RMMatrixInput,
    store,
    e1RMMatrixOutput,
  );

/** @customfunction */
function E1RM(weight: number, bw: number, reps: number, rpe: number): number {
  return OneRMEstimator.estimate({ weight, bw, reps, rpe });
}
(global as any).E1RM = E1RM;

/** @customfunction */
function E1RM_MULTIPOINT(
  weights: number | number[][],
  bws: number | number[][],
  reps: number | number[][],
  rpes: number | number[][],
): number {
  const observations: StrengthTest[] = LinAlgUtils.getObjectFromMatrices(
    [weights, bws, reps, rpes],
    ["weight", "bw", "reps", "rpe"],
  ) as StrengthTest[];
  return OneRMEstimator.estimateMultipoint(observations);
}
(global as any).E1RM_MULTIPOINT = E1RM_MULTIPOINT;

////////////////////////////////////////////////////////////////////////////////////////
// Time utils

/** @customfunction */
function GET_HOURS(input: number[][]): number {
  return TimeUtils.getHours(input[0]);
}
(global as any).GET_HOURS = GET_HOURS;

/** @customfunction */
function GET_MINUTES(input: number[][]): number {
  return TimeUtils.getMinutes(input[0]);
}
(global as any).GET_MINUTES = GET_MINUTES;

/** @customfunction */
function GET_SECONDS(input: number[][]): number {
  return TimeUtils.getSeconds(input[0]);
}
(global as any).GET_SECONDS = GET_SECONDS;
