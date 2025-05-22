// src/example.spec.ts
import { suite, test } from "mocha";
import { assert } from "chai";
import sinon from "sinon";
import { moduleBFunction } from "../../src/example/moduleB";

suite("Module B Test Suite", function () {
  test("should call console.log from moduleBfunction", function () {
    const consoleLogSpy = sinon.spy(console, "log");

    debugger;
    moduleBFunction();

    assert.isTrue(
      consoleLogSpy.calledTwice,
      "Expected console.log to be called twice"
    );

    consoleLogSpy.restore();
  });
});
