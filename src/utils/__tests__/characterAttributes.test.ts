import {
  applyCharacterAttributeBonuses,
  arePrimaryAttributeBonusesBalanced,
  calculatePresetAllocation,
  calculateCharacterAttributes,
  CHARACTER_ALLOCATION_PRESETS,
  CHARACTER_UPGRADE_COUNT,
  combineCharacterAttributeBonuses,
  createEmptyCharacterAttributeBonuses,
  EMPTY_CHARACTER_ALLOCATION,
  FIXED_PRIMARY_ATTRIBUTES,
  getPrimaryAttributeBonusTotal,
  LEVEL_69_ADVANCED_ATTRIBUTES,
  LEVEL_ONE_ADVANCED_ATTRIBUTES,
  SEAL_HIT_POINTS_PER_UPGRADE,
  TOTAL_POTENTIAL_POINTS,
} from "../characterAttributes";

describe("角色属性计算", () => {
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
      { health: 100, strength: 5 },
      { health: 50, strength: 7, speed: 3 }
    );

    expect(combined).toEqual({
      ...createEmptyCharacterAttributeBonuses(),
      health: 150,
      strength: 12,
      speed: 3,
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

    expect(effective.primary.strength).toBe(178);
    expect(effective.primary.endurance).toBe(162);
    expect(effective.status.health).toBe(642);
    expect(effective.derived).toEqual({
      physicalAttack: 176,
      magicAttack: 239.4,
      physicalDefense: 193,
      magicDefense: 184.4,
      speed: 136,
    });
    expect(calculated.allocatedPoints).toBe(0);
    expect(calculated.remainingPoints).toBe(TOTAL_POTENTIAL_POINTS);
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

    expect(effective.derived.magicAttack).toBe(256);
    expect(effective.derived.speed).toBe(104.6);
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
      constitution: 136,
      spirit: 0,
      strength: 0,
      endurance: 136,
      agility: 408,
    });
  });

  it("应该生成 69 级固定成长与完整潜力点", () => {
    const result = calculateCharacterAttributes(EMPTY_CHARACTER_ALLOCATION);

    expect(CHARACTER_UPGRADE_COUNT).toBe(68);
    expect(FIXED_PRIMARY_ATTRIBUTES).toEqual({
      constitution: 158,
      spirit: 158,
      strength: 168,
      endurance: 158,
      agility: 158,
    });
    expect(TOTAL_POTENTIAL_POINTS).toBe(680);
    expect(result.primary).toEqual({
      constitution: 158,
      spirit: 158,
      strength: 168,
      endurance: 158,
      agility: 158,
    });
    expect(result.allocatedPoints).toBe(0);
    expect(result.remainingPoints).toBe(680);
    expect(result.derived).toEqual({
      health: 642,
      magicAttack: 236,
      magicDefense: 181,
      physicalAttack: 166,
      physicalDefense: 189,
      speed: 134.6,
    });
  });

  it("应该按五维规则计算已知派生属性", () => {
    const result = calculateCharacterAttributes({
      constitution: 10,
      spirit: 20,
      strength: 30,
      endurance: 40,
      agility: 50,
    });

    expect(result.derived.health).toBe(672);
    expect(result.derived.magicAttack).toBeCloseTo(260);
    expect(result.derived.magicDefense).toBeCloseTo(205);
    expect(result.derived.physicalAttack).toBe(181);
    expect(result.derived.physicalDefense).toBe(229);
    expect(result.derived.speed).toBeCloseTo(168.6);
    expect(result.allocatedPoints).toBe(150);
    expect(result.remainingPoints).toBe(530);
  });

  it("应该只让封印命中随等级成长且不受潜力点影响", () => {
    const emptyResult = calculateCharacterAttributes(EMPTY_CHARACTER_ALLOCATION);
    const allocatedResult = calculateCharacterAttributes({
      constitution: 0,
      spirit: 0,
      strength: 680,
      endurance: 0,
      agility: 0,
    });

    expect(SEAL_HIT_POINTS_PER_UPGRADE).toBe(2);
    expect(LEVEL_69_ADVANCED_ATTRIBUTES).toEqual({
      ...LEVEL_ONE_ADVANCED_ATTRIBUTES,
      sealHit: 148,
    });
    expect(emptyResult.advanced).toEqual(LEVEL_69_ADVANCED_ATTRIBUTES);
    expect(allocatedResult.advanced).toEqual(emptyResult.advanced);
  });
});
