import {
  applyCharacterAttributeBonuses,
  arePrimaryAttributeBonusesBalanced,
  calculateSanshengPillBonuses,
  calculateSanshengPillMaximumCount,
  calculatePresetAllocation,
  calculateCharacterAttributes,
  calculateFixedStatusAttributes,
  CHARACTER_ALLOCATION_PRESETS,
  CHARACTER_LEVEL_OPTIONS,
  CHARACTER_UPGRADE_COUNT,
  combineCharacterAttributeBonuses,
  createEmptyCharacterAttributeBonuses,
  EMPTY_CHARACTER_ALLOCATION,
  FIXED_PRIMARY_ATTRIBUTES,
  FIXED_SEAL_RESISTANCE,
  FIXED_TRUE_ENERGY,
  getCustomCharacterAllocationValidationError,
  getPrimaryAttributeBonusTotal,
  getTotalPotentialPoints,
  LEVEL_69_ADVANCED_ATTRIBUTES,
  LEVEL_69_FIXED_STATUS_ATTRIBUTES,
  LEVEL_ONE_ADVANCED_ATTRIBUTES,
  LEVEL_ZERO_PRIMARY_ATTRIBUTES,
  LEVEL_ZERO_SEAL_HIT,
  normalizeCharacterLevel,
  SEAL_HIT_POINTS_PER_UPGRADE,
  STATUS_ATTRIBUTE_POINTS_PER_UPGRADE,
  TOTAL_POTENTIAL_POINTS,
} from "../characterAttributes";

describe("角色面板计算", () => {
  it("应该把 0 级五维初始值统一设置为 20", () => {
    expect(LEVEL_ZERO_PRIMARY_ATTRIBUTES).toEqual({
      constitution: 20,
      spirit: 20,
      strength: 20,
      endurance: 20,
      agility: 20,
    });
  });

  it("应该校验魂器五维属性的带符号增减总和为零", () => {
    const balancedBonuses = {
      strength: 10,
      spirit: -8,
      constitution: -2,
    };
    const unbalancedBonuses = {
      strength: 10,
      spirit: -7,
      constitution: -2,
    };

    expect(getPrimaryAttributeBonusTotal(balancedBonuses)).toBe(0);
    expect(arePrimaryAttributeBonusesBalanced(balancedBonuses)).toBe(true);
    expect(getPrimaryAttributeBonusTotal(unbalancedBonuses)).toBe(1);
    expect(arePrimaryAttributeBonusesBalanced(unbalancedBonuses)).toBe(false);
  });

  it("应该合并多个来源的直接属性和潜力属性加成", () => {
    const combined = combineCharacterAttributeBonuses(
      { health: 100, strength: 5, healingPower: 20 },
      { health: 50, strength: 7, speed: 3, sealHit: 10 }
    );

    expect(combined).toEqual({
      ...createEmptyCharacterAttributeBonuses(),
      health: 150,
      strength: 12,
      speed: 3,
      healingPower: 20,
      sealHit: 10,
    });
  });

  it("应该让潜力加成参与派生公式但不占用可分配点", () => {
    const calculated = calculateCharacterAttributes(
      EMPTY_CHARACTER_ALLOCATION
    );
    const bonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      strength: 10,
      endurance: 4,
      physicalAttack: 5,
    };
    const effective = applyCharacterAttributeBonuses(calculated, bonuses);

    expect(effective.primary.strength).toBe(168);
    expect(effective.primary.endurance).toBe(162);
    expect(effective.status).toEqual({ health: 1390, mana: 565 });
    expect(effective.derived).toMatchObject({
      physicalAttack: 171,
      physicalDefense: 193,
    });
    expect(effective.derived.magicAttack).toBeCloseTo(236.4);
    expect(effective.derived.magicDefense).toBeCloseTo(181.4);
    expect(effective.derived.speed).toBeCloseTo(135);
    expect(effective.advanced).toEqual(calculated.advanced);
    expect(calculated.allocatedPoints).toBe(0);
    expect(calculated.remainingPoints).toBe(TOTAL_POTENTIAL_POINTS);
  });

  it("应该把灵符的治疗强度和进战怒气计入进阶属性", () => {
    const calculated = calculateCharacterAttributes(
      EMPTY_CHARACTER_ALLOCATION
    );
    const bonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      healingPower: 31,
      battleEntryAnger: 17,
    };
    const effective = applyCharacterAttributeBonuses(calculated, bonuses);

    expect(effective.advanced).toEqual({
      ...calculated.advanced,
      healingPower: 31,
      battleEntryAnger: 17,
    });
  });

  it("应该把百分比加成直接计入对应进阶属性", () => {
    const calculated = calculateCharacterAttributes(
      EMPTY_CHARACTER_ALLOCATION
    );
    const bonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      physicalCritical: 3.5,
      magicalCritical: 2,
      hitRate: 2,
    };
    const effective = applyCharacterAttributeBonuses(calculated, bonuses);

    expect(effective.advanced.physicalCritical).toBe(5.5);
    expect(effective.advanced.magicalCritical).toBe(3);
    expect(effective.advanced.hitRate).toBe(102);
  });

  it("应该在固定速度之后应用百分比速度并叠加闪避、封印抵抗和亲和", () => {
    const calculated = calculateCharacterAttributes(
      EMPTY_CHARACTER_ALLOCATION
    );
    const bonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      speed: 10,
      speedPercent: 2,
      dodgeRate: 3,
      sealResistance: 4,
      fireAffinity: 2,
    };
    const effective = applyCharacterAttributeBonuses(calculated, bonuses);

    expect(effective.derived.speed).toBeCloseTo(146.472, 10);
    expect(effective.derived.speed).not.toBe(147.49);
    expect(effective.advanced.dodgeRate).toBe(8);
    expect(effective.advanced.sealResistance).toBe(6);
    expect(effective.affinity).toEqual({
      fireAffinity: 2,
      iceAffinity: 0,
      electricAffinity: 0,
      poisonAffinity: 0,
      waterAffinity: 0,
      windAffinity: 0,
    });
  });

  it("应该在固定防御加成之后应用物防和法防百分比", () => {
    const calculated = calculateCharacterAttributes(
      EMPTY_CHARACTER_ALLOCATION
    );
    const bonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      physicalDefense: 10,
      magicDefense: 20,
      physicalDefensePercent: 5,
      magicDefensePercent: 5,
    };
    const effective = applyCharacterAttributeBonuses(calculated, bonuses);

    expect(effective.derived.physicalDefense).toBeCloseTo(208.95);
    expect(effective.derived.magicDefense).toBeCloseTo(207.9);
  });

  it("应该在直接气血和体力气血之后应用气血百分比", () => {
    const calculated = calculateCharacterAttributes(
      EMPTY_CHARACTER_ALLOCATION
    );
    const baseBonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      constitution: 10,
      health: 100,
    };
    const healthBeforePercentage = applyCharacterAttributeBonuses(
      calculated,
      baseBonuses
    ).status.health;
    const effective = applyCharacterAttributeBonuses(calculated, {
      ...baseBonuses,
      healthPercent: 5,
    });

    expect(effective.status.health).toBeCloseTo(
      healthBeforePercentage * 1.05
    );
  });

  it("应该支持技能直接减少速度", () => {
    const calculated = calculateCharacterAttributes(
      EMPTY_CHARACTER_ALLOCATION
    );
    const bonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      magicAttack: 20,
      speed: -30,
    };
    const effective = applyCharacterAttributeBonuses(calculated, bonuses);

    expect(effective.derived.magicAttack).toBeCloseTo(253);
    expect(effective.derived.speed).toBeCloseTo(103.6);
  });

  it("应该将每个预设比例换算为完整的 69 级潜力点", () => {
    for (const preset of CHARACTER_ALLOCATION_PRESETS) {
      const allocation = calculatePresetAllocation(preset.ratio);
      const allocatedPoints = Object.values(allocation).reduce(
        (total, points) => total + points,
        0
      );

      expect(allocatedPoints).toBe(TOTAL_POTENTIAL_POINTS);
    }

    expect(
      calculatePresetAllocation(
        CHARACTER_ALLOCATION_PRESETS.find(
          ({ id }) => id === "6-agility-2-constitution-2-endurance"
        )!.ratio
      )
    ).toEqual({
      constitution: 138,
      spirit: 0,
      strength: 0,
      endurance: 138,
      agility: 414,
    });
  });

  it("应该校验两类自由加点规则且每级总和必须为 10", () => {
    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 0,
          spirit: 0,
          strength: 8,
          endurance: 0,
          agility: 2,
        },
        "strength-or-spirit"
      )
    ).toBeNull();
    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 1,
          spirit: 8,
          strength: 0,
          endurance: 1,
          agility: 0,
        },
        "strength-or-spirit"
      )
    ).toBeNull();
    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 3,
          spirit: 0,
          strength: 0,
          endurance: 2,
          agility: 5,
        },
        "agility"
      )
    ).toBeNull();

    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 0,
          spirit: 4,
          strength: 6,
          endurance: 0,
          agility: 0,
        },
        "strength-or-spirit"
      )
    ).toBe("力和灵互斥，必须且只能选择一项作为主属性。");
    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 0,
          spirit: 0,
          strength: 5,
          endurance: 0,
          agility: 5,
        },
        "strength-or-spirit"
      )
    ).toBe("力或灵的主属性加点必须为 6～10 点。");
    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 5,
          spirit: 0,
          strength: 0,
          endurance: 5,
          agility: 0,
        },
        "agility"
      )
    ).toBe("敏主属性方案至少分配 1 点敏。");
    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 3,
          spirit: 0,
          strength: 0,
          endurance: 2,
          agility: 4,
        },
        "agility"
      )
    ).toBe("每级必须分配 10 点，当前还需分配 1 点。");
    expect(
      getCustomCharacterAllocationValidationError(
        {
          constitution: 4,
          spirit: 0,
          strength: 0,
          endurance: 2,
          agility: 5,
        },
        "agility"
      )
    ).toBe("每级必须分配 10 点，当前已超出 1 点。");
  });

  it("应该只支持三个角色等级档位并按等级重算成长和潜力点", () => {
    expect(CHARACTER_LEVEL_OPTIONS).toEqual([69, 89, 110]);
    expect(normalizeCharacterLevel(105)).toBe(110);
    expect(normalizeCharacterLevel(70)).toBe(69);
    expect(normalizeCharacterLevel("89")).toBe(69);

    expect(getTotalPotentialPoints(89)).toBe(890);
    expect(getTotalPotentialPoints(110)).toBe(1100);
    expect(calculateFixedStatusAttributes(110)).toEqual({
      health: 1433,
      mana: 811,
      trueEnergy: 100,
    });

    const level110Allocation = calculatePresetAllocation(
      CHARACTER_ALLOCATION_PRESETS[0].ratio,
      110
    );
    expect(level110Allocation.strength).toBe(1100);
    expect(
      calculateCharacterAttributes(level110Allocation, 110).remainingPoints
    ).toBe(0);
  });

  it("应该生成 69 级固定成长与完整潜力点", () => {
    const result = calculateCharacterAttributes(EMPTY_CHARACTER_ALLOCATION);

    expect(CHARACTER_UPGRADE_COUNT).toBe(69);
    expect(FIXED_PRIMARY_ATTRIBUTES).toEqual({
      constitution: 158,
      spirit: 158,
      strength: 158,
      endurance: 158,
      agility: 158,
    });
    expect(TOTAL_POTENTIAL_POINTS).toBe(690);
    expect(result.primary).toEqual({
      constitution: 158,
      spirit: 158,
      strength: 158,
      endurance: 158,
      agility: 158,
    });
    expect(result.allocatedPoints).toBe(0);
    expect(result.remainingPoints).toBe(690);
    expect(result.derived).toMatchObject({
      health: 1390,
      physicalAttack: 161,
      physicalDefense: 189,
    });
    expect(result.derived.magicAttack).toBeCloseTo(233);
    expect(result.derived.magicDefense).toBeCloseTo(178);
    expect(result.derived.speed).toBeCloseTo(133.6);
  });

  it("应该按五维规则计算已知派生属性", () => {
    const result = calculateCharacterAttributes({
      constitution: 10,
      spirit: 20,
      strength: 30,
      endurance: 40,
      agility: 50,
    });

    expect(result.derived.health).toBe(1420);
    expect(result.derived.magicAttack).toBeCloseTo(257);
    expect(result.derived.magicDefense).toBeCloseTo(202);
    expect(result.derived.physicalAttack).toBe(176);
    expect(result.derived.physicalDefense).toBe(229);
    expect(result.derived.speed).toBeCloseTo(167.6);
    expect(result.allocatedPoints).toBe(150);
    expect(result.remainingPoints).toBe(540);
  });

  it("应该让封印命中从 0 级 10 点起每级成长并保持封印抵抗为 2", () => {
    const emptyResult = calculateCharacterAttributes(EMPTY_CHARACTER_ALLOCATION);
    const allocatedResult = calculateCharacterAttributes({
      constitution: 0,
      spirit: 0,
      strength: 680,
      endurance: 0,
      agility: 0,
    });

    expect(SEAL_HIT_POINTS_PER_UPGRADE).toBe(2);
    expect(LEVEL_ZERO_SEAL_HIT).toBe(10);
    expect(FIXED_SEAL_RESISTANCE).toBe(2);
    expect(LEVEL_ONE_ADVANCED_ATTRIBUTES.sealHit).toBe(12);
    expect(LEVEL_ONE_ADVANCED_ATTRIBUTES.sealResistance).toBe(2);
    expect(LEVEL_69_ADVANCED_ATTRIBUTES).toEqual({
      ...LEVEL_ONE_ADVANCED_ATTRIBUTES,
      sealHit: 148,
    });
    expect(LEVEL_69_ADVANCED_ATTRIBUTES.sealResistance).toBe(2);
    expect(emptyResult.advanced).toEqual(LEVEL_69_ADVANCED_ATTRIBUTES);
    expect(allocatedResult.advanced).toEqual(emptyResult.advanced);
  });

  it("应该让气血和法力随等级成长并保持真气不变", () => {
    expect(STATUS_ATTRIBUTE_POINTS_PER_UPGRADE).toEqual({
      health: 11,
      mana: 6,
    });
    expect(LEVEL_69_FIXED_STATUS_ATTRIBUTES).toEqual({
      health: 982,
      mana: 565,
      trueEnergy: 100,
    });
    expect(FIXED_TRUE_ENERGY).toBe(100);
  });

  it("应该按开服后的自然年数计算三生造化丹上限并换算属性", () => {
    expect(calculateSanshengPillMaximumCount(2020)).toBe(0);
    expect(calculateSanshengPillMaximumCount(2021)).toBe(0);
    expect(calculateSanshengPillMaximumCount(2026)).toBe(15);
    expect(calculateSanshengPillMaximumCount(2027)).toBe(18);
    expect(
      calculateSanshengPillBonuses({
        constitution: 2,
        spirit: 1,
        strength: 3,
        endurance: 4,
        agility: 5,
      })
    ).toEqual({
      constitution: 4,
      spirit: 2,
      strength: 6,
      endurance: 8,
      agility: 10,
    });
  });
});
