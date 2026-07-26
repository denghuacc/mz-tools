import { vi } from "vite-plus/test";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  PREFERENCES_STORAGE_KEY,
  resetPreferences,
  updatePreferences,
} from "../preferences";

describe("用户偏好存储", () => {
  it("没有缓存时返回默认值", () => {
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("只恢复通过校验的版本化选择项", () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        activeTool: "ring",
        weaponLevel: "60-standard",
        weaponCurrentSect: "青云门",
        weaponTargetSect: "天音寺",
        ringCurrentSect: "合欢门",
        ringTargetSect: "万灵宫",
      }),
    );

    expect(loadPreferences()).toEqual({
      activeTool: "ring",
      weaponLevel: "60-standard",
      weaponCurrentSect: "青云门",
      weaponTargetSect: "天音寺",
      ringCurrentSect: "合欢门",
      ringTargetSect: "万灵宫",
    });
  });

  it("损坏或非法字段安全回退默认值", () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        activeTool: "unknown",
        weaponLevel: 90,
        weaponCurrentSect: "不存在门派",
        weaponTargetSect: null,
        ringCurrentSect: 1,
        ringTargetSect: {},
      }),
    );

    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);

    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, "not-json");
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);

    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify("bad"));
    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("合并偏好时不会保存输入值和计算结果", () => {
    const updated = updatePreferences({
      activeTool: "ring",
      weaponLevel: 110,
    });
    const stored = JSON.parse(
      window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "{}",
    );

    expect(updated.activeTool).toBe("ring");
    expect(updated.weaponLevel).toBe(110);
    expect(Object.keys(stored).sort()).toEqual(
      Object.keys(DEFAULT_PREFERENCES).sort(),
    );
    expect(stored).not.toHaveProperty("attributes");
    expect(stored).not.toHaveProperty("result");
    expect(stored).not.toHaveProperty("error");
  });

  it("localStorage 读写不可用时仍可使用默认偏好", () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });

    expect(loadPreferences()).toEqual(DEFAULT_PREFERENCES);
    getItem.mockRestore();

    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    expect(updatePreferences({ activeTool: "ring" }).activeTool).toBe("ring");
    setItem.mockRestore();
  });

  it("应该清除偏好并在删除失败时返回默认值", () => {
    updatePreferences({ activeTool: "ring" });
    expect(resetPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)).toBeNull();

    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    expect(resetPreferences()).toEqual(DEFAULT_PREFERENCES);
    removeItem.mockRestore();
  });
});
