import {
  EQUIPMENT_GEM_CONFIG,
  EQUIPMENT_GEM_SLOT_CONFIG,
  EQUIPMENT_INDEPENDENT_AFFIX_CONFIG,
  EQUIPMENT_SLOTS,
  calculateEquipmentGemBonus,
  calculateEquipmentIndependentAffixBonus,
  calculateEquipmentItemAttributes,
  calculateEquipmentSummary,
  createInitialEquipmentCalculatorState,
  createInitialEquipmentSet,
  getGemLevelLimit,
  getEquipmentEffectLabels,
  getSeasonEquipmentResonance,
  normalizeEquipmentCalculatorState,
} from "../equipmentAttributes";
import type { EquipmentGemType } from "../equipmentAttributes";

describe("角色装备属性汇总", () => {
  it("应该按角色等级计算宝石等级上限", () => {
    expect(getGemLevelLimit(69)).toBe(8);
    expect(getGemLevelLimit(104)).toBe(12);
    expect(getGemLevelLimit(105)).toBe(13);
    expect(getGemLevelLimit(109)).toBe(13);
  });

  it("应该配置八种宝石的初始属性且每种仅允许两个部位", () => {
    expect(EQUIPMENT_GEM_CONFIG).toEqual({
      diamond: { label: "金刚石", attribute: "physicalAttack", baseValue: 12 },
      aquamarine: { label: "海蓝石", attribute: "magicAttack", baseValue: 9 },
      jade: { label: "翡翠", attribute: "healingPower", baseValue: 6 },
      malachite: {
        label: "孔雀石",
        attribute: "physicalDefense",
        baseValue: 18,
      },
      catsEye: { label: "猫眼石", attribute: "magicDefense", baseValue: 12 },
      agate: { label: "玛瑙", attribute: "health", baseValue: 75 },
      pearl: { label: "珍珠", attribute: "speed", baseValue: 8 },
      amethyst: { label: "紫水晶", attribute: "mana", baseValue: 90 },
    });
    expect(EQUIPMENT_GEM_SLOT_CONFIG).toEqual({
      weapon: ["diamond", "aquamarine", "jade", "amethyst"],
      armor: ["jade", "malachite", "catsEye", "agate"],
      headgear: ["diamond", "malachite"],
      lowerGarment: ["agate", "pearl"],
      accessory: ["aquamarine", "catsEye"],
      shoes: ["pearl", "amethyst"],
      ring: [],
      necklace: [],
    });

    for (const gemType of Object.keys(
      EQUIPMENT_GEM_CONFIG
    ) as EquipmentGemType[]) {
      const allowedSlots = EQUIPMENT_SLOTS.filter((slot) =>
        EQUIPMENT_GEM_SLOT_CONFIG[slot].includes(gemType)
      );
      expect(allowedSlots).toHaveLength(2);
    }
  });

  it("应该按突破后的额外一级累加属性并计入成长的 20% 加成", () => {
    const equipment = createInitialEquipmentSet();
    equipment.weapon = {
      ...equipment.weapon,
      gem: { type: "diamond", level: 8, breakthrough: true },
      growth: true,
    };

    expect(calculateEquipmentGemBonus(equipment.weapon, 69)).toEqual({
      type: "diamond",
      level: 9,
      levelLimit: 8,
      breakthrough: true,
      attribute: "physicalAttack",
      value: 129.6,
    });
    const summary = calculateEquipmentSummary(equipment, 69);
    expect(summary.allAttributes.physicalAttack).toBe(885.6);
    expect(summary.gemAttributes).toEqual({ physicalAttack: 129.6 });
  });

  it("应该配置指定部位的独立词条每级面板属性", () => {
    expect(EQUIPMENT_INDEPENDENT_AFFIX_CONFIG).toEqual({
      岐黄: { slots: ["weapon"], attribute: "healingPower", baseValue: 6 },
      龙吟: { slots: ["weapon"], attribute: "magicAttack", baseValue: 6 },
      罗刹: { slots: ["weapon"], attribute: "physicalAttack", baseValue: 6 },
      囚牢: { slots: ["weapon"], attribute: "sealHit", baseValue: 1 },
      扶摇: { slots: ["shoes"], attribute: "sealResistance", baseValue: 1 },
    });
  });

  it.each([
    ["weapon", "岐黄", 6, "healingPower", 36],
    ["weapon", "龙吟", 6, "magicAttack", 36],
    ["weapon", "罗刹", 6, "physicalAttack", 36],
    ["weapon", "囚牢", 6, "sealHit", 6],
    ["shoes", "扶摇", 3, "sealResistance", 3],
  ] as const)(
    "%s 的 %s %i 级应增加 %s %i 点",
    (slot, name, level, attribute, value) => {
      const item = {
        ...createInitialEquipmentSet()[slot],
        independentAffix: { name, level },
      };

      expect(calculateEquipmentIndependentAffixBonus(item)).toEqual({
        name,
        level,
        attribute,
        value,
      });
    }
  );

  it("应该只让已收录且部位匹配的独立词条计入汇总", () => {
    const equipment = createInitialEquipmentSet();
    equipment.weapon = {
      ...equipment.weapon,
      independentAffix: { name: "岐黄", level: 6 },
    };
    equipment.shoes = {
      ...equipment.shoes,
      independentAffix: { name: "扶摇", level: 3 },
    };
    equipment.armor = {
      ...equipment.armor,
      independentAffix: { name: "岐黄", level: 6 },
    };

    const summary = calculateEquipmentSummary(equipment);

    expect(summary.allAttributes.healingPower).toBe(225);
    expect(summary.allAttributes.sealResistance).toBe(3);
    expect(summary.independentAffixAttributes).toEqual({
      healingPower: 36,
      sealResistance: 3,
    });
    expect(calculateEquipmentIndependentAffixBonus(equipment.armor)).toBeNull();
  });

  it("应该在计算和恢复时把宝石等级限制到当前角色上限", () => {
    const state = createInitialEquipmentCalculatorState();
    state.characterLevel = 104;
    state.equipment.weapon = {
      ...state.equipment.weapon,
      gem: { type: "diamond", level: 13, breakthrough: false },
    };

    expect(calculateEquipmentGemBonus(state.equipment.weapon, 104)?.level).toBe(12);
    expect(normalizeEquipmentCalculatorState(state)?.equipment.weapon.gem).toEqual({
      type: "diamond",
      level: 12,
      breakthrough: false,
    });

    state.equipment.weapon = {
      ...state.equipment.weapon,
      gem: { type: "pearl", level: 8, breakthrough: false },
    };
    expect(normalizeEquipmentCalculatorState(state)?.equipment.weapon.gem).toBeNull();
  });

  it("角色等级提高后应该把已覆盖的突破等级转为普通等级", () => {
    const state = createInitialEquipmentCalculatorState();
    state.characterLevel = 70;
    state.equipment.weapon = {
      ...state.equipment.weapon,
      gem: { type: "diamond", level: 8, breakthrough: true },
    };

    expect(normalizeEquipmentCalculatorState(state)?.equipment.weapon.gem).toEqual({
      type: "diamond",
      level: 9,
      breakthrough: false,
    });
  });

  it("应该兼容尚未保存突破字段的宝石缓存", () => {
    const state = createInitialEquipmentCalculatorState();
    const storedState = {
      ...state,
      equipment: {
        ...state.equipment,
        weapon: {
          ...state.equipment.weapon,
          gem: { type: "diamond", level: 8 },
        },
      },
    };

    expect(
      normalizeEquipmentCalculatorState(storedState)?.equipment.weapon.gem
    ).toEqual({ type: "diamond", level: 8, breakthrough: false });
  });

  it("应该恢复赛年神装新增的进阶副属性和特效", () => {
    const state = createInitialEquipmentCalculatorState();
    state.equipment.ring = {
      ...state.equipment.ring,
      affixes: [
        { attribute: "sealHit", value: 12 },
        { attribute: "sealResistance", value: 8 },
        { attribute: "dodgeRate", value: 3 },
      ],
      specialEffect: "疾风神固",
      seasonEffectLevel: 5,
    };

    const restoredRing =
      normalizeEquipmentCalculatorState(state)?.equipment.ring;

    expect(restoredRing?.affixes).toEqual(state.equipment.ring.affixes);
    expect(restoredRing?.specialEffect).toBe("疾风神固");
    expect(restoredRing?.seasonEffectLevel).toBe(5);
  });

  it("应该只恢复部位匹配的已收录独立词条", () => {
    const state = createInitialEquipmentCalculatorState();
    const storedState = structuredClone(state) as unknown as {
      equipment: {
        weapon: {
          independentAffix: { name: string; level: number } | null;
          affixes: unknown[];
        };
      };
    };
    storedState.equipment.weapon.independentAffix = { name: " 龙吟 ", level: 6 };
    storedState.equipment.weapon.affixes = [
      { attribute: "physicalAttack", value: 999 },
    ];

    expect(
      normalizeEquipmentCalculatorState(storedState)?.equipment.weapon
        .independentAffix
    ).toEqual({ name: "龙吟", level: 6 });
    expect(
      normalizeEquipmentCalculatorState(storedState)?.equipment.weapon.affixes
    ).toEqual([]);

    for (const independentAffix of [
      { name: "龙吟", level: 7 },
      { name: "扶摇", level: 3 },
      { name: "待收录词条", level: 3 },
    ]) {
      storedState.equipment.weapon.independentAffix = independentAffix;
      expect(
        normalizeEquipmentCalculatorState(storedState)?.equipment.weapon
          .independentAffix
      ).toBeNull();
    }
  });

  it("应该正确区分上衣和下装的装备属性", () => {
    const equipment = createInitialEquipmentSet();

    expect(equipment.armor.baseAttributes).toEqual({
      health: 379,
      physicalDefense: 146,
    });
    expect(equipment.armor.castingAttributes).toEqual({
      health: 184,
      physicalDefense: 24,
    });
    expect(equipment.lowerGarment.baseAttributes).toEqual({
      health: 620,
      magicDefense: 56,
    });
    expect(equipment.lowerGarment.castingAttributes).toEqual({
      health: 196,
      magicDefense: 27,
    });
  });

  it("应该按截图示例汇总八件装备并映射到角色面板", () => {
    const summary = calculateEquipmentSummary(createInitialEquipmentSet());

    expect(summary.activeItemCount).toBe(8);
    expect(summary.allAttributes).toMatchObject({
      constitution: 25,
      strength: 331,
      endurance: 38,
      agility: 65,
      health: 1551,
      mana: 1820,
      physicalAttack: 756,
      magicAttack: 363,
      physicalDefense: 412,
      magicDefense: 229,
      speed: 138,
      healingPower: 189,
      magicalDamageReduction: 11,
      magicalDamageResult: 25,
      physicalDamageResult: 24,
    });
    expect(summary.characterBonuses.health).toBe(1551);
    expect(summary.characterBonuses).not.toHaveProperty("magicalDamageResult");
  });

  it("应该忽略关闭的装备并仅为鞋子疾风增加速度百分比", () => {
    const equipment = createInitialEquipmentSet();
    equipment.weapon = { ...equipment.weapon, enabled: false };
    equipment.shoes = { ...equipment.shoes, gale: true };

    const summary = calculateEquipmentSummary(equipment);

    expect(summary.activeItemCount).toBe(7);
    expect(summary.characterBonuses.constitution).toBe(0);
    expect(summary.characterBonuses.strength).toBe(298);
    expect(summary.characterBonuses.agility).toBe(33);
    expect(summary.characterBonuses.physicalAttack).toBe(42);
    expect(summary.characterBonuses.speedPercent).toBe(3);
  });

  it("应该忽略普通装备的旧词条、重复五维和重复加持", () => {
    const item = createInitialEquipmentSet().weapon;
    const attributes = calculateEquipmentItemAttributes({
      ...item,
      baseAttributes: {},
      castingAttributes: {},
      additionalPrimaryAttributes: [
        { attribute: "strength", value: 10 },
        { attribute: "strength", value: 20 },
        { attribute: "agility", value: 30 },
      ],
      tempering: { attribute: "strength", value: 7 },
      affixes: [
        { attribute: "endurance", value: 99 },
        { attribute: "physicalAttack", value: 99 },
      ],
      supportAttribute: { attribute: "strength", value: 40 },
    });

    expect(attributes.strength).toBe(17);
    expect(attributes.agility).toBe(30);
    expect(attributes.endurance).toBeUndefined();
    expect(attributes.physicalAttack).toBeUndefined();
  });

  it("赛年神装应该只汇总装备属性、百炼和前三条副属性", () => {
    const item = createInitialEquipmentSet().ring;
    const attributes = calculateEquipmentItemAttributes({
      ...item,
      baseAttributes: { ...item.baseAttributes, magicAttack: 888 },
      castingAttributes: { physicalAttack: 100 },
      additionalPrimaryAttributes: [{ attribute: "strength", value: 50 }],
      tempering: { attribute: "strength", value: 15 },
      affixes: [
        { attribute: "physicalAttack", value: 24 },
        { attribute: "magicAttack", value: 25 },
        { attribute: "magicalDamageReduction", value: 11 },
        { attribute: "strength", value: 999 },
      ],
      supportAttribute: { attribute: "agility", value: 20 },
      blessing: true,
      growth: true,
      specialSkill: "测试特技",
    });

    expect(attributes.physicalAttack).toBe(42);
    expect(attributes.magicAttack).toBe(25);
    expect(attributes.strength).toBe(15);
    expect(attributes.agility).toBeUndefined();
  });

  it("赛年神装重复副属性应该只计算第一条", () => {
    const item = createInitialEquipmentSet().ring;
    const attributes = calculateEquipmentItemAttributes({
      ...item,
      affixes: [
        { attribute: "physicalAttack", value: 24 },
        { attribute: "physicalAttack", value: 999 },
        { attribute: "magicAttack", value: 25 },
      ],
    });

    expect(attributes.physicalAttack).toBe(42);
    expect(attributes.magicAttack).toBe(25);
  });

  it("赛年神装进阶副属性应该映射到角色进阶属性", () => {
    const equipment = createInitialEquipmentSet();
    equipment.ring = {
      ...equipment.ring,
      affixes: [
        { attribute: "sealHit", value: 12 },
        { attribute: "sealResistance", value: 8 },
        { attribute: "dodgeRate", value: 3 },
      ],
    };

    const summary = calculateEquipmentSummary(equipment);

    expect(summary.allAttributes).toMatchObject({
      sealHit: 12,
      sealResistance: 8,
      dodgeRate: 3,
    });
    expect(summary.characterBonuses).toMatchObject({
      sealHit: 12,
      sealResistance: 8,
      dodgeRate: 3,
    });
  });

  it("疾风神固应该按特效等级增加速度并忽略旧的自定义属性", () => {
    const item = createInitialEquipmentSet().ring;
    const configuredItem = {
      ...item,
      baseAttributes: {},
      tempering: { attribute: "strength" as const, value: 0 },
      affixes: [],
      specialEffect: "疾风神固",
      seasonEffectLevel: 3 as const,
      specialEffectAttribute: { attribute: "magicAttack" as const, value: 999 },
    };

    const attributes = calculateEquipmentItemAttributes(configuredItem);

    expect(attributes.speed).toBe(30);
    expect(attributes.magicAttack).toBeUndefined();
    expect(getEquipmentEffectLabels(configuredItem)).toEqual([
      "赛年神装",
      "疾风神固 · 3级",
    ]);
  });

  it.each([
    [1, 1, null, 4],
    [2, 2, 4, 6],
    [3, 2, 4, 6],
    [3, 3, 6, 8],
    [4, 4, 8, 9],
    [4, 5, 9, 10],
    [5, 5, 10, null],
  ] as const)(
    "疾风神固等级 %i + %i 应匹配共鸣档位 %s",
    (ringLevel, necklaceLevel, reachedThreshold, nextThreshold) => {
      const equipment = createInitialEquipmentSet();
      equipment.ring = {
        ...equipment.ring,
        specialEffect: "疾风神固",
        seasonEffectLevel: ringLevel,
      };
      equipment.necklace = {
        ...equipment.necklace,
        specialEffect: "疾风神固",
        seasonEffectLevel: necklaceLevel,
      };

      expect(getSeasonEquipmentResonance(equipment)).toEqual({
        effect: "疾风神固",
        totalLevel: ringLevel + necklaceLevel,
        reachedThreshold,
        nextThreshold,
      });
    }
  );

  it("项链应该只计算气血、物防、法防中的两条装备属性", () => {
    const item = createInitialEquipmentSet().necklace;
    const attributes = calculateEquipmentItemAttributes({
      ...item,
      baseAttributes: {
        health: 99,
        physicalDefense: 29,
        magicDefense: 77,
      },
    });

    expect(attributes.health).toBe(99);
    expect(attributes.physicalDefense).toBe(29);
    expect(attributes.magicDefense).toBe(13);
  });

  it("上衣系别亲和特效应该固定增加对应亲和 3 点", () => {
    const equipment = createInitialEquipmentSet();
    equipment.armor = {
      ...equipment.armor,
      affinityEffectAttribute: "electricAffinity",
    };

    const attributes = calculateEquipmentItemAttributes(equipment.armor);
    const summary = calculateEquipmentSummary(equipment);

    expect(attributes.electricAffinity).toBe(3);
    expect(summary.characterBonuses.electricAffinity).toBe(3);
  });

  it("基础装备计算层应该将加持计入最多两个特效", () => {
    const item = createInitialEquipmentSet().shoes;
    const attributes = calculateEquipmentItemAttributes({
      ...item,
      gale: true,
      specialEffect: "测试属性特效",
      specialEffectAttribute: { attribute: "magicAttack", value: 100 },
    });

    expect(attributes.speedPercent).toBe(3);
    expect(attributes.magicAttack).toBeUndefined();
  });

  it("饰品体魄特效应该增加角色 5% 气血", () => {
    const equipment = createInitialEquipmentSet();
    equipment.accessory = {
      ...equipment.accessory,
      vitalityEffect: true,
    };

    const attributes = calculateEquipmentItemAttributes(equipment.accessory);
    const summary = calculateEquipmentSummary(equipment);

    expect(attributes.healthPercent).toBe(5);
    expect(summary.characterBonuses.healthPercent).toBe(5);
  });
});
