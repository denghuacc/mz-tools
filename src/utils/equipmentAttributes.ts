import {
  AFFINITY_BONUS_FIELDS,
  CHARACTER_BONUS_ATTRIBUTE_KEYS,
  createEmptyCharacterAttributeBonuses,
  normalizeCharacterLevel,
} from "./characterAttributes";
import type {
  CharacterAffinityBonusAttribute,
  CharacterAttributeBonuses,
  CharacterBonusAttribute,
  CharacterLevel,
  PrimaryAttribute,
} from "./characterAttributes";

export const EQUIPMENT_SLOTS = [
  "weapon",
  "armor",
  "headgear",
  "lowerGarment",
  "accessory",
  "shoes",
  "ring",
  "necklace",
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export const SEASON_EQUIPMENT_SLOTS = ["ring", "necklace"] as const;
export type SeasonEquipmentSlot = (typeof SEASON_EQUIPMENT_SLOTS)[number];

export const isSeasonEquipmentSlot = (
  slot: EquipmentSlot,
): slot is SeasonEquipmentSlot =>
  SEASON_EQUIPMENT_SLOTS.includes(slot as SeasonEquipmentSlot);

export const EQUIPMENT_SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: "武器",
  armor: "上衣",
  headgear: "发冠",
  lowerGarment: "下装",
  accessory: "饰品",
  shoes: "鞋子",
  ring: "戒指",
  necklace: "项链",
};

export type EquipmentOnlyAttribute =
  | "physicalDamageResult"
  | "magicalDamageResult"
  | "physicalDamageReduction"
  | "magicalDamageReduction"
  | "criticalDamageReductionPercent"
  | "criticalDamagePercent";

export type EquipmentAttribute =
  | CharacterBonusAttribute
  | EquipmentOnlyAttribute;

export const EQUIPMENT_INDEPENDENT_AFFIX_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export type EquipmentIndependentAffixLevel =
  (typeof EQUIPMENT_INDEPENDENT_AFFIX_LEVELS)[number];

export const EQUIPMENT_INDEPENDENT_AFFIX_CONFIG = {
  岐黄: {
    slots: ["weapon"],
    attribute: "healingPower",
    baseValue: 6,
  },
  龙吟: {
    slots: ["weapon"],
    attribute: "magicAttack",
    baseValue: 6,
  },
  罗刹: {
    slots: ["weapon"],
    attribute: "physicalAttack",
    baseValue: 6,
  },
  囚牢: {
    slots: ["weapon"],
    attribute: "sealHit",
    baseValue: 1,
  },
  扶摇: {
    slots: ["shoes"],
    attribute: "sealResistance",
    baseValue: 1,
  },
} as const satisfies Record<
  string,
  {
    slots: readonly EquipmentSlot[];
    attribute: EquipmentAttribute;
    baseValue: number;
  }
>;

export type EquipmentIndependentAffixName =
  keyof typeof EQUIPMENT_INDEPENDENT_AFFIX_CONFIG;

export type EquipmentIndependentAffix = {
  name: EquipmentIndependentAffixName;
  level: EquipmentIndependentAffixLevel;
};

export const EQUIPMENT_GEM_CONFIG = {
  diamond: {
    label: "金刚石",
    attribute: "physicalAttack",
    baseValue: 12,
  },
  aquamarine: {
    label: "海蓝石",
    attribute: "magicAttack",
    baseValue: 9,
  },
  jade: {
    label: "翡翠",
    attribute: "healingPower",
    baseValue: 6,
  },
  malachite: {
    label: "孔雀石",
    attribute: "physicalDefense",
    baseValue: 18,
  },
  catsEye: {
    label: "猫眼石",
    attribute: "magicDefense",
    baseValue: 12,
  },
  agate: {
    label: "玛瑙",
    attribute: "health",
    baseValue: 75,
  },
  pearl: {
    label: "珍珠",
    attribute: "speed",
    baseValue: 8,
  },
  amethyst: {
    label: "紫水晶",
    attribute: "mana",
    baseValue: 90,
  },
} as const satisfies Record<
  string,
  { label: string; attribute: EquipmentAttribute; baseValue: number }
>;

export type EquipmentGemType = keyof typeof EQUIPMENT_GEM_CONFIG;

export type EquipmentGem = {
  type: EquipmentGemType;
  level: number;
  breakthrough: boolean;
};

export const EQUIPMENT_GEM_SLOT_CONFIG: Record<
  EquipmentSlot,
  readonly EquipmentGemType[]
> = {
  weapon: ["diamond", "aquamarine", "jade", "amethyst"],
  armor: ["jade", "malachite", "catsEye", "agate"],
  headgear: ["diamond", "malachite"],
  lowerGarment: ["agate", "pearl"],
  accessory: ["aquamarine", "catsEye"],
  shoes: ["pearl", "amethyst"],
  ring: [],
  necklace: [],
};

export const DEFAULT_EQUIPMENT_CHARACTER_LEVEL = 69;
export const MAX_GEM_EQUIPMENT_COUNT = 2;

/** 宝石等级上限在 105 级时从角色等级整除结果 +2 切换为 +3。 */
export const getGemLevelLimit = (characterLevel: number): number => {
  const normalizedLevel = Number.isFinite(characterLevel)
    ? Math.max(1, Math.floor(characterLevel))
    : DEFAULT_EQUIPMENT_CHARACTER_LEVEL;
  return Math.floor(normalizedLevel / 10) + (normalizedLevel >= 105 ? 3 : 2);
};

export const EQUIPMENT_PRIMARY_ATTRIBUTES = [
  "constitution",
  "spirit",
  "strength",
  "endurance",
  "agility",
] as const satisfies readonly PrimaryAttribute[];

export const EQUIPMENT_ATTRIBUTE_OPTIONS = [
  { attribute: "constitution", label: "体" },
  { attribute: "spirit", label: "灵" },
  { attribute: "strength", label: "力" },
  { attribute: "endurance", label: "耐" },
  { attribute: "agility", label: "敏" },
  { attribute: "health", label: "气血" },
  { attribute: "mana", label: "法力" },
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度" },
  { attribute: "healingPower", label: "治疗强度" },
  { attribute: "physicalDamageResult", label: "物伤结果" },
  { attribute: "magicalDamageResult", label: "法伤结果" },
  { attribute: "physicalDamageReduction", label: "物伤减免" },
  { attribute: "magicalDamageReduction", label: "法伤减免" },
  { attribute: "sealHit", label: "封印命中" },
  { attribute: "sealResistance", label: "抗封" },
  { attribute: "dodgeRate", label: "闪避" },
  { attribute: "criticalDamageReductionPercent", label: "暴伤减免" },
  { attribute: "criticalDamagePercent", label: "暴击伤害" },
] as const satisfies readonly {
  attribute: EquipmentAttribute;
  label: string;
}[];

/** 角色戒指、项链等赛年神装共用的完整副属性候选。 */
export const SEASON_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS =
  EQUIPMENT_ATTRIBUTE_OPTIONS.map((option) =>
    option.attribute === "criticalDamageReductionPercent" ||
    option.attribute === "criticalDamagePercent" ||
    option.attribute === "dodgeRate"
      ? { ...option, label: `${option.label}（%）` }
      : option,
  );
export type SeasonEquipmentSecondaryAttribute =
  (typeof SEASON_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS)[number]["attribute"];

export const EQUIPMENT_AFFINITY_EFFECT_OPTIONS = AFFINITY_BONUS_FIELDS;
export const EQUIPMENT_AFFINITY_EFFECT_VALUE = 3;
export const ACCESSORY_VITALITY_EFFECT_VALUE = 5;
export type EquipmentAffinityEffectAttribute = CharacterAffinityBonusAttribute;

export const EQUIPMENT_ATTRIBUTE_LABELS = Object.fromEntries(
  [
    ...EQUIPMENT_ATTRIBUTE_OPTIONS,
    ...EQUIPMENT_AFFINITY_EFFECT_OPTIONS,
    { attribute: "healthPercent", label: "气血" },
    { attribute: "speedPercent", label: "速度" },
  ].map(({ attribute, label }) => [attribute, label]),
) as Record<EquipmentAttribute, string>;

export const EQUIPMENT_BASE_ATTRIBUTE_CONFIG: Record<
  EquipmentSlot,
  readonly EquipmentAttribute[]
> = {
  weapon: ["physicalAttack", "magicAttack", "healingPower"],
  armor: ["health", "physicalDefense"],
  headgear: ["mana", "physicalDefense"],
  lowerGarment: ["health", "magicDefense"],
  accessory: ["magicAttack", "magicDefense"],
  shoes: ["physicalDefense", "speed"],
  ring: ["health"],
  necklace: [],
};

export const RING_SECONDARY_ATTRIBUTE_OPTIONS = [
  { attribute: "physicalAttack", label: "物理职业 · 物攻" },
  { attribute: "magicAttack", label: "法师职业 · 法攻" },
  { attribute: "speed", label: "辅助 / 封印职业 · 速度" },
] as const satisfies readonly {
  attribute: EquipmentAttribute;
  label: string;
}[];

export type RingSecondaryAttribute =
  (typeof RING_SECONDARY_ATTRIBUTE_OPTIONS)[number]["attribute"];

export const NECKLACE_BASE_ATTRIBUTE_OPTIONS = [
  { attribute: "health", label: "气血" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
] as const satisfies readonly {
  attribute: EquipmentAttribute;
  label: string;
}[];

export type NecklaceBaseAttribute =
  (typeof NECKLACE_BASE_ATTRIBUTE_OPTIONS)[number]["attribute"];

export type EquipmentAttributeValues = Partial<
  Record<EquipmentAttribute, number>
>;

/** 戒指固定气血，并按职业只取物攻、法攻、速度中的一条作为第二主属性。 */
export const getRingSecondaryAttribute = (
  attributes: EquipmentAttributeValues,
): RingSecondaryAttribute =>
  RING_SECONDARY_ATTRIBUTE_OPTIONS.find(
    ({ attribute }) => attributes[attribute] !== undefined,
  )?.attribute ?? "physicalAttack";

/** 项链从气血、物防、法防中取两条不重复的装备属性。 */
export const getNecklaceBaseAttributeLines = (
  attributes: EquipmentAttributeValues,
): EquipmentAttributeLine[] => {
  const allowedAttributes = new Set<EquipmentAttribute>(
    NECKLACE_BASE_ATTRIBUTE_OPTIONS.map(({ attribute }) => attribute),
  );
  const lines = (Object.entries(attributes) as [EquipmentAttribute, number][])
    .filter(([attribute]) => allowedAttributes.has(attribute))
    .slice(0, 2)
    .map(([attribute, value]) => ({
      attribute,
      value,
    }));

  for (const option of NECKLACE_BASE_ATTRIBUTE_OPTIONS) {
    if (lines.length === 2) break;
    if (lines.some((line) => line.attribute === option.attribute)) continue;
    lines.push({ attribute: option.attribute, value: 0 });
  }

  return lines;
};

export type EquipmentAttributeLine = {
  attribute: EquipmentAttribute;
  value: number;
};

export type EquipmentPrimaryAttributeLine = {
  attribute: PrimaryAttribute;
  value: number;
};

export type SeasonEffectLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const SEASON_EQUIPMENT_EFFECT_OPTIONS = [
  {
    effect: "疾风神固",
    attribute: "speed",
    valuePerLevel: 10,
  },
] as const satisfies readonly {
  effect: string;
  attribute: EquipmentAttribute;
  valuePerLevel: number;
}[];

export type SeasonEquipmentEffectName =
  (typeof SEASON_EQUIPMENT_EFFECT_OPTIONS)[number]["effect"];

export const SEASON_EQUIPMENT_RESONANCE_THRESHOLDS = [4, 6, 8, 9, 10] as const;
export type SeasonEquipmentResonanceThreshold =
  (typeof SEASON_EQUIPMENT_RESONANCE_THRESHOLDS)[number];

export const getSeasonEquipmentEffectOption = (effect: string) =>
  SEASON_EQUIPMENT_EFFECT_OPTIONS.find((option) => option.effect === effect);

export type EquipmentItem = {
  slot: EquipmentSlot;
  enabled: boolean;
  level: number;
  gem: EquipmentGem | null;
  independentAffix: EquipmentIndependentAffix | null;
  baseAttributes: EquipmentAttributeValues;
  additionalPrimaryAttributes: readonly EquipmentPrimaryAttributeLine[];
  tempering: EquipmentAttributeLine;
  affixes: readonly EquipmentAttributeLine[];
  supportAttribute: EquipmentPrimaryAttributeLine | null;
  blessing: boolean;
  growth: boolean;
  gale: boolean;
  affinityEffectAttribute: EquipmentAffinityEffectAttribute | null;
  vitalityEffect: boolean;
  specialEffect: string;
  seasonEffectLevel: SeasonEffectLevel;
  specialEffectAttribute: EquipmentAttributeLine | null;
  specialSkill: string;
};

export const BASE_EQUIPMENT_EFFECT_LIMIT = 2;
export type BaseEquipmentEffectId =
  | "support"
  | "blessing"
  | "growth"
  | "gale"
  | "affinity"
  | "vitality"
  | "custom";

/** 列出基础装备已配置的特效；特技不计入特效数量。 */
export const getBaseEquipmentEffectIds = (
  item: EquipmentItem,
): BaseEquipmentEffectId[] => {
  if (isSeasonEquipmentSlot(item.slot)) return [];

  return [
    item.supportAttribute ? "support" : null,
    item.blessing ? "blessing" : null,
    item.growth ? "growth" : null,
    item.slot === "shoes" && item.gale ? "gale" : null,
    item.slot === "armor" && item.affinityEffectAttribute ? "affinity" : null,
    item.slot === "accessory" && item.vitalityEffect ? "vitality" : null,
    item.specialEffect.trim() || item.specialEffectAttribute ? "custom" : null,
  ].filter((effect): effect is BaseEquipmentEffectId => effect !== null);
};

/** 返回真正生效的基础装备特效，统一执行最多两个的规则。 */
export const getEffectiveBaseEquipmentEffectIds = (
  item: EquipmentItem,
): BaseEquipmentEffectId[] =>
  getBaseEquipmentEffectIds(item).slice(0, BASE_EQUIPMENT_EFFECT_LIMIT);

export type EquipmentGemBonus = {
  type: EquipmentGemType;
  level: number;
  levelLimit: number;
  breakthrough: boolean;
  attribute: EquipmentAttribute;
  value: number;
};

export type EquipmentIndependentAffixBonus = {
  name: EquipmentIndependentAffixName;
  level: EquipmentIndependentAffixLevel;
  attribute: EquipmentAttribute;
  value: number;
};

/** 只计算已收录且装备部位匹配的独立词条面板属性。 */
export const calculateEquipmentIndependentAffixBonus = (
  item: EquipmentItem,
): EquipmentIndependentAffixBonus | null => {
  const affix = item.independentAffix;
  if (!affix || !EQUIPMENT_INDEPENDENT_AFFIX_LEVELS.includes(affix.level)) {
    return null;
  }

  const name = affix.name.trim() as EquipmentIndependentAffixName;
  const config = EQUIPMENT_INDEPENDENT_AFFIX_CONFIG[name];
  if (
    !config ||
    !(config.slots as readonly EquipmentSlot[]).includes(item.slot)
  ) {
    return null;
  }

  return {
    name,
    level: affix.level,
    attribute: config.attribute,
    value: config.baseValue * affix.level,
  };
};

/** 计算单件装备的有效宝石属性；成长特效生效时额外增加 20%。 */
export const calculateEquipmentGemBonus = (
  item: EquipmentItem,
  characterLevel = DEFAULT_EQUIPMENT_CHARACTER_LEVEL,
): EquipmentGemBonus | null => {
  if (!item.gem || isSeasonEquipmentSlot(item.slot)) return null;
  if (!EQUIPMENT_GEM_SLOT_CONFIG[item.slot].includes(item.gem.type))
    return null;

  const config = EQUIPMENT_GEM_CONFIG[item.gem.type];
  const levelLimit = getGemLevelLimit(characterLevel);
  const storedLevel = Math.max(1, Math.floor(item.gem.level));
  const level = Math.min(
    storedLevel + (item.gem.breakthrough ? 1 : 0),
    levelLimit + (item.gem.breakthrough ? 1 : 0),
  );
  const breakthrough = item.gem.breakthrough && level > levelLimit;
  const growthMultiplier = getEffectiveBaseEquipmentEffectIds(item).includes(
    "growth",
  )
    ? 1.2
    : 1;

  return {
    type: item.gem.type,
    level,
    levelLimit,
    breakthrough,
    attribute: config.attribute,
    value: Number((config.baseValue * level * growthMultiplier).toFixed(10)),
  };
};

export const canEnableBaseEquipmentEffect = (
  item: EquipmentItem,
  effect: BaseEquipmentEffectId,
) => {
  const configuredEffects = getBaseEquipmentEffectIds(item);
  return (
    configuredEffects.includes(effect) ||
    configuredEffects.length < BASE_EQUIPMENT_EFFECT_LIMIT
  );
};

/** 统一生成装备卡片展示的特效与特技标签。 */
export const getEquipmentEffectLabels = (item: EquipmentItem): string[] => {
  if (isSeasonEquipmentSlot(item.slot)) {
    const effect = getSeasonEquipmentEffectOption(item.specialEffect);

    return [
      "赛年神装",
      effect && item.seasonEffectLevel > 0
        ? `${effect.effect} · ${item.seasonEffectLevel}级`
        : null,
    ].filter((effect): effect is string => effect !== null);
  }

  const effects = new Set(getEffectiveBaseEquipmentEffectIds(item));
  const independentAffixBonus = calculateEquipmentIndependentAffixBonus(item);
  return [
    independentAffixBonus
      ? `${independentAffixBonus.name} · ${independentAffixBonus.level}级`
      : null,
    effects.has("blessing") ? "祝福" : null,
    effects.has("support") ? "加持" : null,
    effects.has("growth") ? "成长" : null,
    effects.has("gale") ? "疾风" : null,
    effects.has("affinity") && item.affinityEffectAttribute
      ? `${EQUIPMENT_ATTRIBUTE_LABELS[item.affinityEffectAttribute]} +${EQUIPMENT_AFFINITY_EFFECT_VALUE}`
      : null,
    effects.has("vitality")
      ? `体魄 · 气血 +${ACCESSORY_VITALITY_EFFECT_VALUE}%`
      : null,
    effects.has("custom") ? item.specialEffect || "其它属性特效" : null,
    item.specialSkill || null,
  ].filter((effect): effect is string => effect !== null);
};

export type EquipmentSet = Record<EquipmentSlot, EquipmentItem>;

export type SeasonEquipmentResonance = {
  effect: SeasonEquipmentEffectName;
  totalLevel: number;
  reachedThreshold: SeasonEquipmentResonanceThreshold | null;
  nextThreshold: SeasonEquipmentResonanceThreshold | null;
};

/** 同名神装特效按两件装备的等级和取已达到的最高共鸣档位。 */
export const getSeasonEquipmentResonance = (
  equipment: EquipmentSet,
): SeasonEquipmentResonance | null => {
  const ring = equipment.ring;
  const necklace = equipment.necklace;
  const ringEffect = getSeasonEquipmentEffectOption(ring.specialEffect);
  const necklaceEffect = getSeasonEquipmentEffectOption(necklace.specialEffect);

  if (
    !ring.enabled ||
    !necklace.enabled ||
    !ringEffect ||
    !necklaceEffect ||
    ringEffect.effect !== necklaceEffect.effect ||
    ring.seasonEffectLevel === 0 ||
    necklace.seasonEffectLevel === 0
  ) {
    return null;
  }

  const totalLevel = ring.seasonEffectLevel + necklace.seasonEffectLevel;
  const reachedThreshold =
    [...SEASON_EQUIPMENT_RESONANCE_THRESHOLDS]
      .reverse()
      .find((threshold) => totalLevel >= threshold) ?? null;
  const nextThreshold =
    SEASON_EQUIPMENT_RESONANCE_THRESHOLDS.find(
      (threshold) => totalLevel < threshold,
    ) ?? null;

  return {
    effect: ringEffect.effect,
    totalLevel,
    reachedThreshold,
    nextThreshold,
  };
};

const createItem = (
  slot: EquipmentSlot,
  changes: Partial<Omit<EquipmentItem, "slot">> = {},
): EquipmentItem => ({
  slot,
  enabled: true,
  level: 60,
  gem: null,
  independentAffix: null,
  baseAttributes: {},
  additionalPrimaryAttributes: [{ attribute: "constitution", value: 0 }],
  tempering: { attribute: "strength", value: 0 },
  affixes: [],
  supportAttribute: null,
  blessing: false,
  growth: false,
  gale: false,
  affinityEffectAttribute: null,
  vitalityEffect: false,
  specialEffect: "",
  seasonEffectLevel: 0,
  specialEffectAttribute: null,
  specialSkill: "",
  ...changes,
});

/**
 * 用用户提供的 60 级装备截图初始化示例。输入均视为游戏面板最终值，
 * 因此祝福只记录状态，不再二次放大这些数值。
 */
export const createInitialEquipmentSet = (): EquipmentSet => ({
  weapon: createItem("weapon", {
    baseAttributes: {
      physicalAttack: 714,
      magicAttack: 216,
      healingPower: 189,
    },
    additionalPrimaryAttributes: [
      { attribute: "strength", value: 33 },
      { attribute: "agility", value: 32 },
    ],
    tempering: { attribute: "constitution", value: 25 },
    blessing: true,
  }),
  armor: createItem("armor", {
    baseAttributes: { health: 563, physicalDefense: 170 },
    tempering: { attribute: "strength", value: 28 },
    supportAttribute: { attribute: "endurance", value: 38 },
  }),
  headgear: createItem("headgear", {
    baseAttributes: { mana: 1820, physicalDefense: 133 },
    tempering: { attribute: "strength", value: 31 },
    supportAttribute: { attribute: "strength", value: 39 },
  }),
  lowerGarment: createItem("lowerGarment", {
    baseAttributes: { health: 816, magicDefense: 83 },
    tempering: { attribute: "strength", value: 27 },
    supportAttribute: { attribute: "agility", value: 33 },
    specialSkill: "四面楚歌",
  }),
  accessory: createItem("accessory", {
    baseAttributes: { magicAttack: 122, magicDefense: 133 },
    tempering: { attribute: "strength", value: 30 },
    supportAttribute: { attribute: "strength", value: 34 },
  }),
  shoes: createItem("shoes", {
    baseAttributes: { physicalDefense: 80, speed: 138 },
    tempering: { attribute: "strength", value: 31 },
    supportAttribute: { attribute: "strength", value: 40 },
  }),
  ring: createItem("ring", {
    baseAttributes: { health: 73, physicalAttack: 18 },
    additionalPrimaryAttributes: [],
    tempering: { attribute: "strength", value: 15 },
    affixes: [
      { attribute: "physicalAttack", value: 24 },
      { attribute: "magicAttack", value: 25 },
      { attribute: "magicalDamageReduction", value: 11 },
    ],
  }),
  necklace: createItem("necklace", {
    baseAttributes: { health: 99, physicalDefense: 29 },
    additionalPrimaryAttributes: [],
    tempering: { attribute: "strength", value: 23 },
    affixes: [
      { attribute: "magicalDamageResult", value: 25 },
      { attribute: "physicalDamageResult", value: 24 },
      { attribute: "magicDefense", value: 13 },
    ],
  }),
});

/** 创建不含任何属性、宝石、词条或特效的八件装备配置。 */
export const createEmptyEquipmentSet = (): EquipmentSet =>
  Object.fromEntries(
    EQUIPMENT_SLOTS.map((slot) => [slot, createItem(slot)]),
  ) as EquipmentSet;

const EQUIPMENT_ATTRIBUTE_SET = new Set<string>(
  EQUIPMENT_ATTRIBUTE_OPTIONS.map(({ attribute }) => attribute),
);
const STORED_EQUIPMENT_PRIMARY_ATTRIBUTE_SET = new Set<string>(
  EQUIPMENT_PRIMARY_ATTRIBUTES,
);
const EQUIPMENT_AFFINITY_ATTRIBUTE_SET = new Set<string>(
  EQUIPMENT_AFFINITY_EFFECT_OPTIONS.map(({ attribute }) => attribute),
);
const EQUIPMENT_GEM_TYPE_SET = new Set<string>(
  Object.keys(EQUIPMENT_GEM_CONFIG),
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeEquipmentAttributeValues = (
  value: unknown,
  fallback: EquipmentAttributeValues,
): EquipmentAttributeValues => {
  if (!isRecord(value)) return fallback;

  return Object.fromEntries(
    Object.entries(value).filter(
      ([attribute, storedValue]) =>
        EQUIPMENT_ATTRIBUTE_SET.has(attribute) &&
        typeof storedValue === "number" &&
        Number.isFinite(storedValue),
    ),
  ) as EquipmentAttributeValues;
};

const mergeEquipmentAttributeValues = (
  baseAttributes: EquipmentAttributeValues,
  additionalAttributes: EquipmentAttributeValues,
): EquipmentAttributeValues => {
  const mergedAttributes = { ...baseAttributes };

  for (const [attribute, value] of Object.entries(additionalAttributes) as [
    EquipmentAttribute,
    number,
  ][]) {
    mergedAttributes[attribute] = (mergedAttributes[attribute] ?? 0) + value;
  }

  return mergedAttributes;
};

const normalizeEquipmentGem = (
  value: unknown,
  slot: EquipmentSlot,
  fallback: EquipmentGem | null,
): EquipmentGem | null => {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    typeof value.type !== "string" ||
    !EQUIPMENT_GEM_TYPE_SET.has(value.type) ||
    !EQUIPMENT_GEM_SLOT_CONFIG[slot].includes(value.type as EquipmentGemType) ||
    typeof value.level !== "number" ||
    !Number.isInteger(value.level) ||
    value.level < 1
  ) {
    return fallback;
  }

  return {
    type: value.type as EquipmentGemType,
    level: value.level,
    breakthrough: value.breakthrough === true,
  };
};

const normalizeEquipmentIndependentAffix = (
  value: unknown,
  slot: EquipmentSlot,
  fallback: EquipmentIndependentAffix | null,
): EquipmentIndependentAffix | null => {
  if (value === null) return null;
  const name =
    isRecord(value) && typeof value.name === "string"
      ? (value.name.trim() as EquipmentIndependentAffixName)
      : null;
  const config = name ? EQUIPMENT_INDEPENDENT_AFFIX_CONFIG[name] : null;
  if (
    !isRecord(value) ||
    !name ||
    !config ||
    !(config.slots as readonly EquipmentSlot[]).includes(slot) ||
    typeof value.level !== "number" ||
    !Number.isInteger(value.level) ||
    !EQUIPMENT_INDEPENDENT_AFFIX_LEVELS.some((level) => level === value.level)
  ) {
    return fallback;
  }

  return {
    name,
    level: value.level as EquipmentIndependentAffixLevel,
  };
};

const normalizeEquipmentAttributeLine = <Attribute extends EquipmentAttribute>(
  value: unknown,
  allowedAttributes: ReadonlySet<string>,
  fallback: { attribute: Attribute; value: number },
): { attribute: Attribute; value: number } => {
  if (
    !isRecord(value) ||
    typeof value.attribute !== "string" ||
    !allowedAttributes.has(value.attribute) ||
    typeof value.value !== "number" ||
    !Number.isFinite(value.value)
  ) {
    return fallback;
  }

  return {
    attribute: value.attribute as Attribute,
    value: value.value,
  };
};

const normalizeOptionalEquipmentAttributeLine = <
  Attribute extends EquipmentAttribute,
>(
  value: unknown,
  allowedAttributes: ReadonlySet<string>,
  fallback: { attribute: Attribute; value: number } | null,
): { attribute: Attribute; value: number } | null => {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    typeof value.attribute !== "string" ||
    !allowedAttributes.has(value.attribute) ||
    typeof value.value !== "number" ||
    !Number.isFinite(value.value)
  ) {
    return fallback;
  }

  return {
    attribute: value.attribute as Attribute,
    value: value.value,
  };
};

const normalizeEquipmentAttributeLines = <Attribute extends EquipmentAttribute>(
  value: unknown,
  allowedAttributes: ReadonlySet<string>,
  maximumLineCount: number,
  fallback: readonly { attribute: Attribute; value: number }[],
): readonly { attribute: Attribute; value: number }[] => {
  if (!Array.isArray(value)) return fallback;

  const lines: { attribute: Attribute; value: number }[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) continue;

    if (
      typeof candidate.attribute !== "string" ||
      !allowedAttributes.has(candidate.attribute) ||
      typeof candidate.value !== "number" ||
      !Number.isFinite(candidate.value)
    ) {
      continue;
    }

    lines.push({
      attribute: candidate.attribute as Attribute,
      value: candidate.value,
    });
    if (lines.length === maximumLineCount) break;
  }

  return lines;
};

/** 新增 EquipmentItem 字段时必须在这里补充恢复规则，避免旧缓存产生缺字段。 */
const normalizeEquipmentItem = (
  value: unknown,
  slot: EquipmentSlot,
  fallback: EquipmentItem,
): EquipmentItem => {
  if (!isRecord(value)) return fallback;

  const supportAttribute = normalizeOptionalEquipmentAttributeLine(
    value.supportAttribute,
    STORED_EQUIPMENT_PRIMARY_ATTRIBUTE_SET,
    fallback.supportAttribute,
  );
  const affinityEffectAttribute =
    value.affinityEffectAttribute === null
      ? null
      : typeof value.affinityEffectAttribute === "string" &&
          EQUIPMENT_AFFINITY_ATTRIBUTE_SET.has(value.affinityEffectAttribute)
        ? (value.affinityEffectAttribute as EquipmentAffinityEffectAttribute)
        : fallback.affinityEffectAttribute;
  const specialEffectAttribute = normalizeOptionalEquipmentAttributeLine(
    value.specialEffectAttribute,
    EQUIPMENT_ATTRIBUTE_SET,
    fallback.specialEffectAttribute,
  );
  const seasonEffectLevel =
    typeof value.seasonEffectLevel === "number" &&
    Number.isInteger(value.seasonEffectLevel) &&
    value.seasonEffectLevel >= 0 &&
    value.seasonEffectLevel <= 5
      ? (value.seasonEffectLevel as SeasonEffectLevel)
      : fallback.seasonEffectLevel;
  const baseAttributes = normalizeEquipmentAttributeValues(
    value.baseAttributes,
    fallback.baseAttributes,
  );
  // 旧缓存曾单独保存铸灵值，读取时合并到游戏面板展示的最终装备属性。
  const legacyCastingAttributes =
    !isSeasonEquipmentSlot(slot) && isRecord(value.baseAttributes)
      ? normalizeEquipmentAttributeValues(value.castingAttributes, {})
      : {};

  return {
    slot,
    enabled:
      typeof value.enabled === "boolean" ? value.enabled : fallback.enabled,
    level:
      typeof value.level === "number" &&
      Number.isFinite(value.level) &&
      value.level >= 0
        ? value.level
        : fallback.level,
    gem: normalizeEquipmentGem(value.gem, slot, fallback.gem),
    independentAffix: normalizeEquipmentIndependentAffix(
      value.independentAffix,
      slot,
      fallback.independentAffix,
    ),
    baseAttributes: mergeEquipmentAttributeValues(
      baseAttributes,
      legacyCastingAttributes,
    ),
    additionalPrimaryAttributes: normalizeEquipmentAttributeLines(
      value.additionalPrimaryAttributes,
      STORED_EQUIPMENT_PRIMARY_ATTRIBUTE_SET,
      2,
      fallback.additionalPrimaryAttributes,
    ),
    tempering: normalizeEquipmentAttributeLine(
      value.tempering,
      STORED_EQUIPMENT_PRIMARY_ATTRIBUTE_SET,
      fallback.tempering,
    ),
    affixes: isSeasonEquipmentSlot(slot)
      ? normalizeEquipmentAttributeLines(
          value.affixes,
          EQUIPMENT_ATTRIBUTE_SET,
          3,
          fallback.affixes,
        )
      : [],
    supportAttribute,
    blessing:
      typeof value.blessing === "boolean" ? value.blessing : fallback.blessing,
    growth: typeof value.growth === "boolean" ? value.growth : fallback.growth,
    gale: typeof value.gale === "boolean" ? value.gale : fallback.gale,
    affinityEffectAttribute,
    vitalityEffect:
      typeof value.vitalityEffect === "boolean"
        ? value.vitalityEffect
        : fallback.vitalityEffect,
    specialEffect:
      typeof value.specialEffect === "string"
        ? value.specialEffect
        : fallback.specialEffect,
    seasonEffectLevel,
    specialEffectAttribute,
    specialSkill:
      typeof value.specialSkill === "string"
        ? value.specialSkill
        : fallback.specialSkill,
  };
};

/** 校验并补齐缓存中的八件装备，兼容缺字段的旧数据。 */
export const normalizeEquipmentSet = (value: unknown): EquipmentSet | null => {
  if (!isRecord(value)) return null;

  const fallback = createInitialEquipmentSet();
  const equipment = Object.fromEntries(
    EQUIPMENT_SLOTS.map((slot) => [
      slot,
      normalizeEquipmentItem(value[slot], slot, fallback[slot]),
    ]),
  ) as EquipmentSet;

  const gemUseCounts = new Map<EquipmentGemType, number>();
  for (const slot of EQUIPMENT_SLOTS) {
    const gem = equipment[slot].gem;
    if (!gem) continue;

    const useCount = gemUseCounts.get(gem.type) ?? 0;
    if (useCount >= MAX_GEM_EQUIPMENT_COUNT) {
      equipment[slot] = { ...equipment[slot], gem: null };
      continue;
    }
    gemUseCounts.set(gem.type, useCount + 1);
  }

  return equipment;
};

export type EquipmentCalculatorState = {
  characterLevel: CharacterLevel;
  equipment: EquipmentSet;
};

export const createInitialEquipmentCalculatorState =
  (): EquipmentCalculatorState => ({
    characterLevel: DEFAULT_EQUIPMENT_CHARACTER_LEVEL,
    equipment: createInitialEquipmentSet(),
  });

/** 同步宝石与角色等级；已突破的额外一级会在新上限覆盖后转为普通等级。 */
export const clampEquipmentGemLevels = (
  equipment: EquipmentSet,
  characterLevel: number,
): EquipmentSet => {
  const levelLimit = getGemLevelLimit(characterLevel);

  return Object.fromEntries(
    EQUIPMENT_SLOTS.map((slot) => {
      const item = equipment[slot];
      if (!item.gem) return [slot, item];

      const storedLevel = Math.max(1, Math.floor(item.gem.level));
      const effectiveLevel = Math.min(
        storedLevel + (item.gem.breakthrough ? 1 : 0),
        levelLimit + (item.gem.breakthrough ? 1 : 0),
      );
      const breakthrough = item.gem.breakthrough && effectiveLevel > levelLimit;
      const level = breakthrough ? levelLimit : effectiveLevel;

      return [
        slot,
        level !== item.gem.level || breakthrough !== item.gem.breakthrough
          ? { ...item, gem: { ...item.gem, level, breakthrough } }
          : item,
      ];
    }),
  ) as EquipmentSet;
};

export const normalizeEquipmentCalculatorState = (
  value: unknown,
): EquipmentCalculatorState | null => {
  if (!isRecord(value)) return null;

  const equipment = normalizeEquipmentSet(value.equipment);
  if (!equipment) return null;

  const characterLevel = normalizeCharacterLevel(value.characterLevel);

  return {
    characterLevel,
    equipment: clampEquipmentGemLevels(equipment, characterLevel),
  };
};

export type EquipmentSummary = {
  activeItemCount: number;
  allAttributes: EquipmentAttributeValues;
  gemAttributes: EquipmentAttributeValues;
  independentAffixAttributes: EquipmentAttributeValues;
  characterBonuses: CharacterAttributeBonuses;
};

const addValues = (
  target: EquipmentAttributeValues,
  source: EquipmentAttributeValues,
) => {
  for (const [attribute, value] of Object.entries(source) as [
    EquipmentAttribute,
    number,
  ][]) {
    target[attribute] = (target[attribute] ?? 0) + value;
  }
};

/** 汇总单件装备，并执行当前已知的固定值与百分比特效。 */
export const calculateEquipmentItemAttributes = (
  item: EquipmentItem,
  characterLevel = DEFAULT_EQUIPMENT_CHARACTER_LEVEL,
): EquipmentAttributeValues => {
  if (!item.enabled) return {};

  const attributes: EquipmentAttributeValues = {};
  const isSeasonEquipment = isSeasonEquipmentSlot(item.slot);
  const baseEquipmentEffects = new Set(
    getEffectiveBaseEquipmentEffectIds(item),
  );

  if (item.slot === "ring") {
    // 即使外部传入了多个职业属性，也只按一个合法的第二主属性计入。
    const secondaryAttribute = getRingSecondaryAttribute(item.baseAttributes);
    addValues(attributes, {
      health: item.baseAttributes.health ?? 0,
      [secondaryAttribute]: item.baseAttributes[secondaryAttribute] ?? 0,
    });
  } else if (item.slot === "necklace") {
    for (const line of getNecklaceBaseAttributeLines(item.baseAttributes)) {
      addValues(attributes, { [line.attribute]: line.value });
    }
  } else {
    addValues(attributes, item.baseAttributes);
  }

  const gemBonus = calculateEquipmentGemBonus(item, characterLevel);
  if (gemBonus) {
    addValues(attributes, { [gemBonus.attribute]: gemBonus.value });
  }

  const independentAffixBonus = calculateEquipmentIndependentAffixBonus(item);
  if (independentAffixBonus) {
    addValues(attributes, {
      [independentAffixBonus.attribute]: independentAffixBonus.value,
    });
  }

  const selectedPrimaryAttributes = new Set<PrimaryAttribute>();

  if (!isSeasonEquipment) {
    for (const primaryAttribute of item.additionalPrimaryAttributes) {
      if (selectedPrimaryAttributes.has(primaryAttribute.attribute)) continue;
      if (selectedPrimaryAttributes.size === 2) break;

      selectedPrimaryAttributes.add(primaryAttribute.attribute);
      addValues(attributes, {
        [primaryAttribute.attribute]: primaryAttribute.value,
      });
    }
  }

  addValues(attributes, { [item.tempering.attribute]: item.tempering.value });

  if (isSeasonEquipment) {
    const selectedAffixAttributes = new Set<EquipmentAttribute>();

    for (const affix of item.affixes.slice(0, 3)) {
      if (selectedAffixAttributes.has(affix.attribute)) continue;
      selectedAffixAttributes.add(affix.attribute);
      addValues(attributes, { [affix.attribute]: affix.value });
    }
  }

  if (
    !isSeasonEquipment &&
    baseEquipmentEffects.has("support") &&
    item.supportAttribute &&
    !selectedPrimaryAttributes.has(item.supportAttribute.attribute)
  ) {
    addValues(attributes, {
      [item.supportAttribute.attribute]: item.supportAttribute.value,
    });
  }

  if (baseEquipmentEffects.has("gale")) {
    addValues(attributes, { speedPercent: 3 });
  }

  if (baseEquipmentEffects.has("affinity") && item.affinityEffectAttribute) {
    addValues(attributes, {
      [item.affinityEffectAttribute]: EQUIPMENT_AFFINITY_EFFECT_VALUE,
    });
  }

  if (baseEquipmentEffects.has("vitality")) {
    addValues(attributes, {
      healthPercent: ACCESSORY_VITALITY_EFFECT_VALUE,
    });
  }

  const seasonEffect = getSeasonEquipmentEffectOption(item.specialEffect);
  if (isSeasonEquipment && seasonEffect && item.seasonEffectLevel > 0) {
    addValues(attributes, {
      [seasonEffect.attribute]:
        seasonEffect.valuePerLevel * item.seasonEffectLevel,
    });
  }

  if (
    !isSeasonEquipment &&
    item.specialEffectAttribute &&
    baseEquipmentEffects.has("custom")
  ) {
    addValues(attributes, {
      [item.specialEffectAttribute.attribute]:
        item.specialEffectAttribute.value,
    });
  }

  return attributes;
};

/** 将八件装备汇总为装备总览，并提取角色面板计算器能够识别的字段。 */
export const calculateEquipmentSummary = (
  equipment: EquipmentSet,
  characterLevel = DEFAULT_EQUIPMENT_CHARACTER_LEVEL,
): EquipmentSummary => {
  const allAttributes: EquipmentAttributeValues = {};
  const gemAttributes: EquipmentAttributeValues = {};
  const independentAffixAttributes: EquipmentAttributeValues = {};
  let activeItemCount = 0;

  for (const slot of EQUIPMENT_SLOTS) {
    const item = equipment[slot];

    if (item.enabled) {
      activeItemCount += 1;
      const gemBonus = calculateEquipmentGemBonus(item, characterLevel);
      if (gemBonus) {
        addValues(gemAttributes, { [gemBonus.attribute]: gemBonus.value });
      }
      const independentAffixBonus =
        calculateEquipmentIndependentAffixBonus(item);
      if (independentAffixBonus) {
        addValues(independentAffixAttributes, {
          [independentAffixBonus.attribute]: independentAffixBonus.value,
        });
      }
    }
    addValues(
      allAttributes,
      calculateEquipmentItemAttributes(item, characterLevel),
    );
  }

  const characterBonuses = createEmptyCharacterAttributeBonuses();
  const characterAttributeSet = new Set<CharacterBonusAttribute>(
    CHARACTER_BONUS_ATTRIBUTE_KEYS,
  );

  for (const [attribute, value] of Object.entries(allAttributes) as [
    EquipmentAttribute,
    number,
  ][]) {
    if (characterAttributeSet.has(attribute as CharacterBonusAttribute)) {
      characterBonuses[attribute as CharacterBonusAttribute] = value;
    }
  }

  return {
    activeItemCount,
    allAttributes,
    gemAttributes,
    independentAffixAttributes,
    characterBonuses,
  };
};
