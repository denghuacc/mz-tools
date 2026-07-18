import { vi } from "vitest";
import {
  loadCalculatorState,
  saveCalculatorState,
} from "../calculatorStorage";

const STORAGE_KEY = "test.calculator-state.v1";

describe("计算器本地状态存储", () => {
  it("应该保存并通过校验函数恢复状态", () => {
    saveCalculatorState(STORAGE_KEY, { value: 42 });

    expect(
      loadCalculatorState(STORAGE_KEY, { value: 0 }, (stored) =>
        typeof stored === "object" &&
        stored !== null &&
        "value" in stored &&
        typeof stored.value === "number"
          ? { value: stored.value }
          : null
      )
    ).toEqual({ value: 42 });
  });

  it("缓存损坏或校验失败时应该返回默认值", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");
    expect(loadCalculatorState(STORAGE_KEY, { value: 0 }, () => null)).toEqual({
      value: 0,
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ value: "bad" }));
    expect(loadCalculatorState(STORAGE_KEY, { value: 0 }, () => null)).toEqual({
      value: 0,
    });
  });

  it("localStorage 不可用时不应阻断计算器", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    expect(loadCalculatorState(STORAGE_KEY, { value: 0 }, () => null)).toEqual({
      value: 0,
    });
    getItem.mockRestore();

    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });
    expect(() => saveCalculatorState(STORAGE_KEY, { value: 42 })).not.toThrow();
    setItem.mockRestore();
  });
});
