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
