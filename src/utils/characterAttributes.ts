export const CHARACTER_LEVEL = 69;
export const CHARACTER_LEVEL_OPTIONS = [69, 89, 110] as const;
export type CharacterLevel = (typeof CHARACTER_LEVEL_OPTIONS)[number];
export const INITIAL_CHARACTER_LEVEL = 1;
export const FIXED_ATTRIBUTE_POINTS_PER_LEVEL = 2;
export const POTENTIAL_POINTS_PER_LEVEL = 10;
export const CHARACTER_UPGRADE_COUNT =
  CHARACTER_LEVEL - INITIAL_CHARACTER_LEVEL;
export const GAME_LAUNCH_YEAR = 2021;
export const SANSHENG_PILL_COUNT_PER_YEAR = 3;
export const SANSHENG_PILL_ATTRIBUTE_POINTS = 2;

/** 将旧缓存或外部输入映射到最近的受支持等级档位。 */
export const normalizeCharacterLevel = (value: unknown): CharacterLevel => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return CHARACTER_LEVEL;
  }

  return CHARACTER_LEVEL_OPTIONS.reduce((nearest, option) =>
    Math.abs(option - value) < Math.abs(nearest - value) ? option : nearest
  );
};

export const getCharacterUpgradeCount = (characterLevel: CharacterLevel) =>
  characterLevel - INITIAL_CHARACTER_LEVEL;

export const getTotalPotentialPoints = (characterLevel: CharacterLevel) =>
  getCharacterUpgradeCount(characterLevel) * POTENTIAL_POINTS_PER_LEVEL;

/** 按开服后的自然年数计算三生造化丹累计上限；2026 年为第 5 年。 */
export const calculateSanshengPillMaximumCount = (
  currentYear = new Date().getFullYear()
): number => {
  const normalizedYear = Number.isFinite(currentYear)
    ? Math.trunc(currentYear)
    : GAME_LAUNCH_YEAR;

  return (
    Math.max(0, normalizedYear - GAME_LAUNCH_YEAR) *
    SANSHENG_PILL_COUNT_PER_YEAR
  );
};

export const PRIMARY_ATTRIBUTE_KEYS = [
  "constitution",
  "spirit",
  "strength",
  "endurance",
  "agility",
] as const;

export type PrimaryAttribute = (typeof PRIMARY_ATTRIBUTE_KEYS)[number];
export type CharacterAllocation = Record<PrimaryAttribute, number>;
export type CharacterAllocationMode = "preset" | "custom";
export type CustomCharacterAllocationScheme =
  | "strength-or-spirit"
  | "agility";

/** 将各五维服用颗数换算为实际属性点。 */
export const calculateSanshengPillBonuses = (
  pillCounts: CharacterAllocation
): CharacterAllocation => ({
  constitution: pillCounts.constitution * SANSHENG_PILL_ATTRIBUTE_POINTS,
  spirit: pillCounts.spirit * SANSHENG_PILL_ATTRIBUTE_POINTS,
  strength: pillCounts.strength * SANSHENG_PILL_ATTRIBUTE_POINTS,
  endurance: pillCounts.endurance * SANSHENG_PILL_ATTRIBUTE_POINTS,
  agility: pillCounts.agility * SANSHENG_PILL_ATTRIBUTE_POINTS,
});

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

export const DEFAULT_CUSTOM_CHARACTER_ALLOCATION: CharacterAllocation = {
  constitution: 0,
  spirit: 0,
  strength: 10,
  endurance: 0,
  agility: 0,
};

export const DEFAULT_AGILITY_CHARACTER_ALLOCATION: CharacterAllocation = {
  constitution: 0,
  spirit: 0,
  strength: 0,
  endurance: 0,
  agility: 10,
};

export const getCharacterAllocationTotal = (
  allocation: CharacterAllocation
): number =>
  PRIMARY_ATTRIBUTE_KEYS.reduce(
    (total, attribute) => total + allocation[attribute],
    0
  );

/** 校验每级 10 点的自由加点规则；返回 null 表示可用于属性计算。 */
export const getCustomCharacterAllocationValidationError = (
  allocation: CharacterAllocation,
  scheme: CustomCharacterAllocationScheme
): string | null => {
  const values = PRIMARY_ATTRIBUTE_KEYS.map(
    (attribute) => allocation[attribute]
  );

  if (
    values.some(
      (value) => !Number.isInteger(value) || value < 0 || value > 10
    )
  ) {
    return "每项加点必须是 0～10 的整数。";
  }

  if (scheme === "strength-or-spirit") {
    const selectedMainAttributeCount = [
      allocation.strength,
      allocation.spirit,
    ].filter((value) => value > 0).length;

    if (selectedMainAttributeCount !== 1) {
      return "力和灵互斥，必须且只能选择一项作为主属性。";
    }

    const mainAttributePoints = Math.max(
      allocation.strength,
      allocation.spirit
    );
    if (mainAttributePoints < 6 || mainAttributePoints > 10) {
      return "力或灵的主属性加点必须为 6～10 点。";
    }
  } else {
    if (allocation.strength !== 0 || allocation.spirit !== 0) {
      return "敏主属性方案不能分配力或灵。";
    }

    if (allocation.agility < 1) {
      return "敏主属性方案至少分配 1 点敏。";
    }
  }

  const total = getCharacterAllocationTotal(allocation);
  if (total < POTENTIAL_POINTS_PER_LEVEL) {
    return `每级必须分配 10 点，当前还需分配 ${
      POTENTIAL_POINTS_PER_LEVEL - total
    } 点。`;
  }
  if (total > POTENTIAL_POINTS_PER_LEVEL) {
    return `每级必须分配 10 点，当前已超出 ${
      total - POTENTIAL_POINTS_PER_LEVEL
    } 点。`;
  }

  return null;
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
    id: "8-strength-2-agility",
    label: "8力2敏",
    ratio: { constitution: 0, spirit: 0, strength: 8, endurance: 0, agility: 2 },
  },
  {
    id: "8-spirit-2-agility",
    label: "8灵2敏",
    ratio: { constitution: 0, spirit: 8, strength: 0, endurance: 0, agility: 2 },
  },
  {
    id: "8-spirit-2-endurance",
    label: "8灵2耐",
    ratio: { constitution: 0, spirit: 8, strength: 0, endurance: 2, agility: 0 },
  },
  {
    id: "8-agility-2-constitution",
    label: "8敏2体",
    ratio: { constitution: 2, spirit: 0, strength: 0, endurance: 0, agility: 8 },
  },
  {
    id: "8-agility-2-endurance",
    label: "8敏2耐",
    ratio: { constitution: 0, spirit: 0, strength: 0, endurance: 2, agility: 8 },
  },
  {
    id: "6-strength-4-agility",
    label: "6力4敏",
    ratio: { constitution: 0, spirit: 0, strength: 6, endurance: 0, agility: 4 },
  },
  {
    id: "6-spirit-4-agility",
    label: "6灵4敏",
    ratio: { constitution: 0, spirit: 6, strength: 0, endurance: 0, agility: 4 },
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
  ratio: CharacterAllocation,
  characterLevel: CharacterLevel = CHARACTER_LEVEL
): CharacterAllocation => ({
  constitution: ratio.constitution * getCharacterUpgradeCount(characterLevel),
  spirit: ratio.spirit * getCharacterUpgradeCount(characterLevel),
  strength: ratio.strength * getCharacterUpgradeCount(characterLevel),
  endurance: ratio.endurance * getCharacterUpgradeCount(characterLevel),
  agility: ratio.agility * getCharacterUpgradeCount(characterLevel),
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
} as const;

export const STATUS_ATTRIBUTE_POINTS_PER_UPGRADE = {
  health: 11,
  mana: 6,
} as const;

export const FIXED_TRUE_ENERGY = 100;

export const LEVEL_69_FIXED_STATUS_ATTRIBUTES = {
  health:
    LEVEL_ONE_STATUS_ATTRIBUTES.health +
    CHARACTER_UPGRADE_COUNT * STATUS_ATTRIBUTE_POINTS_PER_UPGRADE.health,
  mana:
    LEVEL_ONE_STATUS_ATTRIBUTES.mana +
    CHARACTER_UPGRADE_COUNT * STATUS_ATTRIBUTE_POINTS_PER_UPGRADE.mana,
  trueEnergy: FIXED_TRUE_ENERGY,
} as const;

export const calculateFixedStatusAttributes = (
  characterLevel: CharacterLevel
) => {
  const upgradeCount = getCharacterUpgradeCount(characterLevel);

  return {
    health:
      LEVEL_ONE_STATUS_ATTRIBUTES.health +
      upgradeCount * STATUS_ATTRIBUTE_POINTS_PER_UPGRADE.health,
    mana:
      LEVEL_ONE_STATUS_ATTRIBUTES.mana +
      upgradeCount * STATUS_ATTRIBUTE_POINTS_PER_UPGRADE.mana,
    trueEnergy: FIXED_TRUE_ENERGY,
  };
};

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

export const CHARACTER_ADVANCED_BONUS_ATTRIBUTE_KEYS = [
  "physicalCritical",
  "magicalCritical",
  "dodgeRate",
  "healingPower",
  "sealHit",
  "sealResistance",
  "battleEntryAnger",
] as const;

export type CharacterAdvancedBonusAttribute =
  (typeof CHARACTER_ADVANCED_BONUS_ATTRIBUTE_KEYS)[number];

export const CHARACTER_PERCENTAGE_BONUS_ATTRIBUTE_KEYS = [
  "healthPercent",
  "speedPercent",
  "physicalDefensePercent",
  "magicDefensePercent",
] as const;

export type CharacterPercentageBonusAttribute =
  (typeof CHARACTER_PERCENTAGE_BONUS_ATTRIBUTE_KEYS)[number];

export const AFFINITY_BONUS_FIELDS = [
  { attribute: "fireAffinity", label: "火系亲和" },
  { attribute: "iceAffinity", label: "冰系亲和" },
  { attribute: "electricAffinity", label: "电系亲和" },
  { attribute: "poisonAffinity", label: "毒系亲和" },
  { attribute: "waterAffinity", label: "水系亲和" },
  { attribute: "windAffinity", label: "风系亲和" },
] as const;

export type CharacterAffinityBonusAttribute =
  (typeof AFFINITY_BONUS_FIELDS)[number]["attribute"];

export const CHARACTER_BONUS_ATTRIBUTE_KEYS = [
  ...PRIMARY_ATTRIBUTE_KEYS,
  ...CHARACTER_DIRECT_BONUS_ATTRIBUTE_KEYS,
  ...CHARACTER_ADVANCED_BONUS_ATTRIBUTE_KEYS,
  ...CHARACTER_PERCENTAGE_BONUS_ATTRIBUTE_KEYS,
  ...AFFINITY_BONUS_FIELDS.map(({ attribute }) => attribute),
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
    physicalCritical: 0,
    magicalCritical: 0,
    dodgeRate: 0,
    healingPower: 0,
    sealHit: 0,
    sealResistance: 0,
    battleEntryAnger: 0,
    healthPercent: 0,
    speedPercent: 0,
    physicalDefensePercent: 0,
    magicDefensePercent: 0,
    fireAffinity: 0,
    iceAffinity: 0,
    electricAffinity: 0,
    poisonAffinity: 0,
    waterAffinity: 0,
    windAffinity: 0,
  });

/** 魂器只能重新分配五维，体、灵、力、耐、敏的带符号增减总和必须为零。 */
export const getPrimaryAttributeBonusTotal = (
  bonuses: Partial<CharacterAttributeBonuses>
): number =>
  PRIMARY_ATTRIBUTE_KEYS.reduce(
    (total, attribute) => total + (bonuses[attribute] ?? 0),
    0
  );

export const arePrimaryAttributeBonusesBalanced = (
  bonuses: Partial<CharacterAttributeBonuses>
): boolean => Math.abs(getPrimaryAttributeBonusTotal(bonuses)) < 1e-9;

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
  battleEntryAnger: number;
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
  battleEntryAnger: 0,
};

export const SEAL_HIT_POINTS_PER_UPGRADE = 2;

export const LEVEL_69_ADVANCED_ATTRIBUTES: AdvancedAttributes = {
  ...LEVEL_ONE_ADVANCED_ATTRIBUTES,
  sealHit:
    LEVEL_ONE_ADVANCED_ATTRIBUTES.sealHit +
    CHARACTER_UPGRADE_COUNT * SEAL_HIT_POINTS_PER_UPGRADE,
};

export const calculateLevelAdvancedAttributes = (
  characterLevel: CharacterLevel
): AdvancedAttributes => ({
  ...LEVEL_ONE_ADVANCED_ATTRIBUTES,
  sealHit:
    LEVEL_ONE_ADVANCED_ATTRIBUTES.sealHit +
    getCharacterUpgradeCount(characterLevel) * SEAL_HIT_POINTS_PER_UPGRADE,
});

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

export const calculateFixedPrimaryAttributes = (
  characterLevel: CharacterLevel
): CharacterAllocation => {
  const upgradePoints =
    getCharacterUpgradeCount(characterLevel) * FIXED_ATTRIBUTE_POINTS_PER_LEVEL;

  return {
    constitution: LEVEL_ONE_PRIMARY_ATTRIBUTES.constitution + upgradePoints,
    spirit: LEVEL_ONE_PRIMARY_ATTRIBUTES.spirit + upgradePoints,
    strength: LEVEL_ONE_PRIMARY_ATTRIBUTES.strength + upgradePoints,
    endurance: LEVEL_ONE_PRIMARY_ATTRIBUTES.endurance + upgradePoints,
    agility: LEVEL_ONE_PRIMARY_ATTRIBUTES.agility + upgradePoints,
  };
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
  advanced: AdvancedAttributes;
  affinity: Record<CharacterAffinityBonusAttribute, number>;
};

/** 潜力属性先参与派生公式，直接属性再叠加到最终结果。 */
export const applyCharacterAttributeBonuses = (
  calculated: CalculatedCharacterAttributes,
  bonuses: CharacterAttributeBonuses,
  characterLevel: CharacterLevel = CHARACTER_LEVEL
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
  const speedBeforePercentage =
    calculated.derived.speed + speedFromPotential + bonuses.speed;

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
        (calculated.derived.health +
          bonuses.constitution * 3 +
          bonuses.health) *
          (1 + bonuses.healthPercent / 100)
      ),
      mana: roundAttribute(
        calculateFixedStatusAttributes(characterLevel).mana + bonuses.mana
      ),
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
        (calculated.derived.physicalDefense +
          bonuses.endurance +
          bonuses.physicalDefense) *
          (1 + bonuses.physicalDefensePercent / 100)
      ),
      magicDefense: roundAttribute(
        (calculated.derived.magicDefense +
          magicAttributeBonus +
          bonuses.magicDefense) *
          (1 + bonuses.magicDefensePercent / 100)
      ),
      speed: roundAttribute(
        speedBeforePercentage * (1 + bonuses.speedPercent / 100)
      ),
    },
    advanced: {
      ...calculated.advanced,
      physicalCritical: roundAttribute(
        calculated.advanced.physicalCritical + bonuses.physicalCritical
      ),
      magicalCritical: roundAttribute(
        calculated.advanced.magicalCritical + bonuses.magicalCritical
      ),
      dodgeRate: roundAttribute(
        calculated.advanced.dodgeRate + bonuses.dodgeRate
      ),
      healingPower: roundAttribute(
        calculated.advanced.healingPower + bonuses.healingPower
      ),
      sealHit: roundAttribute(calculated.advanced.sealHit + bonuses.sealHit),
      sealResistance: roundAttribute(
        calculated.advanced.sealResistance + bonuses.sealResistance
      ),
      battleEntryAnger: roundAttribute(
        calculated.advanced.battleEntryAnger + bonuses.battleEntryAnger
      ),
    },
    affinity: {
      fireAffinity: bonuses.fireAffinity,
      iceAffinity: bonuses.iceAffinity,
      electricAffinity: bonuses.electricAffinity,
      poisonAffinity: bonuses.poisonAffinity,
      waterAffinity: bonuses.waterAffinity,
      windAffinity: bonuses.windAffinity,
    },
  };
};

/** 根据角色等级固定成长和玩家分配的潜力点计算当前已知裸属性。 */
export const calculateCharacterAttributes = (
  allocation: CharacterAllocation,
  characterLevel: CharacterLevel = CHARACTER_LEVEL
): CalculatedCharacterAttributes => {
  const fixedPrimaryAttributes = calculateFixedPrimaryAttributes(characterLevel);
  const fixedStatusAttributes = calculateFixedStatusAttributes(characterLevel);
  const primary = {
    constitution:
      fixedPrimaryAttributes.constitution + allocation.constitution,
    spirit: fixedPrimaryAttributes.spirit + allocation.spirit,
    strength: fixedPrimaryAttributes.strength + allocation.strength,
    endurance: fixedPrimaryAttributes.endurance + allocation.endurance,
    agility: fixedPrimaryAttributes.agility + allocation.agility,
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
      health:
        fixedStatusAttributes.health + constitutionGrowth * 3,
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
    advanced: calculateLevelAdvancedAttributes(characterLevel),
    allocatedPoints,
    remainingPoints: getTotalPotentialPoints(characterLevel) - allocatedPoints,
  };
};
