import {
  calculateCharacterAttributes,
  CHARACTER_UPGRADE_COUNT,
  EMPTY_CHARACTER_ALLOCATION,
  FIXED_PRIMARY_ATTRIBUTES,
  LEVEL_69_ADVANCED_ATTRIBUTES,
  LEVEL_ONE_ADVANCED_ATTRIBUTES,
  SEAL_HIT_POINTS_PER_UPGRADE,
  TOTAL_POTENTIAL_POINTS,
} from "../characterAttributes";

describe("角色属性计算", () => {
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
