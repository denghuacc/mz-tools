import {
  CHARACTER_ALLOCATION_PRESETS,
  DEFAULT_AGILITY_CHARACTER_ALLOCATION,
  DEFAULT_CUSTOM_CHARACTER_ALLOCATION,
  EMPTY_CHARACTER_ALLOCATION,
  FIXED_ATTRIBUTE_POINTS_PER_LEVEL,
  getCustomCharacterAllocationValidationError,
} from "./characterAttributes";
import type {
  CharacterAllocation,
  CharacterAllocationMode,
  CharacterAllocationPreset,
  CustomCharacterAllocationScheme,
  PrimaryAttribute,
} from "./characterAttributes";
import {
  calculateSpiritBeastAccessoryBonuses,
  createEmptySpiritBeastAccessories,
  normalizeSpiritBeastAccessories,
} from "./spiritBeastAccessories";
import type { SpiritBeastAccessories } from "./spiritBeastAccessories";
import {
  calculateSpiritBeastEquipmentBonuses,
  createEmptySpiritBeastEquipmentSet,
  normalizeSpiritBeastEquipmentSet,
} from "./spiritBeastEquipment";
import type {
  SpiritBeastEquipmentBonusAttribute,
  SpiritBeastEquipmentSet,
} from "./spiritBeastEquipment";
import {
  calculateSpiritBeastDestinyBonuses,
  createEmptySpiritBeastDestiny,
  normalizeSpiritBeastDestiny,
} from "./spiritBeastDestiny";
import type {
  SpiritBeastDestiny,
  SpiritBeastDestinySkillAttribute,
} from "./spiritBeastDestiny";
import {
  calculateSpiritBeastSkillEffects,
  createEmptySpiritBeastSkills,
  normalizeSpiritBeastSkills,
} from "./spiritBeastSkills";
import type { SpiritBeastSkills } from "./spiritBeastSkills";

export const SPIRIT_BEAST_LEVEL_MIN = 1;
export const SPIRIT_BEAST_LEVEL_MAX = 115;
export const SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL = 200;
export const SPIRIT_BEAST_POTENTIAL_POINTS_PER_LEVEL = 10;

/** 灵兽沿用人物常见方案，并额外支持纯生存向的 5 体 5 耐。 */
export const SPIRIT_BEAST_ALLOCATION_PRESETS = [
  ...CHARACTER_ALLOCATION_PRESETS,
  {
    id: "5-constitution-5-endurance",
    label: "5体5耐",
    ratio: {
      constitution: 5,
      spirit: 0,
      strength: 0,
      endurance: 5,
      agility: 0,
    },
  },
] as const satisfies readonly CharacterAllocationPreset[];

export type SpiritBeastAllocationPresetId =
  (typeof SPIRIT_BEAST_ALLOCATION_PRESETS)[number]["id"];

export const SPIRIT_BEAST_PRIMARY_ATTRIBUTES = [
  "constitution",
  "spirit",
  "strength",
  "endurance",
  "agility",
] as const satisfies readonly PrimaryAttribute[];

export type SpiritBeastPrimaryAttribute =
  (typeof SPIRIT_BEAST_PRIMARY_ATTRIBUTES)[number];

export const SPIRIT_BEAST_DERIVED_ATTRIBUTES = [
  "health",
  "mana",
  "physicalAttack",
  "magicalAttack",
  "physicalDefense",
  "magicalDefense",
  "speed",
] as const;

export type SpiritBeastDerivedAttribute =
  (typeof SPIRIT_BEAST_DERIVED_ATTRIBUTES)[number];

export const SPIRIT_BEAST_QUALIFICATIONS = [
  "physicalAttack",
  "physicalDefense",
  "health",
  "spirit",
  "speed",
] as const;

export type SpiritBeastQualification =
  (typeof SPIRIT_BEAST_QUALIFICATIONS)[number];
export type SpiritBeastQualifications = Record<
  SpiritBeastQualification,
  number
>;

export const SPIRIT_BEAST_QUALIFICATION_MIN = 900;
export const SPIRIT_BEAST_QUALIFICATION_MAX = 1800;
export const SPIRIT_BEAST_GROWTH_MIN = 1;
export const SPIRIT_BEAST_GROWTH_MAX = 1.5;

export const SPIRIT_BEAST_AFFINITIES = [
  "fireAffinity",
  "waterAffinity",
  "electricAffinity",
  "poisonAffinity",
  "iceAffinity",
  "windAffinity",
] as const;

export type SpiritBeastAffinity = (typeof SPIRIT_BEAST_AFFINITIES)[number];
export type SpiritBeastAllocation = CharacterAllocation;
export type SpiritBeastPrimaryAttributes = CharacterAllocation;
export type SpiritBeastAffinities = Record<SpiritBeastAffinity, number>;
export type SpiritBeastBonusAttribute =
  | SpiritBeastPrimaryAttribute
  | SpiritBeastDerivedAttribute
  | SpiritBeastAffinity;
export type SpiritBeastBonuses = Record<SpiritBeastBonusAttribute, number>;

export const SPIRIT_BEAST_BONUS_SOURCE_IDS = [
  "equipment",
  "accessory",
  "skill",
  "destiny",
  "mount",
] as const;

export type SpiritBeastBonusSourceId =
  (typeof SPIRIT_BEAST_BONUS_SOURCE_IDS)[number];
export type SpiritBeastBonusSources = Record<
  SpiritBeastBonusSourceId,
  SpiritBeastBonuses
>;

export type SpiritBeastCalculatorState = {
  level: number;
  growth: number;
  qualifications: SpiritBeastQualifications;
  levelZeroPrimary: SpiritBeastPrimaryAttributes;
  allocationMode: CharacterAllocationMode;
  selectedPresetId: SpiritBeastAllocationPresetId;
  customAllocationScheme: CustomCharacterAllocationScheme;
  customAllocation: CharacterAllocation;
  affinities: SpiritBeastAffinities;
  isEquipmentIncluded: boolean;
  equipment: SpiritBeastEquipmentSet;
  accessories: SpiritBeastAccessories;
  skills: SpiritBeastSkills;
  destiny: SpiritBeastDestiny;
  bonusSources: SpiritBeastBonusSources;
};

export type SpiritBeastCalculatedAttributes = {
  allocation: SpiritBeastAllocation;
  primary: SpiritBeastPrimaryAttributes;
  derived: Record<SpiritBeastDerivedAttribute, number>;
  affinities: SpiritBeastAffinities;
};

export const EMPTY_SPIRIT_BEAST_AFFINITIES: SpiritBeastAffinities = {
  fireAffinity: 0,
  waterAffinity: 0,
  electricAffinity: 0,
  poisonAffinity: 0,
  iceAffinity: 0,
  windAffinity: 0,
};

export const DEFAULT_SPIRIT_BEAST_LEVEL_ZERO_PRIMARY: SpiritBeastPrimaryAttributes =
  {
    constitution: 40,
    spirit: 40,
    strength: 40,
    endurance: 40,
    agility: 40,
  };

export const DEFAULT_SPIRIT_BEAST_QUALIFICATIONS: SpiritBeastQualifications = {
  physicalAttack: 1400,
  physicalDefense: 1400,
  health: 1400,
  spirit: 1400,
  speed: 1400,
};

export const createEmptySpiritBeastBonuses = (): SpiritBeastBonuses => ({
  health: 0,
  mana: 0,
  physicalAttack: 0,
  magicalAttack: 0,
  physicalDefense: 0,
  magicalDefense: 0,
  speed: 0,
  constitution: 0,
  spirit: 0,
  strength: 0,
  endurance: 0,
  agility: 0,
  fireAffinity: 0,
  waterAffinity: 0,
  electricAffinity: 0,
  poisonAffinity: 0,
  iceAffinity: 0,
  windAffinity: 0,
});

export const createEmptySpiritBeastBonusSources =
  (): SpiritBeastBonusSources => ({
    equipment: createEmptySpiritBeastBonuses(),
    accessory: createEmptySpiritBeastBonuses(),
    skill: createEmptySpiritBeastBonuses(),
    destiny: createEmptySpiritBeastBonuses(),
    mount: createEmptySpiritBeastBonuses(),
  });

export const createDefaultSpiritBeastState =
  (): SpiritBeastCalculatorState => ({
    level: 1,
    growth: 1,
    qualifications: { ...DEFAULT_SPIRIT_BEAST_QUALIFICATIONS },
    levelZeroPrimary: { ...DEFAULT_SPIRIT_BEAST_LEVEL_ZERO_PRIMARY },
    allocationMode: "preset",
    selectedPresetId: "10-strength",
    customAllocationScheme: "strength-or-spirit",
    customAllocation: { ...DEFAULT_CUSTOM_CHARACTER_ALLOCATION },
    affinities: { ...EMPTY_SPIRIT_BEAST_AFFINITIES },
    isEquipmentIncluded: true,
    equipment: createEmptySpiritBeastEquipmentSet(),
    accessories: createEmptySpiritBeastAccessories(),
    skills: createEmptySpiritBeastSkills(),
    destiny: createEmptySpiritBeastDestiny(),
    bonusSources: createEmptySpiritBeastBonusSources(),
  });

/**
 * 暂按未知概率生成总和 200 的五维，供用户快速建立草稿。
 * 真实随机范围尚无可靠资料，因此结果仍允许手动覆盖。
 */
export const createRandomSpiritBeastLevelZeroPrimary = (
  random: () => number = Math.random,
): SpiritBeastPrimaryAttributes => {
  const weights = SPIRIT_BEAST_PRIMARY_ATTRIBUTES.map(() =>
    Math.max(Number.EPSILON, random()),
  );
  const totalWeight = weights.reduce((total, weight) => total + weight, 0);
  const rawValues = weights.map(
    (weight) => (weight / totalWeight) * SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL,
  );
  const values = rawValues.map(Math.floor);
  const remaining =
    SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL -
    values.reduce((total, value) => total + value, 0);
  const remainderOrder = rawValues
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((left, right) => right.remainder - left.remainder);

  for (let index = 0; index < remaining; index += 1) {
    values[remainderOrder[index].index] += 1;
  }

  return Object.fromEntries(
    SPIRIT_BEAST_PRIMARY_ATTRIBUTES.map((attribute, index) => [
      attribute,
      values[index],
    ]),
  ) as SpiritBeastPrimaryAttributes;
};

const clampNumber = (
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed)
    ? Math.min(maximum, Math.max(minimum, parsed))
    : fallback;
};

const clampInteger = (
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number => Math.floor(clampNumber(value, minimum, maximum, fallback));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getSpiritBeastPotentialPoints = (level: number): number =>
  Math.max(0, Math.floor(level) * SPIRIT_BEAST_POTENTIAL_POINTS_PER_LEVEL);

export const getSpiritBeastAllocationTotal = (
  allocation: SpiritBeastAllocation,
): number =>
  SPIRIT_BEAST_PRIMARY_ATTRIBUTES.reduce(
    (total, attribute) => total + allocation[attribute],
    0,
  );

export const getSpiritBeastLevelZeroPrimaryTotal = (
  primary: SpiritBeastPrimaryAttributes,
): number => getSpiritBeastAllocationTotal(primary);

export const getSpiritBeastLevelZeroPrimaryValidationError = (
  primary: SpiritBeastPrimaryAttributes,
): string | null => {
  const total = getSpiritBeastLevelZeroPrimaryTotal(primary);

  return total === SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL
    ? null
    : `0 级五维总和必须为 ${SPIRIT_BEAST_LEVEL_ZERO_PRIMARY_TOTAL}，当前为 ${total}。`;
};

export const calculateSpiritBeastAllocation = (
  ratio: CharacterAllocation,
  level: number,
): SpiritBeastAllocation => ({
  constitution: ratio.constitution * level,
  spirit: ratio.spirit * level,
  strength: ratio.strength * level,
  endurance: ratio.endurance * level,
  agility: ratio.agility * level,
});

export const getSpiritBeastAllocationRatio = (
  state: Pick<
    SpiritBeastCalculatorState,
    | "allocationMode"
    | "selectedPresetId"
    | "customAllocationScheme"
    | "customAllocation"
  >,
): CharacterAllocation => {
  const selectedPreset =
    SPIRIT_BEAST_ALLOCATION_PRESETS.find(
      ({ id }) => id === state.selectedPresetId,
    ) ?? SPIRIT_BEAST_ALLOCATION_PRESETS[0];
  const customValidationError = getCustomCharacterAllocationValidationError(
    state.customAllocation,
    state.customAllocationScheme,
  );

  return state.allocationMode === "custom" && customValidationError === null
    ? state.customAllocation
    : selectedPreset.ratio;
};

const normalizePrimaryAttributes = (
  value: unknown,
  fallback: SpiritBeastPrimaryAttributes,
): SpiritBeastPrimaryAttributes => {
  const source = isRecord(value) ? value : {};

  return {
    constitution: clampInteger(
      source.constitution,
      0,
      9999,
      fallback.constitution,
    ),
    spirit: clampInteger(source.spirit, 0, 9999, fallback.spirit),
    strength: clampInteger(source.strength, 0, 9999, fallback.strength),
    endurance: clampInteger(source.endurance, 0, 9999, fallback.endurance),
    agility: clampInteger(source.agility, 0, 9999, fallback.agility),
  };
};

const normalizeAllocation = (
  value: unknown,
  scheme: CustomCharacterAllocationScheme,
): CharacterAllocation => {
  const source = isRecord(value) ? value : {};
  const fallback =
    scheme === "agility"
      ? DEFAULT_AGILITY_CHARACTER_ALLOCATION
      : DEFAULT_CUSTOM_CHARACTER_ALLOCATION;
  const allocation = normalizePrimaryAttributes(source, fallback);

  return getCustomCharacterAllocationValidationError(allocation, scheme) ===
    null
    ? allocation
    : { ...fallback };
};

const normalizeAffinities = (
  value: unknown,
  fallback: SpiritBeastAffinities,
): SpiritBeastAffinities => {
  const source = isRecord(value) ? value : {};
  const normalize = (attribute: SpiritBeastAffinity) =>
    clampNumber(source[attribute], -999, 999, fallback[attribute]);

  return {
    fireAffinity: normalize("fireAffinity"),
    waterAffinity: normalize("waterAffinity"),
    electricAffinity: normalize("electricAffinity"),
    poisonAffinity: normalize("poisonAffinity"),
    iceAffinity: normalize("iceAffinity"),
    windAffinity: normalize("windAffinity"),
  };
};

const normalizeBonuses = (value: unknown): SpiritBeastBonuses => {
  const source = isRecord(value) ? value : {};
  const normalize = (attribute: SpiritBeastBonusAttribute) =>
    clampNumber(source[attribute], -999999, 999999, 0);

  return {
    health: normalize("health"),
    mana: normalize("mana"),
    physicalAttack: normalize("physicalAttack"),
    magicalAttack: normalize("magicalAttack"),
    physicalDefense: normalize("physicalDefense"),
    magicalDefense: normalize("magicalDefense"),
    speed: normalize("speed"),
    constitution: normalize("constitution"),
    spirit: normalize("spirit"),
    strength: normalize("strength"),
    endurance: normalize("endurance"),
    agility: normalize("agility"),
    fireAffinity: normalize("fireAffinity"),
    waterAffinity: normalize("waterAffinity"),
    electricAffinity: normalize("electricAffinity"),
    poisonAffinity: normalize("poisonAffinity"),
    iceAffinity: normalize("iceAffinity"),
    windAffinity: normalize("windAffinity"),
  };
};

const normalizeBonusSources = (value: unknown): SpiritBeastBonusSources => {
  const source = isRecord(value) ? value : {};

  return {
    equipment: normalizeBonuses(source.equipment),
    accessory: normalizeBonuses(source.accessory),
    // 旧版允许手填技能修正；当前技能已完整结构化，恢复时清除隐藏旧值。
    skill: createEmptySpiritBeastBonuses(),
    destiny: normalizeBonuses(source.destiny),
    mount: normalizeBonuses(source.mount),
  };
};

const normalizeQualifications = (
  value: unknown,
  fallback: SpiritBeastQualifications,
): SpiritBeastQualifications => {
  const source = isRecord(value) ? value : {};
  const normalize = (qualification: SpiritBeastQualification) =>
    clampInteger(
      source[qualification],
      SPIRIT_BEAST_QUALIFICATION_MIN,
      SPIRIT_BEAST_QUALIFICATION_MAX,
      fallback[qualification],
    );

  return {
    physicalAttack: normalize("physicalAttack"),
    physicalDefense: normalize("physicalDefense"),
    health: normalize("health"),
    spirit: normalize("spirit"),
    speed: normalize("speed"),
  };
};

export const normalizeSpiritBeastCalculatorState = (
  value: unknown,
): SpiritBeastCalculatorState | null => {
  if (!isRecord(value)) return null;

  const fallback = createDefaultSpiritBeastState();
  const customAllocationScheme: CustomCharacterAllocationScheme =
    value.customAllocationScheme === "agility"
      ? "agility"
      : "strength-or-spirit";
  const selectedPresetId =
    SPIRIT_BEAST_ALLOCATION_PRESETS.find(
      ({ id }) => id === value.selectedPresetId,
    )?.id ?? fallback.selectedPresetId;

  return {
    level: clampInteger(
      value.level,
      SPIRIT_BEAST_LEVEL_MIN,
      SPIRIT_BEAST_LEVEL_MAX,
      fallback.level,
    ),
    growth: clampNumber(
      value.growth,
      SPIRIT_BEAST_GROWTH_MIN,
      SPIRIT_BEAST_GROWTH_MAX,
      fallback.growth,
    ),
    qualifications: normalizeQualifications(
      value.qualifications,
      fallback.qualifications,
    ),
    levelZeroPrimary: normalizePrimaryAttributes(
      value.levelZeroPrimary,
      fallback.levelZeroPrimary,
    ),
    allocationMode: value.allocationMode === "custom" ? "custom" : "preset",
    selectedPresetId,
    customAllocationScheme,
    customAllocation: normalizeAllocation(
      value.customAllocation,
      customAllocationScheme,
    ),
    affinities: normalizeAffinities(value.affinities, fallback.affinities),
    isEquipmentIncluded: value.isEquipmentIncluded !== false,
    equipment: normalizeSpiritBeastEquipmentSet(value.equipment),
    accessories: normalizeSpiritBeastAccessories(value.accessories),
    skills: normalizeSpiritBeastSkills(value.skills),
    destiny: normalizeSpiritBeastDestiny(value.destiny),
    bonusSources: normalizeBonusSources(value.bonusSources),
  };
};

const isBonusSourceEnabled = (
  sourceId: SpiritBeastBonusSourceId,
  state: SpiritBeastCalculatorState,
) => sourceId !== "equipment" || state.isEquipmentIncluded;

export const getSpiritBeastEquipmentBonusTotal = (
  state: SpiritBeastCalculatorState,
  attribute: SpiritBeastBonusAttribute,
): number => {
  if (!state.isEquipmentIncluded) return 0;

  const detailedBonuses = calculateSpiritBeastEquipmentBonuses(state.equipment);
  const detailedValue =
    attribute in detailedBonuses
      ? detailedBonuses[attribute as SpiritBeastEquipmentBonusAttribute]
      : 0;

  // v2 曾允许直接录入装备汇总，继续叠加可避免旧缓存和存档丢失。
  return detailedValue + state.bonusSources.equipment[attribute];
};

export const getSpiritBeastAccessoryQualificationBonus = (
  state: SpiritBeastCalculatorState,
): number =>
  calculateSpiritBeastAccessoryBonuses(state.accessories).qualification;

export const getSpiritBeastAccessoryBonusTotal = (
  state: SpiritBeastCalculatorState,
  attribute: SpiritBeastBonusAttribute,
): number => {
  const detailedBonuses = calculateSpiritBeastAccessoryBonuses(
    state.accessories,
  ).panelAttributes;
  const detailedValue =
    attribute in detailedBonuses
      ? detailedBonuses[attribute as keyof typeof detailedBonuses]
      : 0;

  // v2 曾允许直接录入灵饰汇总，继续叠加可避免旧缓存和存档丢失。
  return detailedValue + state.bonusSources.accessory[attribute];
};

export const getSpiritBeastDestinyBonusTotal = (
  state: SpiritBeastCalculatorState,
  attribute: SpiritBeastBonusAttribute,
): number => {
  const detailedBonuses = calculateSpiritBeastDestinyBonuses(
    state.destiny,
    state.level,
  );
  const detailedValue =
    attribute in detailedBonuses
      ? detailedBonuses[attribute as SpiritBeastDestinySkillAttribute]
      : 0;

  // v2 曾允许直接录入命格汇总，继续叠加可避免旧缓存和存档丢失。
  return detailedValue + state.bonusSources.destiny[attribute];
};

export const getSpiritBeastBonusTotal = (
  state: SpiritBeastCalculatorState,
  attribute: SpiritBeastBonusAttribute,
): number =>
  SPIRIT_BEAST_BONUS_SOURCE_IDS.reduce((total, sourceId) => {
    if (!isBonusSourceEnabled(sourceId, state)) return total;
    if (sourceId === "skill") return total;
    if (sourceId === "equipment") {
      return total + getSpiritBeastEquipmentBonusTotal(state, attribute);
    }
    if (sourceId === "accessory") {
      return total + getSpiritBeastAccessoryBonusTotal(state, attribute);
    }
    if (sourceId === "destiny") {
      return total + getSpiritBeastDestinyBonusTotal(state, attribute);
    }

    return total + state.bonusSources[sourceId][attribute];
  }, 0);

/**
 * 两组升级预览中，未向灵力分配潜力时的法力增量均符合此规则。
 * 当前仅作为待更多样本复核的等级成长系数。
 */
export const getSpiritBeastManaGrowthPerLevel = (growth: number): number =>
  12 + growth * 10;

const calculateBaseSpiritBeastAttributes = (
  state: SpiritBeastCalculatorState,
): SpiritBeastCalculatedAttributes => {
  const allocation = calculateSpiritBeastAllocation(
    getSpiritBeastAllocationRatio(state),
    state.level,
  );
  const fixedGrowth = state.level * FIXED_ATTRIBUTE_POINTS_PER_LEVEL;
  const accessoryQualificationBonus =
    getSpiritBeastAccessoryQualificationBonus(state);
  const primary = Object.fromEntries(
    SPIRIT_BEAST_PRIMARY_ATTRIBUTES.map((attribute) => [
      attribute,
      state.levelZeroPrimary[attribute] +
        fixedGrowth +
        allocation[attribute] +
        getSpiritBeastBonusTotal(state, attribute),
    ]),
  ) as SpiritBeastPrimaryAttributes;
  const sharedMagicalGrowth =
    primary.spirit * 0.5 +
    primary.strength * 0.3 +
    (primary.constitution + primary.endurance) * 0.1;
  const derived: Record<SpiritBeastDerivedAttribute, number> = {
    health:
      50 +
      ((state.qualifications.health + accessoryQualificationBonus) *
        state.level *
        10) /
        1000 +
      primary.constitution * 3 * state.growth +
      getSpiritBeastBonusTotal(state, "health"),
    mana:
      (state.level - 1) * getSpiritBeastManaGrowthPerLevel(state.growth) +
      getSpiritBeastBonusTotal(state, "mana"),
    physicalAttack:
      100 +
      ((state.qualifications.physicalAttack + accessoryQualificationBonus) *
        state.level *
        5) /
        1000 +
      primary.strength * 0.5 * state.growth +
      getSpiritBeastBonusTotal(state, "physicalAttack"),
    magicalAttack:
      80 +
      ((state.qualifications.spirit + accessoryQualificationBonus) *
        state.level *
        1.425) /
        1000 +
      sharedMagicalGrowth * state.growth +
      getSpiritBeastBonusTotal(state, "magicalAttack"),
    physicalDefense:
      ((state.qualifications.physicalDefense + accessoryQualificationBonus) *
        state.level *
        3.33) /
        1000 +
      primary.endurance * state.growth +
      getSpiritBeastBonusTotal(state, "physicalDefense"),
    magicalDefense:
      ((state.qualifications.spirit + accessoryQualificationBonus) *
        state.level *
        0.62) /
        1000 +
      sharedMagicalGrowth * state.growth +
      getSpiritBeastBonusTotal(state, "magicalDefense"),
    speed:
      ((state.qualifications.speed + accessoryQualificationBonus) *
        state.level *
        2.215) /
        1000 +
      ((primary.constitution + primary.strength + primary.endurance) * 0.1 +
        primary.spirit * 0.05 +
        primary.agility * 0.5) *
        state.growth +
      getSpiritBeastBonusTotal(state, "speed"),
  };
  const affinities = Object.fromEntries(
    SPIRIT_BEAST_AFFINITIES.map((attribute) => [
      attribute,
      state.affinities[attribute] + getSpiritBeastBonusTotal(state, attribute),
    ]),
  ) as SpiritBeastAffinities;

  return { allocation, primary, derived, affinities };
};

const calculateStructuredSkillBonusesFromBase = (
  state: SpiritBeastCalculatorState,
  base: SpiritBeastCalculatedAttributes,
): SpiritBeastBonuses => {
  const effects = calculateSpiritBeastSkillEffects(state.skills, {
    spirit: base.primary.spirit,
    health: base.derived.health,
    speed: base.derived.speed,
  });
  const bonuses = createEmptySpiritBeastBonuses();

  bonuses.magicalAttack = effects.magicalAttack;
  bonuses.health = effects.health;
  bonuses.speed = effects.speed;
  SPIRIT_BEAST_AFFINITIES.forEach((affinity) => {
    bonuses[affinity] = effects.affinities[affinity];
  });

  return bonuses;
};

/** 返回结构化面板技能的实际数值加成，供计算结果和来源明细共用。 */
export const calculateSpiritBeastStructuredSkillBonuses = (
  state: SpiritBeastCalculatorState,
): SpiritBeastBonuses =>
  calculateStructuredSkillBonusesFromBase(
    state,
    calculateBaseSpiritBeastAttributes(state),
  );

/**
 * 五维沿用人物面板的“0 级初值 + 每级固定成长 + 每级潜力”规则。
 * 资质换算沿用当前截图提供的待复核公式。
 */
export const calculateSpiritBeastAttributes = (
  state: SpiritBeastCalculatorState,
): SpiritBeastCalculatedAttributes => {
  const base = calculateBaseSpiritBeastAttributes(state);
  const skillBonuses = calculateStructuredSkillBonusesFromBase(state, base);
  const derived = {
    ...base.derived,
    health: base.derived.health + skillBonuses.health,
    magicalAttack: base.derived.magicalAttack + skillBonuses.magicalAttack,
    speed: base.derived.speed + skillBonuses.speed,
  };
  const affinities = Object.fromEntries(
    SPIRIT_BEAST_AFFINITIES.map((attribute) => [
      attribute,
      base.affinities[attribute] + skillBonuses[attribute],
    ]),
  ) as SpiritBeastAffinities;

  return {
    allocation: base.allocation,
    primary: base.primary,
    derived,
    affinities,
  };
};

export const EMPTY_SPIRIT_BEAST_ALLOCATION: SpiritBeastAllocation = {
  ...EMPTY_CHARACTER_ALLOCATION,
};
