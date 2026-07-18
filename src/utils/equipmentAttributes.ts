import {
  AFFINITY_BONUS_FIELDS,
  CHARACTER_BONUS_ATTRIBUTE_KEYS,
  createEmptyCharacterAttributeBonuses,
} from "./characterAttributes";
import type {
  CharacterAffinityBonusAttribute,
  CharacterAttributeBonuses,
  CharacterBonusAttribute,
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
  slot: EquipmentSlot
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
  | "magicalDamageReduction";

export type EquipmentAttribute =
  | CharacterBonusAttribute
  | EquipmentOnlyAttribute;

export const EQUIPMENT_PRIMARY_ATTRIBUTES = [
  "constitution",
  "spirit",
  "strength",
  "endurance",
  "agility",
] as const satisfies readonly PrimaryAttribute[];

const EQUIPMENT_PRIMARY_ATTRIBUTE_SET = new Set<EquipmentAttribute>(
  EQUIPMENT_PRIMARY_ATTRIBUTES
);

const isEquipmentPrimaryAttribute = (
  attribute: EquipmentAttribute
): attribute is PrimaryAttribute =>
  EQUIPMENT_PRIMARY_ATTRIBUTE_SET.has(attribute);

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
  { attribute: "healingPower", label: "治疗" },
  { attribute: "physicalDamageResult", label: "物伤结果" },
  { attribute: "magicalDamageResult", label: "法伤结果" },
  { attribute: "physicalDamageReduction", label: "物伤减免" },
  { attribute: "magicalDamageReduction", label: "法伤减免" },
] as const satisfies readonly {
  attribute: EquipmentAttribute;
  label: string;
}[];

export const EQUIPMENT_NON_PRIMARY_ATTRIBUTE_OPTIONS =
  EQUIPMENT_ATTRIBUTE_OPTIONS.filter(
    ({ attribute }) => !isEquipmentPrimaryAttribute(attribute)
  );

export const EQUIPMENT_AFFINITY_EFFECT_OPTIONS = AFFINITY_BONUS_FIELDS;
export const EQUIPMENT_AFFINITY_EFFECT_VALUE = 3;
export const ACCESSORY_VITALITY_EFFECT_VALUE = 5;
export type EquipmentAffinityEffectAttribute =
  CharacterAffinityBonusAttribute;

export const EQUIPMENT_ATTRIBUTE_LABELS = Object.fromEntries(
  [
    ...EQUIPMENT_ATTRIBUTE_OPTIONS,
    ...EQUIPMENT_AFFINITY_EFFECT_OPTIONS,
    { attribute: "healthPercent", label: "气血" },
    { attribute: "speedPercent", label: "速度" },
  ].map(({ attribute, label }) => [attribute, label])
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
  attributes: EquipmentAttributeValues
): RingSecondaryAttribute =>
  RING_SECONDARY_ATTRIBUTE_OPTIONS.find(
    ({ attribute }) => attributes[attribute] !== undefined
  )?.attribute ?? "physicalAttack";

/** 项链从气血、物防、法防中取两条不重复的装备属性。 */
export const getNecklaceBaseAttributeLines = (
  attributes: EquipmentAttributeValues
): EquipmentAttributeLine[] => {
  const allowedAttributes = new Set<EquipmentAttribute>(
    NECKLACE_BASE_ATTRIBUTE_OPTIONS.map(({ attribute }) => attribute)
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

export type EquipmentItem = {
  slot: EquipmentSlot;
  enabled: boolean;
  level: number;
  baseAttributes: EquipmentAttributeValues;
  castingAttributes: EquipmentAttributeValues;
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
  item: EquipmentItem
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
  ]
    .filter((effect): effect is BaseEquipmentEffectId => effect !== null);
};

/** 返回真正生效的基础装备特效，统一执行最多两个的规则。 */
export const getEffectiveBaseEquipmentEffectIds = (
  item: EquipmentItem
): BaseEquipmentEffectId[] =>
  getBaseEquipmentEffectIds(item).slice(0, BASE_EQUIPMENT_EFFECT_LIMIT);

export const canEnableBaseEquipmentEffect = (
  item: EquipmentItem,
  effect: BaseEquipmentEffectId
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
    return [
      "赛年神装",
      item.specialEffect
        ? `${item.specialEffect}${
            item.seasonEffectLevel > 0
              ? ` · ${item.seasonEffectLevel}级`
              : ""
          }`
        : null,
    ].filter((effect): effect is string => effect !== null);
  }

  const effects = new Set(getEffectiveBaseEquipmentEffectIds(item));
  return [
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
    effects.has("custom")
      ? item.specialEffect || "其它属性特效"
      : null,
    item.specialSkill || null,
  ].filter((effect): effect is string => effect !== null);
};

export type EquipmentSet = Record<EquipmentSlot, EquipmentItem>;

const createItem = (
  slot: EquipmentSlot,
  changes: Partial<Omit<EquipmentItem, "slot">> = {}
): EquipmentItem => ({
  slot,
  enabled: true,
  level: 60,
  baseAttributes: {},
  castingAttributes: {},
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
      physicalAttack: 657,
      magicAttack: 200,
      healingPower: 161,
    },
    castingAttributes: {
      physicalAttack: 57,
      magicAttack: 16,
      healingPower: 28,
    },
    additionalPrimaryAttributes: [
      { attribute: "strength", value: 33 },
      { attribute: "agility", value: 32 },
    ],
    tempering: { attribute: "constitution", value: 25 },
    blessing: true,
  }),
  armor: createItem("armor", {
    baseAttributes: { health: 379, physicalDefense: 146 },
    castingAttributes: { health: 184, physicalDefense: 24 },
    tempering: { attribute: "strength", value: 28 },
    supportAttribute: { attribute: "endurance", value: 38 },
  }),
  headgear: createItem("headgear", {
    baseAttributes: { mana: 1415, physicalDefense: 102 },
    castingAttributes: { mana: 405, physicalDefense: 31 },
    tempering: { attribute: "strength", value: 31 },
    supportAttribute: { attribute: "strength", value: 39 },
  }),
  lowerGarment: createItem("lowerGarment", {
    baseAttributes: { health: 620, magicDefense: 56 },
    castingAttributes: { health: 196, magicDefense: 27 },
    tempering: { attribute: "strength", value: 27 },
    supportAttribute: { attribute: "agility", value: 33 },
    specialSkill: "四面楚歌",
  }),
  accessory: createItem("accessory", {
    baseAttributes: { magicAttack: 99, magicDefense: 105 },
    castingAttributes: { magicAttack: 23, magicDefense: 28 },
    tempering: { attribute: "strength", value: 30 },
    supportAttribute: { attribute: "strength", value: 34 },
  }),
  shoes: createItem("shoes", {
    baseAttributes: { physicalDefense: 51, speed: 101 },
    castingAttributes: { physicalDefense: 29, speed: 37 },
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

export type EquipmentSummary = {
  activeItemCount: number;
  allAttributes: EquipmentAttributeValues;
  characterBonuses: CharacterAttributeBonuses;
};

const addValues = (
  target: EquipmentAttributeValues,
  source: EquipmentAttributeValues
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
  item: EquipmentItem
): EquipmentAttributeValues => {
  if (!item.enabled) return {};

  const attributes: EquipmentAttributeValues = {};
  const isSeasonEquipment = isSeasonEquipmentSlot(item.slot);
  const baseEquipmentEffects = new Set(
    getEffectiveBaseEquipmentEffectIds(item)
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

  if (!isSeasonEquipment) {
    addValues(attributes, item.castingAttributes);
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

  const selectedAffixAttributes = new Set<EquipmentAttribute>();

  for (const affix of item.affixes.slice(0, 3)) {
    // 五维只能来自上面的 1～2 条附加属性、百炼、加持或明确的特效。
    if (
      !isSeasonEquipment &&
      isEquipmentPrimaryAttribute(affix.attribute)
    ) {
      continue;
    }
    if (
      isSeasonEquipment &&
      selectedAffixAttributes.has(affix.attribute)
    ) {
      continue;
    }
    selectedAffixAttributes.add(affix.attribute);
    addValues(attributes, { [affix.attribute]: affix.value });
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

  if (
    baseEquipmentEffects.has("affinity") &&
    item.affinityEffectAttribute
  ) {
    addValues(attributes, {
      [item.affinityEffectAttribute]: EQUIPMENT_AFFINITY_EFFECT_VALUE,
    });
  }

  if (baseEquipmentEffects.has("vitality")) {
    addValues(attributes, {
      healthPercent: ACCESSORY_VITALITY_EFFECT_VALUE,
    });
  }

  if (
    item.specialEffectAttribute &&
    (isSeasonEquipment || baseEquipmentEffects.has("custom"))
  ) {
    addValues(attributes, {
      [item.specialEffectAttribute.attribute]: item.specialEffectAttribute.value,
    });
  }

  return attributes;
};

/** 将八件装备汇总为装备总览，并提取角色属性计算器能够识别的字段。 */
export const calculateEquipmentSummary = (
  equipment: EquipmentSet
): EquipmentSummary => {
  const allAttributes: EquipmentAttributeValues = {};
  let activeItemCount = 0;

  for (const slot of EQUIPMENT_SLOTS) {
    const item = equipment[slot];

    if (item.enabled) activeItemCount += 1;
    addValues(allAttributes, calculateEquipmentItemAttributes(item));
  }

  const characterBonuses = createEmptyCharacterAttributeBonuses();
  const characterAttributeSet = new Set<CharacterBonusAttribute>(
    CHARACTER_BONUS_ATTRIBUTE_KEYS
  );

  for (const [attribute, value] of Object.entries(allAttributes) as [
    EquipmentAttribute,
    number,
  ][]) {
    if (characterAttributeSet.has(attribute as CharacterBonusAttribute)) {
      characterBonuses[attribute as CharacterBonusAttribute] = value;
    }
  }

  return { activeItemCount, allAttributes, characterBonuses };
};
