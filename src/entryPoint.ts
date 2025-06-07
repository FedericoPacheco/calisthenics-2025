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
const dipsParams = {
  inputs: [
    new SpreadsheetIOAdapter("13-ST", "H19:U19"),
    new SpreadsheetIOAdapter("13-ST", "H29:U29"),
  ],
  output: new SpreadsheetIOAdapter("03-ControlPanel", "B8:J61"),
  microcycleCount: 4,
  args: {
    previous1RM: new SpreadsheetIOAdapter("03-ControlPanel", "J3").read(),
    bw: new SpreadsheetIOAdapter("03-ControlPanel", "J4").read(),
  },
};
export function runDipsControlPanel() {
  const dipsControlPanel = new STControlPanel(
    dipsParams.inputs,
    dipsParams.output,
    dipsParams.microcycleCount,
    dipsParams.args
  );
  dipsControlPanel.run();
}
(global as any).runDipsControlPanel = runDipsControlPanel;

const pullUpParams = {
  inputs: [
    new SpreadsheetIOAdapter("13-ST", "H13:U13"),
    new SpreadsheetIOAdapter("13-ST", "H23:U23"),
  ],
  output: new SpreadsheetIOAdapter("03-ControlPanel", "L8:T61"),
  microcycleCount: 4,
  args: {
    previous1RM: new SpreadsheetIOAdapter("03-ControlPanel", "T3").read(),
    bw: new SpreadsheetIOAdapter("03-ControlPanel", "T4").read(),
  },
};
export function runPullUpsControlPanel() {
  const pullUpControlPanel = new STControlPanel(
    pullUpParams.inputs,
    pullUpParams.output,
    pullUpParams.microcycleCount,
    pullUpParams.args
  );
  pullUpControlPanel.run();
}
(global as any).runPullUpsControlPanel = runPullUpsControlPanel;

////////////////////////////////////////////////////////////////////////////////////////
// Periodization

(global as any).onPeriodizationEdit = onPeriodizationEdit;
