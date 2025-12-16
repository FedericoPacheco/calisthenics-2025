# Calisthenics 2025

## Overview

A TypeScript-based Google Apps Script system for tracking and analyzing calisthenics workouts through Google Sheets. [Access the spreadsheet as a viewer](https://docs.google.com/spreadsheets/d/1nmEsa4n25cvHHcMAB-v0p4bg6p7RR3qPb2e9LyXbxXU/edit?usp=sharing).

Key features:

- **1RM Estimation** (`03-Estimation`): uses multiple regression models to estimate maximal muscular strength to address progress or decide training loads.
- **Dips & Pull Ups Dashboard** (`04-STDashboard`): extract training data (work performed, intensity, effort) from workout logs and applies simple transformations to monitor progress through time series and histograms charts.
- **One Arm Handstand Dashboard** (`04-SWDashboard`): extract skill work data (finger usage, technique) from workout logs and computes summary statistics to monitor progress through time series and bar charts.
- **Custom functions**: utilities to compute estimated 1RMs and convert time formats directly from spreadsheet cells.

Read further details about them on the `Info` boxes within the spreadsheet.

## Architecture

The project follows a hexagonal (ports and adapters) architecture, splitting between domain logic and infrastructure concerns. The domain doesn't depend on any Google Apps Script service or API, but on abstractions (ports) that are implemented in the infrastructure layer (adapters).

Ports:

- `EditEventPort`: abstraction for edit events on a range of cells.
- `IOPort`: abstraction for reading and writing data to the spreadsheet, as well as moving around or resizing ranges references.
- `KeyValueStorePort`: abstraction for simple persistence through key-value pairs.

Adapters:

- `GSheetsEditEventAdapter`: implementation of `EditEventPort` using GA's [Event Objects](https://developers.google.com/apps-script/guides/triggers/events).

- `GSheetsIOAdapter`: implementation of `IOPort` using GA's [SpreadsheetApp](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app), [Sheet](https://developers.google.com/apps-script/reference/spreadsheet/sheet), and [Range](https://developers.google.com/apps-script/reference/spreadsheet/range) classes.

- `GSheetsKeyValueStoreAdapter`: implementation of `KeyValueStorePort` using GA's [Properties Service](https://developers.google.com/apps-script/reference/properties/properties-service).

## Testing

The project includes an extensive suite of passing unit tests for the domain classes, utilities, and adapters, most of them wrote following a TDD approach. 

Run all tests:

```bash
npm test
```

Debug tests:

```bash
npm run test:debug
```

## Deployment

1. Make a copy of the spreadsheet linked above.

2. Inside the spreadsheet, go to Extensions > Apps Script > Project Settings > Script ID > Copy. Paste it in "scriptId" inside .clasp.json

3. Login with your Google account:

    ```bash
    clasp login
    ```

4. Build with webpack and push the code to the Apps Script project:

    ```bash
    npm run push
    ```

5. Just in case, reload the spreadsheet.

Don't deploy if tests fail, don't be foolish.
