import SpreadsheetIOAdapter from "../adapters/SpreadsheetIOAdapter";
import STUtils from "../utils/STUtils";
import GeneralUtils from "../utils/GeneralUtils";
import { KeyValueStorePort } from "../ports/KeyValueStore";

type e1RMMatrixInput = {
  e1RM: SpreadsheetIOAdapter,
  requiredRPE: SpreadsheetIOAdapter,
  intensities: SpreadsheetIOAdapter,
  reps: SpreadsheetIOAdapter,
  bw: SpreadsheetIOAdapter,
}

type e1RMMatrixOutput = {
  differences: SpreadsheetIOAdapter,
}

// https://developers.google.com/apps-script/guides/triggers
// https://developers.google.com/apps-script/guides/properties
export function onPeriodizationEdit(
  e: GoogleAppsScript.Events.SheetsOnEdit,
  input: e1RMMatrixInput,
  store: KeyValueStorePort,
  output: e1RMMatrixOutput
): void {
  const SHEET_NAME = "04-e1RM";
  if (e.range.getSheet().getName() !== SHEET_NAME) return;

  const previousE1RM = store.get("previousE1RM") || 0;
  const previousRPE = store.get("previousRPE") || 0;
  const newE1RM = input.e1RM.read();
  const newRPE = input.requiredRPE.read();
  if (newE1RM === previousE1RM && newRPE === previousRPE) return;

  store.set("previousE1RM", newE1RM);
  store.set("previousRPE", newRPE);

  const fractions = input.intensities.read().flat();
  const reps = input.reps.read().flat();
  const bw = input.bw.read();

  const intensityVolumeMatrix = computeIntensityVolumeMatrix(
    { fractions, reps },
    { previousE1RM: newE1RM, requiredRPE: newRPE, bw }
  );
  const plateWeights = GeneralUtils.transpose(
    computePlateWeights(fractions, newE1RM)
  );

  output.differences.write(
    GeneralUtils.concatMatricesHorizontally(intensityVolumeMatrix, plateWeights)
  );
}

function computePlateWeight(weight: number) {
  const PLATES = [20, 10, 5, 2.5, 1.25];

  let remainder = weight;
  let platesSum = 0;
  let quotient: number;
  PLATES.forEach((plate) => {
    quotient = Math.floor(remainder / plate);
    platesSum += quotient * plate;
    remainder -= quotient * plate;
  });

  const floor = platesSum;
  const ceil = platesSum + PLATES[PLATES.length - 1];
  const diffFloor = Math.abs(weight - floor);
  const diffCeil = Math.abs(weight - ceil);
  return diffFloor < diffCeil ? floor : ceil;
}

function computePlateWeights(
  fractions: number[],
  previousE1RM: number
): number[][] {
  return [
    fractions.map((fraction) => computePlateWeight(previousE1RM * fraction)),
  ];
}

export function computeIntensityVolumeMatrix(
  axes: { fractions: number[]; reps: number[] },
  input: { previousE1RM: number; requiredRPE: number; bw: number }
): number[][] {
  return axes.fractions.map((fraction: number) =>
    axes.reps.map((reps: number) => {
      return computePlateWeight(
        STUtils.estimate1RM({
          weight: input.previousE1RM * fraction,
          bw: input.bw,
          reps,
          rpe: input.requiredRPE,
        }) - input.previousE1RM
      );
    })
  );
}
