import { renderHook, act } from "@testing-library/react";
import { useWeaponConverter } from "../useWeaponConverter";
import { WEAPON_LEVELS, SECT_TO_PROFESSION } from "../../types/constants";
import {
  getEffectiveAttributeBySect,
  performAttributeConversion,
} from "../../utils/weaponConverter";

describe("useWeaponConverter", () => {
  it("应该正确初始化默认值", () => {
    const { result } = renderHook(() => useWeaponConverter());

    expect(result.current.weaponLevel).toBe(60);
    expect(result.current.currentSect).toBe("鬼王宗");
    expect(result.current.targetSect).toBe("青云门");
    expect(result.current.originalForm).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.attributes).toEqual({
      physical: { current: null, max: 665 },
      magic: { current: null, max: 210 },
      healing: { current: null, max: 192 },
    });
  });

  it("应该正确设置武器等级", () => {
    const { result } = renderHook(() => useWeaponConverter());

    act(() => {
      result.current.setWeaponLevelAndMaxValues(110);
    });

    expect(result.current.weaponLevel).toBe(110);
    expect(result.current.attributes.physical.max).toBe(976);
    expect(result.current.attributes.magic.max).toBe(302);
    expect(result.current.attributes.healing.max).toBe(286);
  });

  it("应该正确设置门派", () => {
    const { result } = renderHook(() => useWeaponConverter());

    act(() => {
      result.current.setCurrentSect("青云门");
    });
    expect(result.current.currentSect).toBe("青云门");

    act(() => {
      result.current.setTargetSect("天音寺");
    });
    expect(result.current.targetSect).toBe("天音寺");
  });

  it("应该正确设置原造型", () => {
    const { result } = renderHook(() => useWeaponConverter());

    act(() => {
      result.current.setOriginalForm("剑");
    });
    expect(result.current.originalForm).toBe("剑");
  });

  it("应该正确设置属性值", () => {
    const { result } = renderHook(() => useWeaponConverter());

    act(() => {
      result.current.setAttributes({
        physical: { current: 500, max: 665 },
        magic: { current: 150, max: 210 },
        healing: { current: 100, max: 192 },
      });
    });

    expect(result.current.attributes.physical.current).toBe(500);
    expect(result.current.attributes.magic.current).toBe(150);
    expect(result.current.attributes.healing.current).toBe(100);
  });

  it("应该正确重置属性", () => {
    const { result } = renderHook(() => useWeaponConverter());

    // 先设置一些值
    act(() => {
      result.current.setOriginalForm("剑");
      result.current.setAttributes({
        physical: { current: 500, max: 665 },
        magic: { current: 150, max: 210 },
        healing: { current: 100, max: 192 },
      });
    });

    // 然后重置
    act(() => {
      result.current.resetAttributes();
    });

    expect(result.current.originalForm).toBeNull();
    expect(result.current.attributes.physical.current).toBeNull();
    expect(result.current.attributes.magic.current).toBeNull();
    expect(result.current.attributes.healing.current).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  describe("convertAttributes", () => {
    it("应该在缺少属性值时显示错误", () => {
      const { result } = renderHook(() => useWeaponConverter());

      act(() => {
        result.current.convertAttributes();
      });

      expect(result.current.error).toBe("请完整输入物攻、法攻、治疗数值");
      expect(result.current.result).toBeNull();
    });

    it("应该拒绝负数属性值", () => {
      const { result } = renderHook(() => useWeaponConverter());

      act(() => {
        result.current.setAttributes({
          physical: { current: -1, max: 665 },
          magic: { current: 150, max: 210 },
          healing: { current: 100, max: 192 },
        });
      });
      act(() => result.current.convertAttributes());

      expect(result.current.error).toBe("物攻值不能小于0");
      expect(result.current.result).toBeNull();
    });

    it("应该拒绝非有限数值", () => {
      const { result } = renderHook(() => useWeaponConverter());

      act(() => {
        result.current.setAttributes({
          physical: { current: Number.NaN, max: 665 },
          magic: { current: 150, max: 210 },
          healing: { current: 100, max: 192 },
        });
      });
      act(() => result.current.convertAttributes());

      expect(result.current.error).toBe("物攻值必须是有效数字");
      expect(result.current.result).toBeNull();
    });
  });

  describe("边界值测试", () => {
    it("应该正确处理最大属性值", () => {
      const { result } = renderHook(() => useWeaponConverter());

      act(() => {
        result.current.setWeaponLevelAndMaxValues(60);
        // 设置最大值
        result.current.setAttributes({
          physical: { current: 665, max: 665 },
          magic: { current: 210, max: 210 },
          healing: { current: 192, max: 192 },
        });
      });

      expect(result.current.attributes.physical.current).toBe(665);
      expect(result.current.attributes.magic.current).toBe(210);
      expect(result.current.attributes.healing.current).toBe(192);
    });

    it("应该正确处理0值", () => {
      const { result } = renderHook(() => useWeaponConverter());

      act(() => {
        result.current.setWeaponLevelAndMaxValues(60);
        // 设置0值
        result.current.setAttributes({
          physical: { current: 0, max: 665 },
          magic: { current: 0, max: 210 },
          healing: { current: 0, max: 192 },
        });
      });

      expect(result.current.attributes.physical.current).toBe(0);
      expect(result.current.attributes.magic.current).toBe(0);
      expect(result.current.attributes.healing.current).toBe(0);
    });
  });

  describe("originalData", () => {
    it("应该在没有原造型时返回null", () => {
      const { result } = renderHook(() => useWeaponConverter());

      expect(result.current.originalData).toBeNull();
    });

    it("应该在有原造型时返回计算后的数据", () => {
      const { result } = renderHook(() => useWeaponConverter());

      act(() => {
        // 先设置武器等级以获取最大值
        result.current.setWeaponLevelAndMaxValues(60);
        // 然后设置属性，确保max值正确
        result.current.setAttributes({
          physical: { current: 500, max: 665 },
          magic: { current: 150, max: 210 },
          healing: { current: 100, max: 192 },
        });
        result.current.setOriginalForm("剑");
      });

      // 由于originalData是动态计算的，我们需要检查它是否不为null
      expect(result.current.originalData).not.toBeNull();
      expect(result.current.originalData).toHaveProperty("physical");
      expect(result.current.originalData).toHaveProperty("magic");
      expect(result.current.originalData).toHaveProperty("healing");
    });
  });
});

// 测试工具函数
describe("工具函数测试", () => {
  describe("getEffectiveAttributeBySect", () => {
    it("应该为物理门派返回physical", () => {
      expect(getEffectiveAttributeBySect("鬼王宗")).toBe("physical");
      expect(getEffectiveAttributeBySect("天道府")).toBe("physical");
      expect(getEffectiveAttributeBySect("万毒门")).toBe("physical");
      expect(getEffectiveAttributeBySect("魔神殿")).toBe("physical");
    });

    it("应该为法师门派返回magic", () => {
      expect(getEffectiveAttributeBySect("青云门")).toBe("magic");
      expect(getEffectiveAttributeBySect("焚香谷")).toBe("magic");
      expect(getEffectiveAttributeBySect("鬼道")).toBe("magic");
      expect(getEffectiveAttributeBySect("寒风龙族")).toBe("magic");
    });

    it("应该为治疗门派返回healing", () => {
      expect(getEffectiveAttributeBySect("天音寺")).toBe("healing");
      expect(getEffectiveAttributeBySect("南疆古巫")).toBe("healing");
      expect(getEffectiveAttributeBySect("万灵宫")).toBe("healing");
    });

    it("应该为封印门派返回null", () => {
      expect(getEffectiveAttributeBySect("合欢门")).toBeNull();
      expect(getEffectiveAttributeBySect("长生堂")).toBeNull();
    });
  });

  describe("performAttributeConversion", () => {
    const testAttributes = {
      physical: { current: 500, max: 665 },
      magic: { current: 150, max: 210 },
      healing: { current: 100, max: 192 },
    };

    it("应该在同职业门派间保持属性不变", () => {
      const result = performAttributeConversion(
        testAttributes,
        "鬼王宗",
        "天道府"
      );

      expect(result.physical.current).toBe(500);
      expect(result.magic.current).toBe(150);
      expect(result.healing.current).toBe(100);
    });

    it("应该正确处理封印门派", () => {
      const result = performAttributeConversion(
        testAttributes,
        "鬼王宗",
        "合欢门"
      );

      // 游戏武器规则：封系与其他系别互转时三项属性保持不变。
      expect(result.physical.current).toBe(500);
      expect(result.magic.current).toBe(150);
      expect(result.healing.current).toBe(100);
    });
  });
});

// 常量测试
describe("常量测试", () => {
  it("WEAPON_LEVELS应该包含正确的等级数据", () => {
    expect(WEAPON_LEVELS[60]).toEqual({
      physical: 665,
      magic: 210,
      healing: 192,
    });

    expect(WEAPON_LEVELS["60-standard"]).toEqual({
      physical: 589,
      magic: 186,
      healing: 170,
    });

    expect(WEAPON_LEVELS[80]).toEqual({
      physical: 744,
      magic: 232,
      healing: 217,
    });

    expect(WEAPON_LEVELS[110]).toEqual({
      physical: 976,
      magic: 302,
      healing: 286,
    });
  });

  it("SECT_TO_PROFESSION应该包含所有门派", () => {
    const allSects = Object.keys(SECT_TO_PROFESSION);
    expect(allSects).toHaveLength(13);

    // 验证每个职业都有对应的门派
    expect(
      allSects.filter(
        (sect) =>
          SECT_TO_PROFESSION[sect as keyof typeof SECT_TO_PROFESSION] === "物理"
      )
    ).toHaveLength(4);
    expect(
      allSects.filter(
        (sect) =>
          SECT_TO_PROFESSION[sect as keyof typeof SECT_TO_PROFESSION] === "法师"
      )
    ).toHaveLength(4);
    expect(
      allSects.filter(
        (sect) =>
          SECT_TO_PROFESSION[sect as keyof typeof SECT_TO_PROFESSION] === "治疗"
      )
    ).toHaveLength(3);
    expect(
      allSects.filter(
        (sect) =>
          SECT_TO_PROFESSION[sect as keyof typeof SECT_TO_PROFESSION] === "封印"
      )
    ).toHaveLength(2);
  });
});
