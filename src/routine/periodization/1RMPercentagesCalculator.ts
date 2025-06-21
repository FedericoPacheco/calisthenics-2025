import SpreadsheetIOAdapter from '../../utils/SpreadsheetIOAdapter';

// https://developers.google.com/apps-script/guides/triggers
export function onPeriodizationEdit(
  e: GoogleAppsScript.Events.SheetsOnEdit
): void {
  const E1M_CELL = 'J39';
  const SHEET_NAME = '02-Periodization';
  const fractionsInput = new SpreadsheetIOAdapter(SHEET_NAME, 'I40:I78');
  const weightsOutput = new SpreadsheetIOAdapter(SHEET_NAME, 'J40:J78');

  if (
    e.range.getSheet().getName() === SHEET_NAME &&
    e.range.getA1Notation() === E1M_CELL
  ) {
    const fractions = fractionsInput.read();
    const plateWeights = getPlateWeights(
      e.range.getValue(),
      fractions.map((fractionRow: number[]) => fractionRow[0])
    );
    weightsOutput.write(plateWeights.map((weight) => [weight]));
  }
}

function getPlateWeights(e1RM: number, fractions: number[]): number[] {
  return fractions.map((fraction) => computePlateWeight(e1RM * fraction));
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
