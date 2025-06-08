// https://developers.google.com/apps-script/guides/triggers
export function onPeriodizationEdit(
  e: GoogleAppsScript.Events.SheetsOnEdit
): void {
  const E1M_CELL = "H44";
  const FRACTIONS_RANGE = "G45:G84";
  const SHEET_NAME = "02-Periodization";

  const sheet = e.range.getSheet();
  if (sheet.getName() === SHEET_NAME && e.range.getA1Notation() === E1M_CELL) {
    const fractionsRange = sheet.getRange(FRACTIONS_RANGE);
    const plateWeights = getPlateWeights(
      e.range.getValue(),
      fractionsRange.getValues().map((row) => row[0])
    );
    fractionsRange.offset(0, 1).setValues(plateWeights);
  }
}

function getPlateWeights(e1RM: number, fractions: number[]): number[][] {
  const PLATES = [20, 10, 5, 2.5, 1.25];

  const plateWeights: number[][] = [];
  let remainder: number,
    quotient: number,
    platesSum: number,
    floor: number,
    ceil: number;

  fractions.forEach((fraction) => {
    remainder = e1RM * fraction;
    platesSum = 0;

    PLATES.forEach((plate) => {
      quotient = Math.floor(remainder / plate);
      platesSum += quotient * plate;
      remainder -= quotient * plate;
    });

    floor = platesSum;
    ceil = platesSum + PLATES[PLATES.length - 1];
    const diffFloor = Math.abs(e1RM * fraction - floor);
    const diffCeil = Math.abs(e1RM * fraction - ceil);
    plateWeights.push([diffFloor < diffCeil ? floor : ceil]);
  });

  return plateWeights;
}
