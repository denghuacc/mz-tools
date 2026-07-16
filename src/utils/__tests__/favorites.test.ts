import { vi } from "vitest";
import {
  clearFavorites,
  EMPTY_FAVORITES,
  FAVORITES_STORAGE_KEY,
  isFavorite,
  loadFavorites,
  toggleFavorite,
} from "../favorites";

describe("内容收藏存储", () => {
  it("应该添加和取消有效收藏", () => {
    const added = toggleFavorite(EMPTY_FAVORITES, "sect", "鬼王宗");
    expect(isFavorite(added, "sect", "鬼王宗")).toBe(true);
    expect(loadFavorites()).toEqual(added);

    const removed = toggleFavorite(added, "sect", "鬼王宗");
    expect(removed).toEqual(EMPTY_FAVORITES);
  });

  it("应该过滤重复、非法和已失效的 ID", () => {
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({
        items: ["sect:鬼王宗", "sect:鬼王宗", "guide:missing", 1],
      })
    );

    expect(loadFavorites()).toEqual({ items: ["sect:鬼王宗"] });
  });

  it("损坏数据和不可用存储应该安全回退", () => {
    for (const value of ["bad-json", JSON.stringify([]), JSON.stringify({})]) {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, value);
      expect(loadFavorites()).toEqual(EMPTY_FAVORITES);
    }

    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    expect(loadFavorites()).toEqual(EMPTY_FAVORITES);
    getItem.mockRestore();

    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });
    expect(toggleFavorite(EMPTY_FAVORITES, "guide", "official-strategy-hub")).toEqual({
      items: ["guide:official-strategy-hub"],
    });
    setItem.mockRestore();
  });

  it("应该清空收藏且处理删除失败", () => {
    toggleFavorite(EMPTY_FAVORITES, "sect", "青云门");
    expect(clearFavorites()).toEqual(EMPTY_FAVORITES);
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBeNull();

    const removeItem = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage disabled");
      });
    expect(clearFavorites()).toEqual(EMPTY_FAVORITES);
    removeItem.mockRestore();
  });
});
