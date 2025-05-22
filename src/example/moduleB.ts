import { moduleAFunction } from "./moduleA";

export function moduleBFunction(): void {
  moduleAFunction();
  console.log("Module B Function");
}
