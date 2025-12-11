import { suite, test } from "mocha";
import { assert } from "chai";
import { stub, restore, spy } from "sinon";
import GSheetsKeyValueStore from "../../../src/infra/adapters/GSheetsKeyValueStore";

suite("GSheetsKeyValueStore", () => {
  let props: any;
  let store: GSheetsKeyValueStore;

  setup(function () {
    props = {
      getProperty: spy(),
      setProperty: spy(),
      deleteProperty: spy(),
    } as unknown as GoogleAppsScript.Properties.Properties;
    global.PropertiesService = {
      getScriptProperties: () => props,
    } as unknown as GoogleAppsScript.Properties.PropertiesService;

    store = new GSheetsKeyValueStore();
  });

  teardown(function () {
    restore();
  });

  suite("set()", function () {
    test("should convert object input to string before storing it", function () {
      const input = { a: 1, b: 2 };

      store.set("testKey", input);

      assert.isTrue(
        props.setProperty.calledOnceWith("testKey", '{"a":1,"b":2}')
      );
    });

    test("should convert number input to string before storing it", function () {
      const input = 42;

      store.set("testKey", input);

      assert.isTrue(props.setProperty.calledOnceWith("testKey", "42"));
    });

    test("should convert array input to string before storing it", function () {
      const input = [1, 2, 3];

      store.set("testKey", input);

      assert.isTrue(props.setProperty.calledOnceWith("testKey", "[1,2,3]"));
    });

    test("should throw on undefined input", function () {
      assert.throws(() => store.set("testKey", undefined));
      assert.isTrue(props.setProperty.notCalled);
    });

    test("should throw on null input", function () {
      assert.throws(() => store.set("testKey", null));
      assert.isTrue(props.setProperty.notCalled);
    });
  });

  suite("get()", function () {
    test("should parse non-string value", function () {
      props.getProperty = stub().returns('{"a":1,"b":2}');

      const result = store.get("testKey");

      assert.deepEqual(result, { a: 1, b: 2 });
    });

    test("should not parse string value", function () {
      props.getProperty = stub().returns("heyy");
      
      const result = store.get("testKey");

      assert.equal(result, "heyy");
    });
  });
});
