/**
 * @customfunction
 */
function getDataWrapper() {
  // Constants
  const OUTPUT_SPREADSHEET = "04-ControlPanel";
  const OUTPUT_INIT_ROW_IDX = 8;
  const OUTPUT_COL_INTENSITY = "D";
  const OUTPUT_COL_REPS = "F";
  const OUTPUT_COL_T_RPE = "G";
  const OUTPUT_COL_DIPS_START = "H";
  const OUTPUT_COL_DIPS_END = "L";
  const OUTPUT_COL_PULL_UPS_START = "M";
  const OUTPUT_COL_PULL_UPS_END = "Q";
  const OUTPUT_BW_RANGE = "O4:Q4";
  const OUTPUT_PREV_1RM_DIPS = "K4";
  const OUTPUT_PREV_1RM_PULL_UPS = "L4";

  const INPUT_SETS_PER_MESOCYCLE = 18;
  const INPUT_DAY1_ORIGIN_DIPS = "K16";
  const INPUT_DAY2_ORIGIN_DIPS = "K29";
  const INPUT_DAY1_ORIGIN_PULL_UPS = "K10";
  const INPUT_DAY2_ORIGIN_PULL_UPS = "K23";
  const INPUT_ST_SPREADSHEETS = ["13-ST", "23-ST", "33-ST"];

  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const outputSheet = sheet.getSheetByName(OUTPUT_SPREADSHEET);
  const bwRange = outputSheet.getRange(OUTPUT_BW_RANGE);
  const baseline1RMDips = outputSheet.getRange(OUTPUT_PREV_1RM_DIPS).getValue();
  const baseline1RMPullUps = outputSheet
    .getRange(OUTPUT_PREV_1RM_PULL_UPS)
    .getValue();

  const rangeOf = (col1, col2, outputRowIdx) =>
    `${col1}${outputRowIdx}:${col2}${outputRowIdx + INPUT_SETS_PER_MESOCYCLE - 1}`;

  const flattenMatrix = (matrix) =>
    matrix.reduce((acc, row) => [...acc, ...row], []);

  let outputRowIdx = OUTPUT_INIT_ROW_IDX,
    data,
    inputSheet,
    intensityArr,
    repsArr,
    tRpeArr,
    bw;

  INPUT_ST_SPREADSHEETS.forEach((stSheet, i) => {
    inputSheet = sheet.getSheetByName(stSheet);
    if (inputSheet) {
      intensityArr = flattenMatrix(
        outputSheet
          .getRange(
            rangeOf(OUTPUT_COL_INTENSITY, OUTPUT_COL_INTENSITY, outputRowIdx)
          )
          .getValues()
      );
      repsArr = flattenMatrix(
        outputSheet
          .getRange(rangeOf(OUTPUT_COL_REPS, OUTPUT_COL_REPS, outputRowIdx))
          .getValues()
      );
      tRpeArr = flattenMatrix(
        outputSheet
          .getRange(rangeOf(OUTPUT_COL_T_RPE, OUTPUT_COL_T_RPE, outputRowIdx))
          .getValues()
      );
      const bw = bwRange.getCell(1, i + 1).getValue();

      data = getData(
        [
          inputSheet.getRange(INPUT_DAY1_ORIGIN_DIPS),
          inputSheet.getRange(INPUT_DAY2_ORIGIN_DIPS),
        ],
        intensityArr,
        repsArr,
        tRpeArr,
        bw,
        baseline1RMDips
      );
      outputSheet
        .getRange(
          rangeOf(OUTPUT_COL_DIPS_START, OUTPUT_COL_DIPS_END, outputRowIdx)
        )
        .setValues(data);

      data = getData(
        [
          inputSheet.getRange(INPUT_DAY1_ORIGIN_PULL_UPS),
          inputSheet.getRange(INPUT_DAY2_ORIGIN_PULL_UPS),
        ],
        intensityArr,
        repsArr,
        tRpeArr,
        bw,
        baseline1RMPullUps
      );
      outputSheet
        .getRange(
          rangeOf(
            OUTPUT_COL_PULL_UPS_START,
            OUTPUT_COL_PULL_UPS_END,
            outputRowIdx
          )
        )
        .setValues(data);
    }

    outputRowIdx += INPUT_SETS_PER_MESOCYCLE;
  });
}

function getData(
  inputOrigins,
  intensityArr,
  repsArr,
  tRpeArr,
  bw,
  baseline1RM
) {
  const INTRA_MESOCYCLE_HOP = 3;
  const INTER_MICROCYCLE_HOP = 8;
  const HEAVY = "Heavy";
  const MICROCYCLE_SETS = [4, 3, 2];

  const data = [];
  let i = 0;
  let currentDayWeight = [...inputOrigins];
  let sum, weight, rpe, tec, e1rmChange, rir;

  MICROCYCLE_SETS.forEach((sets) => {
    for (let w = 0; w < currentDayWeight.length; w++) {
      sum = 0;
      for (let s = 1; s <= sets; s++) {
        weight = Number(currentDayWeight[w].getValue());
        rpe = Number(currentDayWeight[w].offset(0, 1).getValue());
        tec = Number(currentDayWeight[w].offset(0, 2).getValue());
        if (rpe === 0) rpe = tRpeArr[i];
        rir = 10 - rpe;
        sum += weight;
        e1rmChange =
          intensityArr[i] === HEAVY
            ? getE1RM(weight, bw, repsArr[i] + rir) - baseline1RM
            : 0;

        data.push([tec, rpe - tRpeArr[i], weight, 0, e1rmChange]);

        if (s < sets) {
          currentDayWeight[w] = currentDayWeight[w].offset(
            0,
            INTRA_MESOCYCLE_HOP
          );
        } else {
          currentDayWeight[w] = currentDayWeight[w].offset(
            0,
            INTER_MICROCYCLE_HOP
          );
          for (let avg = i; avg > i - sets; avg--) {
            data[avg][3] = sum / sets;
          }
        }
        i++;
      }
    }
  });

  return data;
}

function getE1RM(weightLifted, bw, reps) {
  const e = 2.71828182845904;
  const totalWeight = weightLifted + bw;
  const epley = totalWeight * (1 + reps / 30) - bw;
  const brzycki = (totalWeight * 36) / (37 - reps) - bw;
  const berger =
    totalWeight * (1 / (1.0261 * Math.pow(e, -0.0262 * reps))) - bw;
  return (epley + brzycki + berger) / 3;
}
