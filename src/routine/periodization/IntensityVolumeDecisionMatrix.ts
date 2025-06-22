import SpreadsheetIOAdapter from '../../utils/SpreadsheetIOAdapter';
import STUtils from '../../STUtils';
import GeneralUtils from '../../utils/GeneralUtils';

// https://developers.google.com/apps-script/guides/triggers
// https://developers.google.com/apps-script/guides/properties
export function onPeriodizationEdit(
  e: GoogleAppsScript.Events.SheetsOnEdit
): void {
  const SHEET_NAME = '04-Utils';
  if (e.range.getSheet().getName() !== SHEET_NAME) return;

  // Use PropertiesService to persist values accross script executions
  const props = PropertiesService.getScriptProperties();
  const previousE1RM = props.getProperty('previousE1RM')
    ? Number(props.getProperty('previousE1RM'))
    : 0;
  const previousRPE = props.getProperty('previousRPE')
    ? Number(props.getProperty('previousRPE'))
    : 0;
  const newE1RM = new SpreadsheetIOAdapter(SHEET_NAME, 'D7').read();
  const newRPE = new SpreadsheetIOAdapter(SHEET_NAME, 'D9').read();
  if (newE1RM === previousE1RM && newRPE === previousRPE) return;

  props.setProperty('previousE1RM', String(newE1RM));
  props.setProperty('previousRPE', String(newRPE));

  const fractions = new SpreadsheetIOAdapter(SHEET_NAME, 'G5:G44')
    .read()
    .flat();
  const reps = new SpreadsheetIOAdapter(SHEET_NAME, 'H4:P4').read().flat();
  const bw = new SpreadsheetIOAdapter(SHEET_NAME, 'D8').read();

  const intensityVolumeMatrix = computeIntensityVolumeMatrix(
    { fractions, reps },
    { previousE1RM: newE1RM, requiredRPE: newRPE, bw }
  );
  const plateWeights = GeneralUtils.transpose(
    computePlateWeights(fractions, newE1RM)
  );

  new SpreadsheetIOAdapter(SHEET_NAME, 'H5:Q44').write(
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
        STUtils.computeE1RM(
          input.previousE1RM * fraction,
          input.bw,
          reps + 10 - input.requiredRPE
        ) - input.previousE1RM
      );
    })
  );
}
