import GSheetsIOAdapter from "./adapters/GSheetsIOAdapter";
import { STDashboardV1 } from "../domain/dashboards/STDashboardV1";
import { onPeriodizationEdit } from "../domain/estimation/IntensityVolumeDecisionMatrix";
import OneRMEstimator, {
  StrengthTest,
} from "../domain/estimation/OneRMEstimator";
import { SWDashboardV1 } from "../domain/dashboards/SWDashboardV1";
import GSheetsKeyValueStoreAdapter from "./adapters/GSheetsKeyValueStoreAdapter";
import GSheetsEditEventAdapter from "./adapters/GSheetsEditEventAdapter";
import TimeUtils from "../domain/utils/TimeUtils";
import LinAlgUtils from "../domain/utils/LinAlgUtils";
import { SWDashboardV2 } from "../domain/dashboards/SWDashboardV2";
import { STDashboardV2 } from "../domain/dashboards/STDashboardV2";

// Don't forget to add this line. Otherwise, the function won't be exported to the global scope.
// https://www.npmjs.com/package/gas-webpack-plugin
// (global as any).func = func;

// General info:
// https://developers.google.com/apps-script/guides/typescript

////////////////////////////////////////////////////////////////////////////////////////
// Dashboards

// -------------------------------------------------------------------------------------
// One arm handstands
const OAHSParamsMesos1To7 = [
  {
    inputs: [
      new GSheetsIOAdapter("22-SW", "H9:J9"),
      new GSheetsIOAdapter("22-SW", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-SWDashboard", "C11:Y14"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 1,
    },
  },
  {
    inputs: [new GSheetsIOAdapter("32-SW", "H9:J9")],
    output: new GSheetsIOAdapter("04-SWDashboard", "C15:Y18"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 5,
    },
  },
  {
    inputs: [new GSheetsIOAdapter("42-SW", "H14:J14")],
    output: new GSheetsIOAdapter("04-SWDashboard", "C19:Y22"),
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
    output: new GSheetsIOAdapter("04-SWDashboard", "C23:Y26"),
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
    output: new GSheetsIOAdapter("04-SWDashboard", "C27:Y30"),
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
    output: new GSheetsIOAdapter("04-SWDashboard", "C31:Y34"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 21,
    },
  },
];
const OAHSParamsMesos8AndBeyond = [
  {
    inputs: [
      new GSheetsIOAdapter("82-SW", "H14:J14"),
      new GSheetsIOAdapter("82-SW", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-SWDashboard", "C35:Y38"),
    microcycleCount: 4,
    args: {
      startMicrocycle: 25,
    },
  },
];
export function runOAHSDashboard() {
  OAHSParamsMesos1To7.forEach((mesoParams) => {
    new SWDashboardV1(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args,
    ).run();
  });
  OAHSParamsMesos8AndBeyond.forEach((mesoParams) => {
    new SWDashboardV2(
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
const dipsParamsMesos1And2 = [
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
const dipsParamsMesos6AndBeyond = [
  {
    inputs: [
      new GSheetsIOAdapter("63-ST", "H14:J14"),
      new GSheetsIOAdapter("63-ST", "H22:J22"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "F79:O98"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "C12").read(),
      minSetsJumpPerMicrocycle: [3, 3, 3, 3],
      startSequenceNumber: 73,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("73-ST", "H14:J14"),
      new GSheetsIOAdapter("73-ST", "H22:J22"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "F99:O118"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "C13").read(),
      minSetsJumpPerMicrocycle: [3, 3, 3, 3],
      startSequenceNumber: 93,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("83-ST", "H14:J14"),
      new GSheetsIOAdapter("83-ST", "H22:J22"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "F119:O154"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "C14").read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 113,
    },
  },
];
export function runDipsDashboard() {
  dipsParamsMesos1And2.forEach((mesoParams) => {
    new STDashboardV1(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args,
    ).run();
  });
  dipsParamsMesos6AndBeyond.forEach((mesoParams) => {
    new STDashboardV2(
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
const pullUpParamsMesos1And2 = [
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
const pullUpParamsMesos6AndBeyond = [
  {
    inputs: [
      new GSheetsIOAdapter("63-ST", "H10:J10"),
      new GSheetsIOAdapter("63-ST", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "Q79:Z98"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "D12").read(),
      minSetsJumpPerMicrocycle: [3, 3, 3, 3],
      startSequenceNumber: 73,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("73-ST", "H10:J10"),
      new GSheetsIOAdapter("73-ST", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "Q99:Z118"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "D13").read(),
      minSetsJumpPerMicrocycle: [3, 3, 3, 3],
      startSequenceNumber: 93,
    },
  },
  {
    inputs: [
      new GSheetsIOAdapter("83-ST", "H10:J10"),
      new GSheetsIOAdapter("83-ST", "H18:J18"),
    ],
    output: new GSheetsIOAdapter("04-STDashboard", "Q119:Z154"),
    microcycleCount: 4,
    args: {
      previous1RM: new GSheetsIOAdapter("04-STDashboard", "D14").read(),
      minSetsJumpPerMicrocycle: [4, 8, 7, 6],
      startSequenceNumber: 113,
    },
  },
];
export function runPullUpsDashboard() {
  pullUpParamsMesos1And2.forEach((mesoParams) => {
    new STDashboardV1(
      mesoParams.inputs,
      mesoParams.output,
      mesoParams.microcycleCount,
      mesoParams.args,
    ).run();
  });
  pullUpParamsMesos6AndBeyond.forEach((mesoParams) => {
    new STDashboardV2(
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
  e1RM: new GSheetsIOAdapter("03-STEstimation", "P5"),
  bw: new GSheetsIOAdapter("03-STEstimation", "P6"),
  requiredRPE: new GSheetsIOAdapter("03-STEstimation", "P7"),
  intensities: new GSheetsIOAdapter("03-STEstimation", "S7:S46"),
  reps: new GSheetsIOAdapter("03-STEstimation", "T6:AB6"),
};
const store = new GSheetsKeyValueStoreAdapter();
const e1RMMatrixOutput = {
  differences: new GSheetsIOAdapter("03-STEstimation", "T7:AC46"),
};
(global as any).onPeriodizationEdit = (
  e: GoogleAppsScript.Events.SheetsOnEdit,
) =>
  onPeriodizationEdit(
    new GSheetsEditEventAdapter(e, "03-STEstimation", "P5:P7"),
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
