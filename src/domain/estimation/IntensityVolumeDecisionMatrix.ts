import OneRMEstimator from "./OneRMEstimator";
import { KeyValueStorePort } from "../ports/KeyValueStorePort";
import { IOPort } from "../ports/IOPort";
import { EditEventPort } from "../ports/EditEventPort";
import LinAlgUtils from "../utils/LinAlgUtils";

type e1RMMatrixInput = {
  e1RM: IOPort,
  requiredRPE: IOPort,
  intensities: IOPort,
  reps: IOPort,
  bw: IOPort,
}

type e1RMMatrixOutput = {
  differences: IOPort,
}

export function onPeriodizationEdit(
  e: EditEventPort,
  input: e1RMMatrixInput,
  store: KeyValueStorePort,
  output: e1RMMatrixOutput
): void {
  if (!e.shouldHandle()) return;

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
  const plateWeights = LinAlgUtils.transpose(
    computePlateWeights(fractions, newE1RM)
  );

  output.differences.write(
    LinAlgUtils.concatMatricesHorizontally(intensityVolumeMatrix, plateWeights)
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
        OneRMEstimator.estimate({
          weight: input.previousE1RM * fraction,
          bw: input.bw,
          reps,
          rpe: input.requiredRPE,
        }) - input.previousE1RM
      );
    })
  );
}
