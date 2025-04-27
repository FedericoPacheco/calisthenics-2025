import { moduleBFunction } from "./moduleB";

// https://www.npmjs.com/package/gas-webpack-plugin

export function entryPointFunction(): void {
  moduleBFunction();
  console.log("Entry Point Function");
}

(global as any).entryPointFunction = entryPointFunction;
