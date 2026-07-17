export const CHARACTER_LEVEL = 69;
export const INITIAL_CHARACTER_LEVEL = 1;
export const FIXED_ATTRIBUTE_POINTS_PER_LEVEL = 2;
export const POTENTIAL_POINTS_PER_LEVEL = 10;
export const CHARACTER_UPGRADE_COUNT =
  CHARACTER_LEVEL - INITIAL_CHARACTER_LEVEL;

export const PRIMARY_ATTRIBUTE_KEYS = [
  "constitution",
  "spirit",
  "strength",
  "endurance",
  "agility",
] as const;

export type PrimaryAttribute = (typeof PRIMARY_ATTRIBUTE_KEYS)[number];
export type CharacterAllocation = Record<PrimaryAttribute, number>;

export type CharacterAllocationPreset = {
  id: string;
  label: string;
  ratio: CharacterAllocation;
};

export const PRIMARY_ATTRIBUTE_LABELS: Record<PrimaryAttribute, string> = {
  constitution: "体力",
  spirit: "灵力",
  strength: "力量",
  endurance: "耐力",
  agility: "敏捷",
};

export const EMPTY_CHARACTER_ALLOCATION: CharacterAllocation = {
  constitution: 0,
  spirit: 0,
  strength: 0,
  endurance: 0,
  agility: 0,
};

/** 当前开发阶段开放的加点比例；每个方案每级固定分配 10 点潜力。 */
export const CHARACTER_ALLOCATION_PRESETS = [
  {
    id: "10-strength",
    label: "10力",
    ratio: { constitution: 0, spirit: 0, strength: 10, endurance: 0, agility: 0 },
  },
  {
    id: "10-spirit",
    label: "10灵",
    ratio: { constitution: 0, spirit: 10, strength: 0, endurance: 0, agility: 0 },
  },
  {
    id: "10-agility",
    label: "10敏",
    ratio: { constitution: 0, spirit: 0, strength: 0, endurance: 0, agility: 10 },
  },
  {
    id: "6-strength-4-agility",
    label: "6力4敏",
    ratio: { constitution: 0, spirit: 0, strength: 6, endurance: 0, agility: 4 },
  },
  {
    id: "6-spirit-4-endurance",
    label: "6灵4耐",
    ratio: { constitution: 0, spirit: 6, strength: 0, endurance: 4, agility: 0 },
  },
  {
    id: "6-agility-4-endurance",
    label: "6敏4耐",
    ratio: { constitution: 0, spirit: 0, strength: 0, endurance: 4, agility: 6 },
  },
  {
    id: "6-agility-2-constitution-2-endurance",
    label: "6敏2体2耐",
    ratio: { constitution: 2, spirit: 0, strength: 0, endurance: 2, agility: 6 },
  },
] as const satisfies readonly CharacterAllocationPreset[];

export type CharacterAllocationPresetId =
  (typeof CHARACTER_ALLOCATION_PRESETS)[number]["id"];

/** 将每级 10 点的比例方案换算为当前等级的实际潜力点。 */
export const calculatePresetAllocation = (
  ratio: CharacterAllocation
): CharacterAllocation => ({
  constitution: ratio.constitution * CHARACTER_UPGRADE_COUNT,
  spirit: ratio.spirit * CHARACTER_UPGRADE_COUNT,
  strength: ratio.strength * CHARACTER_UPGRADE_COUNT,
  endurance: ratio.endurance * CHARACTER_UPGRADE_COUNT,
  agility: ratio.agility * CHARACTER_UPGRADE_COUNT,
});

export const LEVEL_ONE_PRIMARY_ATTRIBUTES: CharacterAllocation = {
  constitution: 22,
  spirit: 22,
  strength: 32,
  endurance: 22,
  agility: 22,
};

export const LEVEL_ONE_STATUS_ATTRIBUTES = {
  health: 234,
  mana: 157,
  anger: 100,
} as const;

export const LEVEL_ONE_DERIVED_ATTRIBUTES = {
  magicAttack: 100,
  magicDefense: 45,
  physicalAttack: 98,
  physicalDefense: 53,
  speed: 19,
} as const;

export const CHARACTER_DIRECT_BONUS_ATTRIBUTE_KEYS = [
  "health",
  "mana",
  "physicalAttack",
  "magicAttack",
  "physicalDefense",
  "magicDefense",
  "speed",
] as const;

export type CharacterDirectBonusAttribute =
  (typeof CHARACTER_DIRECT_BONUS_ATTRIBUTE_KEYS)[number];

export const CHARACTER_BONUS_ATTRIBUTE_KEYS = [
  ...PRIMARY_ATTRIBUTE_KEYS,
  ...CHARACTER_DIRECT_BONUS_ATTRIBUTE_KEYS,
] as const;

export type CharacterBonusAttribute =
  (typeof CHARACTER_BONUS_ATTRIBUTE_KEYS)[number];
export type CharacterAttributeBonuses = Record<CharacterBonusAttribute, number>;

export const createEmptyCharacterAttributeBonuses =
  (): CharacterAttributeBonuses => ({
    health: 0,
    mana: 0,
    physicalAttack: 0,
    magicAttack: 0,
    physicalDefense: 0,
    magicDefense: 0,
    speed: 0,
    constitution: 0,
    spirit: 0,
    strength: 0,
    endurance: 0,
    agility: 0,
  });

/** 合并技能、装备等多个来源的最终属性加成。 */
export const combineCharacterAttributeBonuses = (
  ...bonusSources: readonly Partial<CharacterAttributeBonuses>[]
): CharacterAttributeBonuses => {
  const combined = createEmptyCharacterAttributeBonuses();

  for (const source of bonusSources) {
    for (const attribute of CHARACTER_BONUS_ATTRIBUTE_KEYS) {
      combined[attribute] += source[attribute] ?? 0;
    }
  }

  return combined;
};

export type AdvancedAttributes = {
  physicalCritical: number;
  magicalCritical: number;
  hitRate: number;
  dodgeRate: number;
  healingCritical: number;
  healingPower: number;
  sealHit: number;
  sealResistance: number;
};

export const LEVEL_ONE_ADVANCED_ATTRIBUTES: AdvancedAttributes = {
  physicalCritical: 2,
  magicalCritical: 1,
  hitRate: 100,
  dodgeRate: 5,
  healingCritical: 0,
  healingPower: 0,
  sealHit: 12,
  sealResistance: 2,
};

export const SEAL_HIT_POINTS_PER_UPGRADE = 2;

export const LEVEL_69_ADVANCED_ATTRIBUTES: AdvancedAttributes = {
  ...LEVEL_ONE_ADVANCED_ATTRIBUTES,
  sealHit:
    LEVEL_ONE_ADVANCED_ATTRIBUTES.sealHit +
    CHARACTER_UPGRADE_COUNT * SEAL_HIT_POINTS_PER_UPGRADE,
};

export const AFFINITY_LABELS = [
  "火系亲和",
  "冰系亲和",
  "电系亲和",
  "毒系亲和",
  "水系亲和",
  "风系亲和",
] as const;

export const FIXED_PRIMARY_ATTRIBUTES: CharacterAllocation = {
  constitution:
    LEVEL_ONE_PRIMARY_ATTRIBUTES.constitution +
    CHARACTER_UPGRADE_COUNT * FIXED_ATTRIBUTE_POINTS_PER_LEVEL,
  spirit:
    LEVEL_ONE_PRIMARY_ATTRIBUTES.spirit +
    CHARACTER_UPGRADE_COUNT * FIXED_ATTRIBUTE_POINTS_PER_LEVEL,
  strength:
    LEVEL_ONE_PRIMARY_ATTRIBUTES.strength +
    CHARACTER_UPGRADE_COUNT * FIXED_ATTRIBUTE_POINTS_PER_LEVEL,
  endurance:
    LEVEL_ONE_PRIMARY_ATTRIBUTES.endurance +
    CHARACTER_UPGRADE_COUNT * FIXED_ATTRIBUTE_POINTS_PER_LEVEL,
  agility:
    LEVEL_ONE_PRIMARY_ATTRIBUTES.agility +
    CHARACTER_UPGRADE_COUNT * FIXED_ATTRIBUTE_POINTS_PER_LEVEL,
};

export const TOTAL_POTENTIAL_POINTS =
  CHARACTER_UPGRADE_COUNT * POTENTIAL_POINTS_PER_LEVEL;

export type CalculatedCharacterAttributes = {
  primary: CharacterAllocation;
  derived: {
    health: number;
    magicAttack: number;
    magicDefense: number;
    physicalAttack: number;
    physicalDefense: number;
    speed: number;
  };
  advanced: AdvancedAttributes;
  allocatedPoints: number;
  remainingPoints: number;
};

const roundAttribute = (value: number) => Math.round(value * 100) / 100;

export type EffectiveCharacterAttributes = {
  primary: CharacterAllocation;
  status: Pick<CharacterAttributeBonuses, "health" | "mana">;
  derived: Record<
    Exclude<CharacterDirectBonusAttribute, "health" | "mana">,
    number
  >;
};

/** 潜力属性先参与派生公式，直接属性再叠加到最终结果。 */
export const applyCharacterAttributeBonuses = (
  calculated: CalculatedCharacterAttributes,
  bonuses: CharacterAttributeBonuses
): EffectiveCharacterAttributes => {
  const magicAttributeBonus =
    bonuses.constitution * 0.1 +
    bonuses.spirit * 0.5 +
    bonuses.strength * 0.3 +
    bonuses.endurance * 0.1;
  const speedFromPotential =
    bonuses.constitution * 0.1 +
    bonuses.spirit * 0.05 +
    bonuses.strength * 0.1 +
    bonuses.endurance * 0.1 +
    bonuses.agility * 0.5;

  return {
    primary: {
      constitution: calculated.primary.constitution + bonuses.constitution,
      spirit: calculated.primary.spirit + bonuses.spirit,
      strength: calculated.primary.strength + bonuses.strength,
      endurance: calculated.primary.endurance + bonuses.endurance,
      agility: calculated.primary.agility + bonuses.agility,
    },
    status: {
      health: roundAttribute(
        calculated.derived.health + bonuses.constitution * 3 + bonuses.health
      ),
      // 当前法力成长规则未知，只叠加明确填写的直接加成。
      mana: roundAttribute(LEVEL_ONE_STATUS_ATTRIBUTES.mana + bonuses.mana),
    },
    derived: {
      physicalAttack: roundAttribute(
        calculated.derived.physicalAttack +
          bonuses.strength * 0.5 +
          bonuses.physicalAttack
      ),
      magicAttack: roundAttribute(
        calculated.derived.magicAttack + magicAttributeBonus + bonuses.magicAttack
      ),
      physicalDefense: roundAttribute(
        calculated.derived.physicalDefense +
          bonuses.endurance +
          bonuses.physicalDefense
      ),
      magicDefense: roundAttribute(
        calculated.derived.magicDefense +
          magicAttributeBonus +
          bonuses.magicDefense
      ),
      speed: roundAttribute(
        calculated.derived.speed + speedFromPotential + bonuses.speed
      ),
    },
  };
};

/** 根据 69 级固定成长和玩家分配的潜力点计算当前已知裸属性。 */
export const calculateCharacterAttributes = (
  allocation: CharacterAllocation
): CalculatedCharacterAttributes => {
  const primary = {
    constitution:
      FIXED_PRIMARY_ATTRIBUTES.constitution + allocation.constitution,
    spirit: FIXED_PRIMARY_ATTRIBUTES.spirit + allocation.spirit,
    strength: FIXED_PRIMARY_ATTRIBUTES.strength + allocation.strength,
    endurance: FIXED_PRIMARY_ATTRIBUTES.endurance + allocation.endurance,
    agility: FIXED_PRIMARY_ATTRIBUTES.agility + allocation.agility,
  };
  const allocatedPoints = PRIMARY_ATTRIBUTE_KEYS.reduce(
    (total, attribute) => total + allocation[attribute],
    0
  );
  const constitutionGrowth =
    primary.constitution - LEVEL_ONE_PRIMARY_ATTRIBUTES.constitution;
  const spiritGrowth = primary.spirit - LEVEL_ONE_PRIMARY_ATTRIBUTES.spirit;
  const strengthGrowth =
    primary.strength - LEVEL_ONE_PRIMARY_ATTRIBUTES.strength;
  const enduranceGrowth =
    primary.endurance - LEVEL_ONE_PRIMARY_ATTRIBUTES.endurance;
  const agilityGrowth =
    primary.agility - LEVEL_ONE_PRIMARY_ATTRIBUTES.agility;

  return {
    primary,
    derived: {
      health: LEVEL_ONE_STATUS_ATTRIBUTES.health + constitutionGrowth * 3,
      magicAttack: roundAttribute(
        LEVEL_ONE_DERIVED_ATTRIBUTES.magicAttack +
          constitutionGrowth * 0.1 +
          spiritGrowth * 0.5 +
          strengthGrowth * 0.3 +
          enduranceGrowth * 0.1
      ),
      magicDefense: roundAttribute(
        LEVEL_ONE_DERIVED_ATTRIBUTES.magicDefense +
          constitutionGrowth * 0.1 +
          spiritGrowth * 0.5 +
          strengthGrowth * 0.3 +
          enduranceGrowth * 0.1
      ),
      physicalAttack:
        LEVEL_ONE_DERIVED_ATTRIBUTES.physicalAttack + strengthGrowth * 0.5,
      physicalDefense:
        LEVEL_ONE_DERIVED_ATTRIBUTES.physicalDefense + enduranceGrowth,
      speed: roundAttribute(
        LEVEL_ONE_DERIVED_ATTRIBUTES.speed +
          constitutionGrowth * 0.1 +
          spiritGrowth * 0.05 +
          strengthGrowth * 0.1 +
          enduranceGrowth * 0.1 +
          agilityGrowth * 0.5
      ),
    },
    // 潜力点不影响进阶属性；封印命中只按角色升级次数固定成长。
    advanced: LEVEL_69_ADVANCED_ATTRIBUTES,
    allocatedPoints,
    remainingPoints: TOTAL_POTENTIAL_POINTS - allocatedPoints,
  };
};
