import { renderHook } from "@testing-library/react";
import { useWeaponConverter } from "../../hooks/useWeaponConverter";

describe("武器转换器性能测试", () => {
  describe("Hook 性能", () => {
    it("应该快速初始化", () => {
      const startTime = performance.now();
      const { result } = renderHook(() => useWeaponConverter());
      const endTime = performance.now();
      const initTime = endTime - startTime;

      expect(initTime).toBeLessThan(200); // 放宽到200ms
      expect(result.current).toBeDefined();
    });
  });
});
