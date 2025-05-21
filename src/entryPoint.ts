import { moduleBFunction } from "./moduleB";

export function entryPointFunction(): void {
  moduleBFunction();
  console.log("Entry Point Function");
}

// Don't forget to add this line. Otherwise, the function won't be exported to the global scope.
// https://www.npmjs.com/package/gas-webpack-plugin
(global as any).entryPointFunction = entryPointFunction;

// Use multiple github accounts:
// Source: https://stackoverflow.com/a/27407168
// Make sure to run: git remote set-url origin https://<USERNAME>@github.com/<USERNAME>/<REMOTE-NAME>
// Then, login on the browser.

// General info:
// https://developers.google.com/apps-script/guides/typescript
