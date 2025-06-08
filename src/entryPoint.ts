import SpreadsheetIOAdapter from "./utils/SpreadsheetIOAdapter";
import { STControlPanel } from "./routine/controlPanel/ControlPanelTemplateMethod";
import { onPeriodizationEdit } from "./routine/periodization/1RMPercentagesCalculator";

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
// Control panel

const dipsPrevious1RM = new SpreadsheetIOAdapter(
  "03-ControlPanel",
  "J3"
).read();
const dipsBw = new SpreadsheetIOAdapter("03-ControlPanel", "J4").read();
const dipsParams = [
  {
    inputs: [
      new SpreadsheetIOAdapter("13-ST", "H19:U19"),
      new SpreadsheetIOAdapter("13-ST", "H29:U29"),
    ],
    output: new SpreadsheetIOAdapter("03-ControlPanel", "B8:J27"),
    microcycleCount: 4,
    args: {
      previous1RM: dipsPrevious1RM,
      bw: dipsBw,
    },
  },
  {
    inputs: [
      new SpreadsheetIOAdapter("23-ST", "H19:U19"),
      new SpreadsheetIOAdapter("23-ST", "H29:U29"),
    ],
    output: new SpreadsheetIOAdapter("03-ControlPanel", "B28:J47"),
    microcycleCount: 4,
    args: {
      previous1RM: dipsPrevious1RM,
      bw: dipsBw,
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

const pullUpPrevious1RM = new SpreadsheetIOAdapter(
  "03-ControlPanel",
  "T3"
).read();
const pullUpBw = new SpreadsheetIOAdapter("03-ControlPanel", "T4").read();

const pullUpParams = [
  {
    inputs: [
      new SpreadsheetIOAdapter("13-ST", "H13:U13"),
      new SpreadsheetIOAdapter("13-ST", "H23:U23"),
    ],
    output: new SpreadsheetIOAdapter("03-ControlPanel", "L8:T27"),
    microcycleCount: 4,
    args: {
      previous1RM: pullUpPrevious1RM,
      bw: pullUpBw,
    },
  },
  {
    inputs: [
      new SpreadsheetIOAdapter("23-ST", "H13:U13"),
      new SpreadsheetIOAdapter("23-ST", "H23:U23"),
    ],
    output: new SpreadsheetIOAdapter("03-ControlPanel", "L28:T47"),
    microcycleCount: 4,
    args: {
      previous1RM: pullUpPrevious1RM,
      bw: pullUpBw,
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
