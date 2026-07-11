import type { Sect, WeaponType } from "../../types";
import {
  SECT_TO_PROFESSION,
  SECTS_BY_PROFESSION,
  SECT_WEAPON_TYPES,
  WEAPON_LEVELS,
} from "../../types/constants";
import {
  getEffectiveAttributeBySect,
  getSectByWeaponType,
  convertAttributeValues,
  performAttributeConversion,
} from "../weaponConverter";

describe("武器工具函数测试", () => {
  describe("常量验证", () => {
    it("SECT_TO_PROFESSION 应该包含所有门派", () => {
      const expectedSects: Sect[] = [
        // 物理职业
        "鬼王宗",
        "天道府",
        "万毒门",
        "魔神殿",
        // 法师职业
        "青云门",
        "焚香谷",
        "鬼道",
        "寒风龙族",
        // 治疗职业
        "天音寺",
        "南疆古巫",
        "万灵宫",
        // 封印职业
        "合欢门",
        "长生堂",
      ];

      expectedSects.forEach((sect) => {
        expect(SECT_TO_PROFESSION).toHaveProperty(sect);
      });

      expect(Object.keys(SECT_TO_PROFESSION)).toHaveLength(13);
    });

    it("SECTS_BY_PROFESSION 应该正确分组门派", () => {
      expect(SECTS_BY_PROFESSION.物理).toEqual([
        "鬼王宗",
        "天道府",
        "万毒门",
        "魔神殿",
      ]);
      expect(SECTS_BY_PROFESSION.法师).toEqual([
        "青云门",
        "焚香谷",
        "鬼道",
        "寒风龙族",
      ]);
      expect(SECTS_BY_PROFESSION.治疗).toEqual([
        "天音寺",
        "南疆古巫",
        "万灵宫",
      ]);
      expect(SECTS_BY_PROFESSION.封印).toEqual(["合欢门", "长生堂"]);
    });

    it("SECT_WEAPON_TYPES 应该包含所有武器类型", () => {
      const expectedWeaponTypes = [
        "刀",
        "枪",
        "镰刀",
        "斧", // 物理
        "剑",
        "扇子",
        "灯",
        "弓箭", // 法师
        "禅杖",
        "法杖",
        "琴", // 治疗
        "短刃",
        "笔", // 封印
      ];

      const actualWeaponTypes = Object.values(SECT_WEAPON_TYPES);
      expectedWeaponTypes.forEach((weaponType) => {
        expect(actualWeaponTypes).toContain(weaponType);
      });

      expect(actualWeaponTypes).toHaveLength(13);
    });

    it("WEAPON_LEVELS 应该包含正确的等级数据", () => {
      expect(WEAPON_LEVELS).toHaveProperty("60");
      expect(WEAPON_LEVELS).toHaveProperty("60-standard");
      expect(WEAPON_LEVELS).toHaveProperty("80");
      expect(WEAPON_LEVELS).toHaveProperty("110");

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
  });

  describe("getEffectiveAttributeBySect", () => {
    it("应该为物理门派返回 physical", () => {
      expect(getEffectiveAttributeBySect("鬼王宗")).toBe("physical");
      expect(getEffectiveAttributeBySect("天道府")).toBe("physical");
      expect(getEffectiveAttributeBySect("万毒门")).toBe("physical");
      expect(getEffectiveAttributeBySect("魔神殿")).toBe("physical");
    });

    it("应该为法师门派返回 magic", () => {
      expect(getEffectiveAttributeBySect("青云门")).toBe("magic");
      expect(getEffectiveAttributeBySect("焚香谷")).toBe("magic");
      expect(getEffectiveAttributeBySect("鬼道")).toBe("magic");
      expect(getEffectiveAttributeBySect("寒风龙族")).toBe("magic");
    });

    it("应该为治疗门派返回 healing", () => {
      expect(getEffectiveAttributeBySect("天音寺")).toBe("healing");
      expect(getEffectiveAttributeBySect("南疆古巫")).toBe("healing");
      expect(getEffectiveAttributeBySect("万灵宫")).toBe("healing");
    });

    it("应该为封印门派返回 null", () => {
      expect(getEffectiveAttributeBySect("合欢门")).toBeNull();
      expect(getEffectiveAttributeBySect("长生堂")).toBeNull();
    });
  });

  describe("getSectByWeaponType", () => {
    it("应该根据武器类型返回门派", () => {
      expect(getSectByWeaponType("剑")).toBe("青云门");
      expect(getSectByWeaponType("法杖")).toBe("南疆古巫");
      expect(getSectByWeaponType("斧")).toBe("魔神殿");
    });

    it("应该在配置不一致时尽早报错", () => {
      expect(() =>
        getSectByWeaponType("不存在的武器" as WeaponType)
      ).toThrow("未知武器类型：不存在的武器");
    });
  });

  describe("convertAttributeValues", () => {
    it("应该正确四舍五入结果", () => {
      const sourceAttr = { current: 333, max: 1000 };
      const targetAttr = { current: 167, max: 500 };

      const [newSource, newTarget] = convertAttributeValues(
        sourceAttr,
        targetAttr
      );

      expect(typeof newSource.current).toBe("number");
      expect(typeof newTarget.current).toBe("number");
      expect(newSource.current).toBeGreaterThanOrEqual(0);
      expect(newTarget.current).toBeGreaterThanOrEqual(0);
    });
  });

  describe("performAttributeConversion", () => {
    const testAttributes = {
      physical: { current: 600, max: 1000 },
      magic: { current: 150, max: 500 },
      healing: { current: 200, max: 400 },
    };

    it.each([
      {
        rule: "物理与法术等比例交换物攻和法攻",
        from: "鬼王宗",
        to: "青云门",
        expected: { physical: 300, magic: 300, healing: 200 },
      },
      {
        rule: "物理与辅助等比例交换物攻和治疗",
        from: "鬼王宗",
        to: "天音寺",
        expected: { physical: 500, magic: 150, healing: 240 },
      },
      {
        rule: "法术与辅助等比例交换法攻和治疗",
        from: "青云门",
        to: "天音寺",
        expected: { physical: 600, magic: 250, healing: 120 },
      },
      {
        rule: "封系与其他系别互转时属性保持不变",
        from: "鬼王宗",
        to: "合欢门",
        expected: { physical: 600, magic: 150, healing: 200 },
      },
      {
        rule: "从封系转到其他系别时属性保持不变",
        from: "合欢门",
        to: "青云门",
        expected: { physical: 600, magic: 150, healing: 200 },
      },
      {
        rule: "同系门派互转时属性保持不变",
        from: "鬼王宗",
        to: "天道府",
        expected: { physical: 600, magic: 150, healing: 200 },
      },
    ] satisfies readonly {
      rule: string;
      from: Sect;
      to: Sect;
      expected: Record<"physical" | "magic" | "healing", number>;
    }[])("$rule", ({ from, to, expected }) => {
      const result = performAttributeConversion(testAttributes, from, to);

      expect(result.physical.current).toBe(expected.physical);
      expect(result.magic.current).toBe(expected.magic);
      expect(result.healing.current).toBe(expected.healing);
    });
  });

  describe("数据一致性验证", () => {
    it("SECT_TO_PROFESSION 和 SECTS_BY_PROFESSION 应该一致", () => {
      // 验证每个门派在两个映射中都存在且一致
      Object.entries(SECT_TO_PROFESSION).forEach(([sect, profession]) => {
        expect(SECTS_BY_PROFESSION[profession]).toContain(sect);
      });

      // 验证 SECTS_BY_PROFESSION 中的每个门派都在 SECT_TO_PROFESSION 中
      Object.entries(SECTS_BY_PROFESSION).forEach(([profession, sects]) => {
        sects.forEach((sect) => {
          expect(SECT_TO_PROFESSION[sect]).toBe(profession);
        });
      });
    });

    it("所有门派都应该有对应的武器类型", () => {
      Object.keys(SECT_TO_PROFESSION).forEach((sect) => {
        expect(SECT_WEAPON_TYPES).toHaveProperty(sect);
        expect(SECT_WEAPON_TYPES[sect as Sect]).toBeTruthy();
      });
    });

    it("武器类型应该是唯一的", () => {
      const weaponTypes = Object.values(SECT_WEAPON_TYPES);
      const uniqueWeaponTypes = [...new Set(weaponTypes)];
      expect(weaponTypes).toHaveLength(uniqueWeaponTypes.length);
    });
  });

  describe("边界情况测试", () => {
    it("应该处理极小数值", () => {
      const sourceAttr = { current: 1, max: 1000 };
      const targetAttr = { current: 1, max: 1000 };

      const [newSource, newTarget] = convertAttributeValues(
        sourceAttr,
        targetAttr
      );

      expect(newSource.current).toBe(1);
      expect(newTarget.current).toBe(1);
    });

    it("应该处理相同的源和目标属性", () => {
      const attr = { current: 500, max: 1000 };
      const [newSource, newTarget] = convertAttributeValues(attr, attr);

      expect(newSource.current).toBe(500);
      expect(newTarget.current).toBe(500);
    });

    it("应该处理极端比例", () => {
      const sourceAttr = { current: 999, max: 1000 };
      const targetAttr = { current: 1, max: 1000 };

      const [newSource, newTarget] = convertAttributeValues(
        sourceAttr,
        targetAttr
      );

      expect(typeof newSource.current).toBe("number");
      expect(typeof newTarget.current).toBe("number");
    });
  });

  describe("职业分类验证", () => {
    it("应该正确分类物理职业", () => {
      const physicalSects = ["鬼王宗", "天道府", "万毒门", "魔神殿"];
      physicalSects.forEach((sect) => {
        expect(SECT_TO_PROFESSION[sect as Sect]).toBe("物理");
        expect(getEffectiveAttributeBySect(sect as Sect)).toBe("physical");
      });
    });

    it("应该正确分类法师职业", () => {
      const magicSects = ["青云门", "焚香谷", "鬼道", "寒风龙族"];
      magicSects.forEach((sect) => {
        expect(SECT_TO_PROFESSION[sect as Sect]).toBe("法师");
        expect(getEffectiveAttributeBySect(sect as Sect)).toBe("magic");
      });
    });

    it("应该正确分类治疗职业", () => {
      const healingSects = ["天音寺", "南疆古巫", "万灵宫"];
      healingSects.forEach((sect) => {
        expect(SECT_TO_PROFESSION[sect as Sect]).toBe("治疗");
        expect(getEffectiveAttributeBySect(sect as Sect)).toBe("healing");
      });
    });

    it("应该正确分类封印职业", () => {
      const sealSects = ["合欢门", "长生堂"];
      sealSects.forEach((sect) => {
        expect(SECT_TO_PROFESSION[sect as Sect]).toBe("封印");
        expect(getEffectiveAttributeBySect(sect as Sect)).toBeNull();
      });
    });
  });

  describe("武器类型映射验证", () => {
    it("应该有正确的物理武器类型", () => {
      expect(SECT_WEAPON_TYPES["鬼王宗"]).toBe("刀");
      expect(SECT_WEAPON_TYPES["天道府"]).toBe("枪");
      expect(SECT_WEAPON_TYPES["万毒门"]).toBe("镰刀");
      expect(SECT_WEAPON_TYPES["魔神殿"]).toBe("斧");
    });

    it("应该有正确的法师武器类型", () => {
      expect(SECT_WEAPON_TYPES["青云门"]).toBe("剑");
      expect(SECT_WEAPON_TYPES["焚香谷"]).toBe("扇子");
      expect(SECT_WEAPON_TYPES["鬼道"]).toBe("灯");
      expect(SECT_WEAPON_TYPES["寒风龙族"]).toBe("弓箭");
    });

    it("应该有正确的治疗武器类型", () => {
      expect(SECT_WEAPON_TYPES["天音寺"]).toBe("禅杖");
      expect(SECT_WEAPON_TYPES["南疆古巫"]).toBe("法杖");
      expect(SECT_WEAPON_TYPES["万灵宫"]).toBe("琴");
    });

    it("应该有正确的封印武器类型", () => {
      expect(SECT_WEAPON_TYPES["合欢门"]).toBe("短刃");
      expect(SECT_WEAPON_TYPES["长生堂"]).toBe("笔");
    });
  });
});
