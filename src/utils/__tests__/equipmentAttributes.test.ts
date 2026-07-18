import {
  calculateEquipmentItemAttributes,
  calculateEquipmentSummary,
  createInitialEquipmentSet,
} from "../equipmentAttributes";

describe("角色装备属性汇总", () => {
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

  it("应该按截图示例汇总八件装备并映射到角色属性", () => {
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

  it("应该在计算层忽略重复五维和重复加持，但允许百炼重复", () => {
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
      affixes: [{ attribute: "endurance", value: 99 }],
      supportAttribute: { attribute: "strength", value: 40 },
    });

    expect(attributes.strength).toBe(17);
    expect(attributes.agility).toBe(30);
    expect(attributes.endurance).toBeUndefined();
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
