import { renderHook, act } from "@testing-library/react";
import { useWeaponConverter } from "../hooks/useWeaponConverter";
import type { Attributes } from "../types";

describe("完整职业转换测试 - 24种组合", () => {
  /**
   * 重要说明：关于封系门派的武器转换规则
   *
   * 1. 游戏规则规定，封系与其他系别的武器互转时属性保持不变：
   *    - 任何门派 → 封印门派：不会发生转换，保持原值不变
   *    - 封印门派 → 任何门派：也不会发生转换，保持原值不变
   *
   * 2. 在三门派转换中（A→B→C），B是原造型：
   *    - 如果原造型B是封印门派，那么无论如何转换，属性都不会变
   *    - A→B 和 B→C 都属于封系与其他系别互转，两个步骤均保持属性不变
   *
   * 戒指转换另有速度、封印命中等规则，不属于本武器转换器的计算范围。
   */

  // 武器数据组1
  const weaponData1 = {
    physical: { current: 500, max: 665 },
    magic: { current: 150, max: 210 },
    healing: { current: 120, max: 192 },
  };

  // 武器数据组2
  const weaponData2 = {
    physical: { current: 400, max: 665 },
    magic: { current: 180, max: 210 },
    healing: { current: 150, max: 192 },
  };

  // 武器数据组3
  const weaponData3 = {
    physical: { current: 600, max: 665 },
    magic: { current: 120, max: 210 },
    healing: { current: 100, max: 192 },
  };

  // 门派映射
  const sectMap = {
    healing: "天音寺" as const,
    physical: "鬼王宗" as const,
    magic: "青云门" as const,
    seal: "合欢门" as const,
  };

  // 武器类型映射
  const weaponMap = {
    healing: "禅杖" as const,
    physical: "刀" as const,
    magic: "剑" as const,
    seal: "短刃" as const,
  };

  // 辅助函数：执行转换并返回结果
  const performConversion = (
    weaponData: Attributes,
    from: string,
    via: string,
    to: string,
  ) => {
    const { result } = renderHook(() => useWeaponConverter());

    act(() => {
      result.current.setWeaponLevelAndMaxValues(60);
    });
    act(() => {
      result.current.setAttributes(weaponData);
    });
    act(() => {
      result.current.setCurrentSect(sectMap[from as keyof typeof sectMap]);
    });
    act(() => {
      result.current.setTargetSect(sectMap[to as keyof typeof sectMap]);
    });
    act(() => {
      result.current.setOriginalForm(weaponMap[via as keyof typeof weaponMap]);
    });
    act(() => {
      result.current.convertAttributes();
    });

    expect(result.current.result).not.toBeNull();
    expect(result.current.error).toBeNull();

    return result.current.result!;
  };

  // ...existing code...

  // 测试数据集合
  const testDataSets = [
    { name: "武器数据组1", data: weaponData1 },
    { name: "武器数据组2", data: weaponData2 },
    { name: "武器数据组3", data: weaponData3 },
  ];

  // 期望结果映射
  const expectedResults = {
    武器数据组1: {
      "healing→physical→magic": { physical: 475, magic: 131, healing: 144 },
      "healing→magic→physical": { physical: 415, magic: 158, healing: 137 },
      "physical→healing→magic": { physical: 416, magic: 158, healing: 137 },
      "physical→magic→healing": { physical: 475, magic: 131, healing: 144 },
      "magic→healing→physical": { physical: 475, magic: 131, healing: 144 },
      "magic→physical→healing": { physical: 416, magic: 158, healing: 137 },

      // 通过封印门派的转换（保持原值不变）
      "healing→seal→physical": { physical: 500, magic: 150, healing: 120 },
      "physical→seal→healing": { physical: 500, magic: 150, healing: 120 },
      "healing→seal→magic": { physical: 500, magic: 150, healing: 120 },
      "magic→seal→healing": { physical: 500, magic: 150, healing: 120 },
      "physical→seal→magic": { physical: 500, magic: 150, healing: 120 },
      "magic→seal→physical": { physical: 500, magic: 150, healing: 120 },

      // 其他转换（目标是封印门派的情况）
      "healing→physical→seal": { physical: 416, magic: 150, healing: 144 },
      "physical→healing→seal": { physical: 416, magic: 150, healing: 144 },
      "healing→magic→seal": { physical: 500, magic: 131, healing: 137 },
      "magic→healing→seal": { physical: 500, magic: 131, healing: 137 },
      "physical→magic→seal": { physical: 475, magic: 158, healing: 120 },
      "magic→physical→seal": { physical: 475, magic: 158, healing: 120 },

      // 从封印门派开始的转换
      "seal→healing→physical": { physical: 416, magic: 150, healing: 144 },
      "seal→physical→healing": { physical: 416, magic: 150, healing: 144 },
      "seal→healing→magic": { physical: 500, magic: 131, healing: 137 },
      "seal→magic→healing": { physical: 500, magic: 131, healing: 137 },
      "seal→physical→magic": { physical: 475, magic: 158, healing: 120 },
      "seal→magic→physical": { physical: 475, magic: 158, healing: 120 },
    },
    武器数据组2: {
      "healing→physical→magic": { physical: 570, magic: 164, healing: 115 },
      "healing→magic→physical": { physical: 519, magic: 126, healing: 165 },
      "physical→healing→magic": { physical: 520, magic: 126, healing: 165 },
      "physical→magic→healing": { physical: 570, magic: 164, healing: 115 },
      "magic→healing→physical": { physical: 571, magic: 164, healing: 115 },
      "magic→physical→healing": { physical: 520, magic: 126, healing: 165 },

      // 通过封印门派的转换（保持原值不变）
      "healing→seal→physical": { physical: 400, magic: 180, healing: 150 },
      "physical→seal→healing": { physical: 400, magic: 180, healing: 150 },
      "healing→seal→magic": { physical: 400, magic: 180, healing: 150 },
      "magic→seal→healing": { physical: 400, magic: 180, healing: 150 },
      "physical→seal→magic": { physical: 400, magic: 180, healing: 150 },
      "magic→seal→physical": { physical: 400, magic: 180, healing: 150 },

      // 其他转换（目标是封印门派的情况）
      "healing→physical→seal": { physical: 520, magic: 180, healing: 115 },
      "physical→healing→seal": { physical: 520, magic: 180, healing: 115 },
      "healing→magic→seal": { physical: 400, magic: 164, healing: 165 },
      "magic→healing→seal": { physical: 400, magic: 164, healing: 165 },
      "physical→magic→seal": { physical: 570, magic: 126, healing: 150 },
      "magic→physical→seal": { physical: 570, magic: 126, healing: 150 },

      // 从封印门派开始的转换
      "seal→healing→physical": { physical: 520, magic: 180, healing: 115 },
      "seal→physical→healing": { physical: 520, magic: 180, healing: 115 },
      "seal→healing→magic": { physical: 400, magic: 164, healing: 165 },
      "seal→magic→healing": { physical: 400, magic: 164, healing: 165 },
      "seal→physical→magic": { physical: 570, magic: 126, healing: 150 },
      "seal→magic→physical": { physical: 570, magic: 126, healing: 150 },
    },
    武器数据组3: {
      "healing→physical→magic": { physical: 380, magic: 109, healing: 173 },
      "healing→magic→physical": { physical: 345, magic: 189, healing: 110 },
      "physical→healing→magic": { physical: 346, magic: 189, healing: 110 },
      "physical→magic→healing": { physical: 380, magic: 109, healing: 173 },
      "magic→healing→physical": { physical: 381, magic: 109, healing: 173 },
      "magic→physical→healing": { physical: 346, magic: 189, healing: 110 },

      // 通过封印门派的转换（保持原值不变）
      "healing→seal→physical": { physical: 600, magic: 120, healing: 100 },
      "physical→seal→healing": { physical: 600, magic: 120, healing: 100 },
      "healing→seal→magic": { physical: 600, magic: 120, healing: 100 },
      "magic→seal→healing": { physical: 600, magic: 120, healing: 100 },
      "physical→seal→magic": { physical: 600, magic: 120, healing: 100 },
      "magic→seal→physical": { physical: 600, magic: 120, healing: 100 },

      // 其他转换（目标是封印门派的情况）
      "healing→physical→seal": { physical: 346, magic: 120, healing: 173 },
      "physical→healing→seal": { physical: 346, magic: 120, healing: 173 },
      "healing→magic→seal": { physical: 600, magic: 109, healing: 110 },
      "magic→healing→seal": { physical: 600, magic: 109, healing: 110 },
      "physical→magic→seal": { physical: 380, magic: 189, healing: 100 },
      "magic→physical→seal": { physical: 380, magic: 189, healing: 100 },

      // 从封印门派开始的转换
      "seal→healing→physical": { physical: 346, magic: 120, healing: 173 },
      "seal→physical→healing": { physical: 346, magic: 120, healing: 173 },
      "seal→healing→magic": { physical: 600, magic: 109, healing: 110 },
      "seal→magic→healing": { physical: 600, magic: 109, healing: 110 },
      "seal→physical→magic": { physical: 380, magic: 189, healing: 100 },
      "seal→magic→physical": { physical: 380, magic: 189, healing: 100 },
    },
  };

  // 24种转换组合
  const allCombinations = [
    // 治疗-物理-法师组合 (6种)
    { from: "healing", via: "physical", to: "magic" },
    { from: "healing", via: "magic", to: "physical" },
    { from: "physical", via: "healing", to: "magic" },
    { from: "physical", via: "magic", to: "healing" },
    { from: "magic", via: "healing", to: "physical" },
    { from: "magic", via: "physical", to: "healing" },

    // 治疗-物理-封印组合 (6种)
    { from: "healing", via: "physical", to: "seal" },
    { from: "healing", via: "seal", to: "physical" },
    { from: "physical", via: "healing", to: "seal" },
    { from: "physical", via: "seal", to: "healing" },
    { from: "seal", via: "healing", to: "physical" },
    { from: "seal", via: "physical", to: "healing" },

    // 治疗-法师-封印组合 (6种)
    { from: "healing", via: "magic", to: "seal" },
    { from: "healing", via: "seal", to: "magic" },
    { from: "magic", via: "healing", to: "seal" },
    { from: "magic", via: "seal", to: "healing" },
    { from: "seal", via: "healing", to: "magic" },
    { from: "seal", via: "magic", to: "healing" },

    // 物理-法师-封印组合 (6种)
    { from: "physical", via: "magic", to: "seal" },
    { from: "physical", via: "seal", to: "magic" },
    { from: "magic", via: "physical", to: "seal" },
    { from: "magic", via: "seal", to: "physical" },
    { from: "seal", via: "physical", to: "magic" },
    { from: "seal", via: "magic", to: "physical" },
  ];

  // 为每个数据组创建测试
  testDataSets.forEach(({ name, data }) => {
    describe(`${name} - 24种转换组合`, () => {
      allCombinations.forEach(({ from, via, to }, combIndex) => {
        it(`${from}→${via}→${to} (${combIndex + 1}/24)`, () => {
          // 执行通过原造型的转换
          const viaResult = performConversion(data, from, via, to);

          // 获取预期结果
          const conversionKey = `${from}→${via}→${to}`;
          const expected = (
            expectedResults[name as keyof typeof expectedResults] as Record<
              string,
              { physical: number; magic: number; healing: number }
            >
          )[conversionKey];

          // 验证具体数值
          expect(viaResult.physical.current).toBe(expected.physical);
          expect(viaResult.magic.current).toBe(expected.magic);
          expect(viaResult.healing.current).toBe(expected.healing);

          // 如果通过封印门派，验证保持原值不变
          if (via === "seal") {
            // 封印门派作为原造型时，应该保持原始属性值不变
            expect(viaResult.physical.current).toBe(data.physical.current);
            expect(viaResult.magic.current).toBe(data.magic.current);
            expect(viaResult.healing.current).toBe(data.healing.current);
          }
        });
      });
    });
  });

  describe("封印门派特殊处理验证", () => {
    // 重要说明：中间的武器是原造型
    // 只要原造型是封印职业的武器，后面无论如何转换，属性都不会变
    // 因为前后两次都命中“封系与其他系别互转时武器属性保持不变”的规则

    it("治疗→封印→法师：应该保持原始属性值不变", () => {
      const viaResult = performConversion(
        weaponData1,
        "healing",
        "seal",
        "magic",
      );

      // 具体数值验证 - 应该保持原始值不变
      expect(viaResult.physical.current).toBe(500);
      expect(viaResult.magic.current).toBe(150);
      expect(viaResult.healing.current).toBe(120);
    });

    it("物理→封印→法师：应该保持原始属性值不变", () => {
      const viaResult = performConversion(
        weaponData1,
        "physical",
        "seal",
        "magic",
      );

      // 具体数值验证 - 应该保持原始值不变
      expect(viaResult.physical.current).toBe(500);
      expect(viaResult.magic.current).toBe(150);
      expect(viaResult.healing.current).toBe(120);
    });

    it("法师→封印→治疗：应该保持原始属性值不变", () => {
      const viaResult = performConversion(
        weaponData1,
        "magic",
        "seal",
        "healing",
      );

      // 具体数值验证 - 应该保持原始值不变
      expect(viaResult.physical.current).toBe(500);
      expect(viaResult.magic.current).toBe(150);
      expect(viaResult.healing.current).toBe(120);
    });
  });

  describe("非封印门派两次转换验证", () => {
    it("治疗→物理→法师：验证两次转换的具体数值", () => {
      const result = performConversion(
        weaponData1,
        "healing",
        "physical",
        "magic",
      );

      // 具体数值验证
      expect(result.physical.current).toBe(475);
      expect(result.magic.current).toBe(131);
      expect(result.healing.current).toBe(144);
    });

    it("物理→治疗→法师：验证两次转换的具体数值", () => {
      const result = performConversion(
        weaponData1,
        "physical",
        "healing",
        "magic",
      );

      // 具体数值验证
      expect(result.physical.current).toBe(416);
      expect(result.magic.current).toBe(158);
      expect(result.healing.current).toBe(137);
    });

    it("法师→物理→治疗：验证两次转换的具体数值", () => {
      const result = performConversion(
        weaponData1,
        "magic",
        "physical",
        "healing",
      );

      // 具体数值验证
      expect(result.physical.current).toBe(416);
      expect(result.magic.current).toBe(158);
      expect(result.healing.current).toBe(137);
    });
  });
});
