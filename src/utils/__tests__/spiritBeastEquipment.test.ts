import {
  SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS,
  calculateSpiritBeastEquipmentBonuses,
  createEmptySpiritBeastEquipmentSet,
  normalizeSpiritBeastEquipmentSet,
} from "../spiritBeastEquipment";

describe("灵兽装备属性汇总", () => {
  it("应该排除灵兽不适用属性并保留其它赛年神装副属性", () => {
    expect(
      SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS.map(
        ({ label }) => label,
      ),
    ).toEqual([
      "体",
      "灵",
      "力",
      "耐",
      "敏",
      "气血",
      "法力",
      "物攻",
      "法攻",
      "物防",
      "法防",
      "速度",
      "物伤结果",
      "法伤结果",
      "物伤减免",
      "法伤减免",
      "闪避（%）",
      "暴伤减免（%）",
      "暴击伤害（%）",
    ]);
  });

  it("应该汇总宝衣、宝链和宝冠的面板、启灵、百炼与特效属性", () => {
    const equipment = createEmptySpiritBeastEquipmentSet();
    equipment.garment.baseAttributes = [
      { attribute: "physicalAttack", value: 65 },
      { attribute: "health", value: 107 },
    ];
    equipment.garment.enlightenmentAttributes = [
      { attribute: "constitution", value: 10 },
      { attribute: "strength", value: 8 },
    ];
    equipment.necklace.enlightenmentAttributes = [
      { attribute: "strength", value: 10 },
      { attribute: "endurance", value: 13 },
    ];
    equipment.crown.baseAttributes = [
      { attribute: "physicalAttack", value: 28 },
      { attribute: "physicalDefense", value: 18 },
    ];
    equipment.crown.secondaryAttributes = [
      { attribute: "criticalDamagePercent", value: 8 },
      { attribute: "criticalDamageReductionPercent", value: 12 },
      { attribute: "dodgeRate", value: 3 },
    ];
    equipment.crown.temperingAttribute = {
      attribute: "agility",
      value: 21,
    };
    equipment.crown.specialEffectName = "五行之水";
    equipment.crown.specialEffectAdjustments = [
      { attribute: "spirit", value: 40 },
      { attribute: "strength", value: -20 },
    ];

    expect(calculateSpiritBeastEquipmentBonuses(equipment)).toEqual({
      physicalAttack: 93,
      magicalAttack: 0,
      physicalDefense: 18,
      magicalDefense: 0,
      speed: 0,
      health: 107,
      mana: 0,
      physicalDamageResult: 0,
      magicalDamageResult: 0,
      physicalDamageReduction: 0,
      magicalDamageReduction: 0,
      criticalDamagePercent: 8,
      criticalDamageReductionPercent: 12,
      dodgeRate: 3,
      constitution: 10,
      spirit: 40,
      strength: -2,
      endurance: 13,
      agility: 21,
    });
  });

  it("应该保留关闭装备的录入值但不计入汇总", () => {
    const equipment = createEmptySpiritBeastEquipmentSet();
    equipment.garment.baseAttributes = [
      { attribute: "physicalAttack", value: 65 },
      { attribute: "magicalAttack", value: 32 },
    ];
    equipment.garment.enabled = false;
    equipment.crown.temperingAttribute = {
      attribute: "agility",
      value: 21,
    };

    const bonuses = calculateSpiritBeastEquipmentBonuses(equipment);
    expect(bonuses.physicalAttack).toBe(0);
    expect(bonuses.magicalAttack).toBe(0);
    expect(bonuses.agility).toBe(21);
  });

  it("应该补齐旧缓存并过滤重复、越界和非法装备词条", () => {
    const normalized = normalizeSpiritBeastEquipmentSet({
      garment: {
        enabled: false,
        baseAttributes: [
          { attribute: "speed", value: 10 },
          { attribute: "speed", value: 20 },
          { attribute: "health", value: 99 },
        ],
        enlightenmentAttributes: [
          { attribute: "spirit", value: -12 },
          { attribute: "spirit", value: 20 },
          { attribute: "strength", value: 1_000_000 },
          { attribute: "agility", value: 30 },
        ],
      },
      necklace: {
        enlightenmentAttributes: [],
      },
      crown: {
        baseAttributes: "bad",
        secondaryAttributes: [
          { attribute: "magicalAttack", value: -10 },
          { attribute: "sealResistance", value: 8 },
          { attribute: "criticalDamageReductionPercent", value: 6 },
          { attribute: "dodgeRate", value: 3 },
          { attribute: "physicalDamageReduction", value: 11 },
        ],
        temperingAttribute: { attribute: "unknown", value: 20 },
        specialEffectName: "五行之水",
        specialEffectAdjustments: [
          { attribute: "spirit", value: 40 },
          { attribute: "strength", value: -20 },
          { attribute: "endurance", value: 10 },
        ],
      },
    });

    expect(normalized.garment.enabled).toBe(false);
    expect(normalized.garment.baseAttributes).toEqual([
      { attribute: "speed", value: 10 },
      { attribute: "health", value: 99 },
    ]);
    expect(normalized.garment.enlightenmentAttributes).toEqual([
      { attribute: "spirit", value: -12 },
      { attribute: "strength", value: 999999 },
    ]);
    expect(normalized.necklace.enlightenmentAttributes).toEqual([
      { attribute: "strength", value: 0 },
    ]);
    expect(normalized.crown.secondaryAttributes).toEqual([
      { attribute: "magicalAttack", value: 0 },
      { attribute: "criticalDamageReductionPercent", value: 6 },
      { attribute: "dodgeRate", value: 3 },
    ]);
    expect(normalized.crown.temperingAttribute).toEqual({
      attribute: "agility",
      value: 0,
    });
    expect(normalized.crown.specialEffectAdjustments).toEqual([
      { attribute: "spirit", value: 40 },
      { attribute: "strength", value: -20 },
    ]);
  });

  it("应该从结构损坏的旧缓存安全回退并兼容字符串数值", () => {
    expect(normalizeSpiritBeastEquipmentSet(null)).toEqual(
      createEmptySpiritBeastEquipmentSet(),
    );

    const normalized = normalizeSpiritBeastEquipmentSet({
      garment: {
        enabled: "yes",
        baseAttributes: [
          null,
          { attribute: "speed", value: "12.5" },
          { attribute: 1, value: 20 },
        ],
        enlightenmentAttributes: [
          42,
          { attribute: "constitution", value: " " },
        ],
      },
      necklace: [],
      crown: {
        enabled: false,
        baseAttributes: [
          { attribute: "health", value: Number.POSITIVE_INFINITY },
        ],
        secondaryAttributes: [{ attribute: "mana", value: "14" }],
        temperingAttribute: { attribute: "strength", value: "1000000" },
        specialEffectName: 123,
        specialEffectAdjustments: "bad",
      },
    });

    expect(normalized.garment.enabled).toBe(true);
    expect(normalized.garment.baseAttributes).toEqual([
      { attribute: "speed", value: 12.5 },
      { attribute: "physicalAttack", value: 0 },
    ]);
    expect(normalized.garment.enlightenmentAttributes).toEqual([
      { attribute: "constitution", value: 0 },
    ]);
    expect(normalized.necklace).toEqual(
      createEmptySpiritBeastEquipmentSet().necklace,
    );
    expect(normalized.crown.baseAttributes).toEqual([
      { attribute: "health", value: 0 },
      { attribute: "physicalAttack", value: 0 },
    ]);
    expect(normalized.crown.secondaryAttributes).toEqual([
      { attribute: "mana", value: 14 },
    ]);
    expect(normalized.crown.temperingAttribute).toEqual({
      attribute: "strength",
      value: 999999,
    });
    expect(normalized.crown.specialEffectName).toBe("");
    expect(normalized.crown.specialEffectAdjustments).toEqual([
      { attribute: "spirit", value: 0 },
    ]);

    normalized.garment.enabled = false;
    normalized.necklace.enabled = false;
    expect(calculateSpiritBeastEquipmentBonuses(normalized)).toEqual(
      expect.objectContaining({
        health: 0,
        mana: 0,
        speed: 0,
        strength: 0,
      }),
    );
  });

  it("应该补齐单条固定属性并分别回退缺失的宝衣和宝冠", () => {
    const normalized = normalizeSpiritBeastEquipmentSet({
      garment: null,
      necklace: {},
      crown: null,
    });
    expect(normalized.garment).toEqual(
      createEmptySpiritBeastEquipmentSet().garment,
    );
    expect(normalized.crown).toEqual(
      createEmptySpiritBeastEquipmentSet().crown,
    );

    expect(
      normalizeSpiritBeastEquipmentSet({
        garment: {
          baseAttributes: [{ attribute: "physicalAttack", value: 10 }],
        },
      }).garment.baseAttributes,
    ).toEqual([
      { attribute: "physicalAttack", value: 10 },
      { attribute: "magicalAttack", value: 0 },
    ]);
  });
});
