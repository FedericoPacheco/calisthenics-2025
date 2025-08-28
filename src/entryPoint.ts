import SpreadsheetIOAdapter from "./utils/SpreadsheetIOAdapter";
import { STControlPanel } from "./routine/controlPanel/STControlPanel";
import { onPeriodizationEdit } from "./routine/periodization/IntensityVolumeDecisionMatrix";
import STUtils from "./STUtils";
import { SWControlPanel } from "./routine/controlPanel/SWControlPanel";

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
// Control panels

// -------------------------------------------------------------------------------------
// One arm handstands
const OAHSParams = [
  {
    inputs: [
      new SpreadsheetIOAdapter("22-SW", "H9:J9"),
      new SpreadsheetIOAdapter("22-SW", "H18:J18"),
    ],
    output: new SpreadsheetIOAdapter("03-SWControlPanel", "C14:V17"),
    microcycleCount: 4,
    args: {},
  },
];
export function runOAHSControlPanel() {
  OAHSParams.forEach((mesoParams) => {
    new SWControlPanel(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args
    ).run();
  });
}
(global as any).runOAHSControlPanel = runOAHSControlPanel;

// -------------------------------------------------------------------------------------
// Dips
const dipsPrevious1RM = new SpreadsheetIOAdapter(
  "03-STControlPanel",
  "K6"
).read();
const dipsBw = new SpreadsheetIOAdapter("03-STControlPanel", "K7").read();
const dipsParams = [
  {
    inputs: [
      new SpreadsheetIOAdapter("13-ST", "H14:J14"),
      new SpreadsheetIOAdapter("13-ST", "H22:J22"),
    ],
    output: new SpreadsheetIOAdapter("03-STControlPanel", "B11:K46"),
    microcycleCount: 4,
    args: {
      previous1RM: dipsPrevious1RM,
      bw: dipsBw,
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
    },
  },
  {
    inputs: [
      new SpreadsheetIOAdapter("23-ST", "H14:J14"),
      new SpreadsheetIOAdapter("23-ST", "H22:J22"),
    ],
    output: new SpreadsheetIOAdapter("03-STControlPanel", "B47:K82"),
    microcycleCount: 4,
    args: {
      previous1RM: dipsPrevious1RM,
      bw: dipsBw,
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
    },
  },
];
export function runDipsControlPanel() {
  dipsParams.forEach((mesoParams) => {
    new STControlPanel(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args
    ).run();
  });
}
(global as any).runDipsControlPanel = runDipsControlPanel;

// -------------------------------------------------------------------------------------
// Pull-ups
const pullUpPrevious1RM = new SpreadsheetIOAdapter(
  "03-STControlPanel",
  "V6"
).read();
const pullUpBw = new SpreadsheetIOAdapter("03-STControlPanel", "V7").read();

const pullUpParams = [
  {
    inputs: [
      new SpreadsheetIOAdapter("13-ST", "H10:J10"),
      new SpreadsheetIOAdapter("13-ST", "H18:J18"),
    ],
    output: new SpreadsheetIOAdapter("03-STControlPanel", "M11:V46"),
    microcycleCount: 4,
    args: {
      previous1RM: pullUpPrevious1RM,
      bw: pullUpBw,
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
    },
  },
  {
    inputs: [
      new SpreadsheetIOAdapter("23-ST", "H10:J10"),
      new SpreadsheetIOAdapter("23-ST", "H18:J18"),
    ],
    output: new SpreadsheetIOAdapter("03-STControlPanel", "M47:V82"),
    microcycleCount: 4,
    args: {
      previous1RM: pullUpPrevious1RM,
      bw: pullUpBw,
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
    },
  },
];
export function runPullUpsControlPanel() {
  pullUpParams.forEach((mesoParams) => {
    new STControlPanel(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args
    ).run();
  });
}
(global as any).runPullUpsControlPanel = runPullUpsControlPanel;

////////////////////////////////////////////////////////////////////////////////////////
// Periodization

(global as any).onPeriodizationEdit = onPeriodizationEdit;

/** @customfunction */
function E1RM(weight: number, bw: number, reps: number): number {
  return STUtils.computeE1RM(weight, bw, reps);
}
(global as any).E1RM = E1RM;
