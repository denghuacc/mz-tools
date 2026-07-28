import {
  calculateSpiritBeastAttributes,
  createDefaultSpiritBeastState,
  createRandomSpiritBeastLevelZeroPrimary,
  getSpiritBeastAccessoryQualificationBonus,
  getSpiritBeastEquipmentBonusTotal,
  getSpiritBeastAllocationTotal,
  getSpiritBeastLevelZeroPrimaryTotal,
  getSpiritBeastPotentialPoints,
  normalizeSpiritBeastCalculatorState,
} from "../spiritBeastAttributes";

describe("灵兽面板计算", () => {
  it("应该按 0 级初值、1 次固定成长和 10 点默认潜力还原两张参考图的五维", () => {
    const firstReference = createDefaultSpiritBeastState();
    firstReference.levelZeroPrimary = {
      constitution: 41,
      spirit: 40,
      strength: 38,
      endurance: 41,
      agility: 40,
    };
    const secondReference = createDefaultSpiritBeastState();
    secondReference.levelZeroPrimary = {
      constitution: 42,
      spirit: 31,
      strength: 37,
      endurance: 43,
      agility: 47,
    };

    expect(calculateSpiritBeastAttributes(firstReference).primary).toEqual({
      constitution: 43,
      spirit: 42,
      strength: 50,
      endurance: 43,
      agility: 42,
    });
    expect(calculateSpiritBeastAttributes(secondReference).primary).toEqual({
      constitution: 44,
      spirit: 33,
      strength: 49,
      endurance: 45,
      agility: 49,
    });
  });

  it("应该把每级固定成长、每级 10 点潜力和资质公式计入面板", () => {
    const state = createDefaultSpiritBeastState();
    const levelOne = calculateSpiritBeastAttributes(state);

    expect(getSpiritBeastPotentialPoints(1)).toBe(10);
    expect(levelOne.primary).toEqual({
      constitution: 42,
      spirit: 42,
      strength: 52,
      endurance: 42,
      agility: 42,
    });
    expect(Math.floor(levelOne.derived.health)).toBe(190);
    expect(Math.floor(levelOne.derived.physicalAttack)).toBe(133);
    expect(Math.floor(levelOne.derived.magicalAttack)).toBe(126);
    expect(Math.floor(levelOne.derived.physicalDefense)).toBe(46);
    expect(Math.floor(levelOne.derived.magicalDefense)).toBe(45);
    expect(Math.floor(levelOne.derived.speed)).toBe(39);

    state.level = 3;
    const levelThree = calculateSpiritBeastAttributes(state);

    expect(getSpiritBeastPotentialPoints(3)).toBe(30);
    expect(getSpiritBeastAllocationTotal(levelThree.allocation)).toBe(30);
    expect(levelThree.primary).toEqual({
      constitution: 46,
      spirit: 46,
      strength: 76,
      endurance: 46,
      agility: 46,
    });
  });

  it("应该暂时只按等级、成长和直接加成计算法力增量", () => {
    const state = createDefaultSpiritBeastState();
    state.level = 74;

    expect(Math.floor(calculateSpiritBeastAttributes(state).derived.mana)).toBe(
      1606,
    );

    state.growth = 1.21;
    expect(Math.floor(calculateSpiritBeastAttributes(state).derived.mana)).toBe(
      1759,
    );

    state.bonusSources.skill.mana = 20;
    expect(Math.floor(calculateSpiritBeastAttributes(state).derived.mana)).toBe(
      1779,
    );
  });

  it("应该额外支持 5 体 5 耐方案并从缓存恢复", () => {
    const state = createDefaultSpiritBeastState();
    state.level = 2;
    state.selectedPresetId = "5-constitution-5-endurance";

    const result = calculateSpiritBeastAttributes(state);
    expect(result.allocation).toEqual({
      constitution: 10,
      spirit: 0,
      strength: 0,
      endurance: 10,
      agility: 0,
    });
    expect(result.primary).toEqual({
      constitution: 54,
      spirit: 44,
      strength: 44,
      endurance: 54,
      agility: 44,
    });
    expect(normalizeSpiritBeastCalculatorState(state)?.selectedPresetId).toBe(
      "5-constitution-5-endurance",
    );
  });

  it("应该先把五维加成计入公式，并可单独排除装备", () => {
    const state = createDefaultSpiritBeastState();
    state.bonusSources.equipment.strength = 10;
    state.bonusSources.skill.physicalAttack = 20;
    state.bonusSources.mount.fireAffinity = 5;

    const included = calculateSpiritBeastAttributes(state);
    expect(included.primary.strength).toBe(62);
    expect(Math.floor(included.derived.physicalAttack)).toBe(158);
    expect(included.affinities.fireAffinity).toBe(5);

    state.isEquipmentIncluded = false;
    const excluded = calculateSpiritBeastAttributes(state);
    expect(excluded.primary.strength).toBe(52);
    expect(Math.floor(excluded.derived.physicalAttack)).toBe(153);
  });

  it("应该先叠加灵饰全资质，再把随机属性直接计入面板", () => {
    const state = createDefaultSpiritBeastState();
    const baseline = calculateSpiritBeastAttributes(state);
    state.accessories.tierOne = {
      enabled: true,
      attribute: "health",
      value: 17,
    };
    state.accessories.tierTwo = {
      enabled: true,
      attribute: "health",
      value: 31,
    };

    const result = calculateSpiritBeastAttributes(state);

    expect(getSpiritBeastAccessoryQualificationBonus(state)).toBe(30);
    expect(result.derived.health - baseline.derived.health).toBeCloseTo(48.3);
    expect(
      result.derived.physicalAttack - baseline.derived.physicalAttack,
    ).toBeCloseTo(0.15);
    expect(
      result.derived.magicalAttack - baseline.derived.magicalAttack,
    ).toBeCloseTo(0.04275);
    expect(
      result.derived.physicalDefense - baseline.derived.physicalDefense,
    ).toBeCloseTo(0.0999);
    expect(
      result.derived.magicalDefense - baseline.derived.magicalDefense,
    ).toBeCloseTo(0.0186);
    expect(result.derived.speed - baseline.derived.speed).toBeCloseTo(0.06645);
  });

  it("应该把三件详细装备与旧版装备汇总一起接入灵兽面板", () => {
    const state = createDefaultSpiritBeastState();
    state.equipment.garment.baseAttributes = [
      { attribute: "health", value: 107 },
      { attribute: "magicalAttack", value: 0 },
    ];
    state.equipment.garment.enlightenmentAttributes = [
      { attribute: "strength", value: 10 },
    ];
    state.equipment.crown.baseAttributes = [
      { attribute: "physicalAttack", value: 28 },
      { attribute: "physicalDefense", value: 18 },
    ];
    state.equipment.crown.specialEffectAdjustments = [
      { attribute: "strength", value: -20 },
    ];
    state.bonusSources.equipment.physicalAttack = 2;

    expect(getSpiritBeastEquipmentBonusTotal(state, "physicalAttack")).toBe(30);
    expect(getSpiritBeastEquipmentBonusTotal(state, "health")).toBe(107);
    expect(calculateSpiritBeastAttributes(state).primary.strength).toBe(42);
    expect(
      Math.floor(calculateSpiritBeastAttributes(state).derived.health),
    ).toBe(297);
    expect(
      Math.floor(calculateSpiritBeastAttributes(state).derived.physicalAttack),
    ).toBe(158);

    state.isEquipmentIncluded = false;
    expect(getSpiritBeastEquipmentBonusTotal(state, "physicalAttack")).toBe(0);
    expect(calculateSpiritBeastAttributes(state).primary.strength).toBe(52);
  });

  it("随机初值应该始终保持五维总和 200", () => {
    const values = [0.1, 0.2, 0.3, 0.4, 0.5];
    let index = 0;
    const primary = createRandomSpiritBeastLevelZeroPrimary(
      () => values[index++],
    );

    expect(getSpiritBeastLevelZeroPrimaryTotal(primary)).toBe(200);
    expect(Object.values(primary).every(Number.isInteger)).toBe(true);
  });

  it("应该校验损坏缓存并收紧资质、成长和加点配置", () => {
    const normalized = normalizeSpiritBeastCalculatorState({
      level: 2,
      growth: 2,
      qualifications: {
        physicalAttack: 2000,
        physicalDefense: 800,
      },
      allocationMode: "custom",
      customAllocationScheme: "strength-or-spirit",
      customAllocation: {
        constitution: 8,
        spirit: 8,
        strength: 8,
      },
      affinities: {
        fireAffinity: -10,
      },
      bonusSources: {
        skill: {
          health: "28",
        },
      },
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.growth).toBe(1.5);
    expect(normalized?.qualifications.physicalAttack).toBe(1800);
    expect(normalized?.qualifications.physicalDefense).toBe(900);
    expect(normalized?.affinities.fireAffinity).toBe(-10);
    expect(normalized?.bonusSources.skill.health).toBe(28);
    expect(
      normalized && getSpiritBeastAllocationTotal(normalized.customAllocation),
    ).toBe(10);
  });

  it("非对象缓存应该安全回退", () => {
    expect(normalizeSpiritBeastCalculatorState("bad")).toBeNull();
  });
});
