// https://developers.google.com/apps-script/guides/triggers


function onPeriodizationEdit(e) {
  const E1M_CELL = "H44";
  const FRACTIONS_RANGE = "G45:G84";

  const sheet = e.range.getSheet();
  if (e.range.getA1Notation() === E1M_CELL) {
    const fractionsRange = sheet.getRange(FRACTIONS_RANGE); 
    const plateWeights = getPlateWeights(
      e.range.getValue(),
      fractionsRange.getValues().map(row => row[0])
    );
    fractionsRange.offset(0, 1).setValues(plateWeights);
  }
}

function getPlateWeights(e1RM, fractions) {
  const PLATES = [20, 10, 5, 2.5, 1.25];
  
  const plateWeights = [];
  let remainder, quotient, platesSum, floor, ceil;

  fractions.forEach(fraction => { 
    remainder = e1RM * fraction;
    platesSum = 0;

    PLATES.forEach(plate => {
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