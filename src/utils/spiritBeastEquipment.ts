import type { PrimaryAttribute } from "./characterAttributes";
import { SEASON_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS } from "./equipmentAttributes";
import type { SeasonEquipmentSecondaryAttribute } from "./equipmentAttributes";

export const SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES = [
  "physicalAttack",
  "magicalAttack",
  "physicalDefense",
  "magicalDefense",
  "speed",
  "health",
] as const;

export type SpiritBeastEquipmentPanelAttribute =
  (typeof SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES)[number];
export type SpiritBeastEquipmentSecondaryAttribute =
  | SpiritBeastEquipmentPanelAttribute
  | PrimaryAttribute
  | "mana"
  | "physicalDamageResult"
  | "magicalDamageResult"
  | "physicalDamageReduction"
  | "magicalDamageReduction"
  | "criticalDamagePercent";

export const SPIRIT_BEAST_UNAVAILABLE_SEASON_EQUIPMENT_SECONDARY_ATTRIBUTES = [
  "healingPower",
  "sealHit",
  "sealResistance",
  "dodgeRate",
] as const satisfies readonly SeasonEquipmentSecondaryAttribute[];

type SpiritBeastUnavailableSeasonEquipmentSecondaryAttribute =
  (typeof SPIRIT_BEAST_UNAVAILABLE_SEASON_EQUIPMENT_SECONDARY_ATTRIBUTES)[number];
type SpiritBeastAvailableSeasonEquipmentSecondaryAttribute = Exclude<
  SeasonEquipmentSecondaryAttribute,
  SpiritBeastUnavailableSeasonEquipmentSecondaryAttribute
>;

const UNAVAILABLE_SECONDARY_ATTRIBUTE_SET = new Set<string>(
  SPIRIT_BEAST_UNAVAILABLE_SEASON_EQUIPMENT_SECONDARY_ATTRIBUTES,
);
const isSpiritBeastSecondaryAttribute = (
  attribute: SeasonEquipmentSecondaryAttribute,
): attribute is SpiritBeastAvailableSeasonEquipmentSecondaryAttribute =>
  !UNAVAILABLE_SECONDARY_ATTRIBUTE_SET.has(attribute);

const SEASON_ATTRIBUTE_TO_SPIRIT_BEAST_ATTRIBUTE = {
  constitution: "constitution",
  spirit: "spirit",
  strength: "strength",
  endurance: "endurance",
  agility: "agility",
  health: "health",
  mana: "mana",
  physicalAttack: "physicalAttack",
  magicAttack: "magicalAttack",
  physicalDefense: "physicalDefense",
  magicDefense: "magicalDefense",
  speed: "speed",
  physicalDamageResult: "physicalDamageResult",
  magicalDamageResult: "magicalDamageResult",
  physicalDamageReduction: "physicalDamageReduction",
  magicalDamageReduction: "magicalDamageReduction",
} as const satisfies Record<
  SpiritBeastAvailableSeasonEquipmentSecondaryAttribute,
  SpiritBeastEquipmentSecondaryAttribute
>;

export type SpiritBeastEquipmentSecondaryAttributeOption = {
  attribute: SpiritBeastEquipmentSecondaryAttribute;
  label: string;
  unit?: "%";
};

const toSpiritBeastSecondaryAttributeOption = ({
  attribute,
  label,
}: (typeof SEASON_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS)[number]): SpiritBeastEquipmentSecondaryAttributeOption | null => {
  if (!isSpiritBeastSecondaryAttribute(attribute)) return null;

  return {
    attribute: SEASON_ATTRIBUTE_TO_SPIRIT_BEAST_ATTRIBUTE[attribute],
    label,
  };
};

const SHARED_SEASON_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS =
  SEASON_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS.map(
    toSpiritBeastSecondaryAttributeOption,
  ).filter(
    (option): option is SpiritBeastEquipmentSecondaryAttributeOption =>
      option !== null,
  );

export const SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS: readonly SpiritBeastEquipmentSecondaryAttributeOption[] =
  [
    ...SHARED_SEASON_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS,
    {
      attribute: "criticalDamagePercent",
      label: "暴击伤害（%）",
      unit: "%",
    },
  ];

export const SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTES =
  SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTE_OPTIONS.map(
    ({ attribute }) => attribute,
  );
export type SpiritBeastEquipmentBonusAttribute =
  | SpiritBeastEquipmentSecondaryAttribute
  | PrimaryAttribute;

export type SpiritBeastEquipmentAttributeLine<
  Attribute extends SpiritBeastEquipmentBonusAttribute =
    SpiritBeastEquipmentBonusAttribute,
> = {
  attribute: Attribute;
  value: number;
};

export type SpiritBeastEquipmentPrimaryLine =
  SpiritBeastEquipmentAttributeLine<PrimaryAttribute>;
export type SpiritBeastEquipmentPanelLine =
  SpiritBeastEquipmentAttributeLine<SpiritBeastEquipmentPanelAttribute>;
export type SpiritBeastEquipmentSecondaryLine =
  SpiritBeastEquipmentAttributeLine<SpiritBeastEquipmentSecondaryAttribute>;

export type SpiritBeastEquipmentSet = {
  garment: {
    enabled: boolean;
    baseAttributes: readonly [
      SpiritBeastEquipmentPanelLine,
      SpiritBeastEquipmentPanelLine,
    ];
    enlightenmentAttributes: readonly SpiritBeastEquipmentPrimaryLine[];
  };
  necklace: {
    enabled: boolean;
    enlightenmentAttributes: readonly SpiritBeastEquipmentPrimaryLine[];
  };
  crown: {
    enabled: boolean;
    baseAttributes: readonly [
      SpiritBeastEquipmentPanelLine,
      SpiritBeastEquipmentPanelLine,
    ];
    secondaryAttributes: readonly SpiritBeastEquipmentSecondaryLine[];
    temperingAttribute: SpiritBeastEquipmentPrimaryLine;
    specialEffectName: string;
    specialEffectAdjustments: readonly SpiritBeastEquipmentPrimaryLine[];
  };
};

export type SpiritBeastEquipmentBonuses = Record<
  SpiritBeastEquipmentBonusAttribute,
  number
>;

const SPIRIT_BEAST_EQUIPMENT_PRIMARY_ATTRIBUTES = [
  "constitution",
  "spirit",
  "strength",
  "endurance",
  "agility",
] as const satisfies readonly PrimaryAttribute[];

const PANEL_ATTRIBUTE_SET = new Set<string>(
  SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES,
);
const SECONDARY_ATTRIBUTE_SET = new Set<string>(
  SPIRIT_BEAST_EQUIPMENT_SECONDARY_ATTRIBUTES,
);
const PRIMARY_ATTRIBUTE_SET = new Set<string>(
  SPIRIT_BEAST_EQUIPMENT_PRIMARY_ATTRIBUTES,
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeNumber = (value: unknown, allowNegative: boolean): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) return 0;

  return Math.min(999999, Math.max(allowNegative ? -999999 : 0, parsed));
};

const normalizeLines = <Attribute extends SpiritBeastEquipmentBonusAttribute>(
  value: unknown,
  allowedAttributes: ReadonlySet<string>,
  maximumLineCount: number,
  fallback: readonly SpiritBeastEquipmentAttributeLine<Attribute>[],
  allowNegative: boolean,
): readonly SpiritBeastEquipmentAttributeLine<Attribute>[] => {
  if (!Array.isArray(value)) return fallback.map((line) => ({ ...line }));

  const lines: SpiritBeastEquipmentAttributeLine<Attribute>[] = [];
  for (const candidate of value) {
    if (!isRecord(candidate)) continue;
    if (
      typeof candidate.attribute !== "string" ||
      !allowedAttributes.has(candidate.attribute) ||
      lines.some((line) => line.attribute === candidate.attribute)
    ) {
      continue;
    }

    lines.push({
      attribute: candidate.attribute as Attribute,
      value: normalizeNumber(candidate.value, allowNegative),
    });
    if (lines.length === maximumLineCount) break;
  }

  return lines.length > 0 ? lines : fallback.map((line) => ({ ...line }));
};

const normalizeFixedPanelLines = (
  value: unknown,
  fallback: readonly [
    SpiritBeastEquipmentPanelLine,
    SpiritBeastEquipmentPanelLine,
  ],
): readonly [SpiritBeastEquipmentPanelLine, SpiritBeastEquipmentPanelLine] => {
  const lines = [
    ...normalizeLines(value, PANEL_ATTRIBUTE_SET, 2, fallback, false),
  ];

  for (const attribute of SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES) {
    if (lines.length === 2) break;
    if (lines.some((line) => line.attribute === attribute)) continue;
    lines.push({ attribute, value: 0 });
  }

  return [lines[0] ?? { ...fallback[0] }, lines[1] ?? { ...fallback[1] }];
};

const normalizePrimaryLine = (
  value: unknown,
  fallback: SpiritBeastEquipmentPrimaryLine,
): SpiritBeastEquipmentPrimaryLine => {
  if (
    !isRecord(value) ||
    typeof value.attribute !== "string" ||
    !PRIMARY_ATTRIBUTE_SET.has(value.attribute)
  ) {
    return { ...fallback };
  }

  return {
    attribute: value.attribute as PrimaryAttribute,
    value: normalizeNumber(value.value, false),
  };
};

export const createEmptySpiritBeastEquipmentSet =
  (): SpiritBeastEquipmentSet => ({
    garment: {
      enabled: true,
      baseAttributes: [
        { attribute: "physicalAttack", value: 0 },
        { attribute: "magicalAttack", value: 0 },
      ],
      enlightenmentAttributes: [{ attribute: "constitution", value: 0 }],
    },
    necklace: {
      enabled: true,
      enlightenmentAttributes: [{ attribute: "strength", value: 0 }],
    },
    crown: {
      enabled: true,
      baseAttributes: [
        { attribute: "physicalDefense", value: 0 },
        { attribute: "magicalDefense", value: 0 },
      ],
      secondaryAttributes: [{ attribute: "physicalAttack", value: 0 }],
      temperingAttribute: { attribute: "agility", value: 0 },
      specialEffectName: "",
      specialEffectAdjustments: [{ attribute: "spirit", value: 0 }],
    },
  });

/** 校验并补齐三件灵兽装备，兼容旧缓存缺少整个装备配置。 */
export const normalizeSpiritBeastEquipmentSet = (
  value: unknown,
): SpiritBeastEquipmentSet => {
  const fallback = createEmptySpiritBeastEquipmentSet();
  if (!isRecord(value)) return fallback;

  const garment = isRecord(value.garment) ? value.garment : {};
  const necklace = isRecord(value.necklace) ? value.necklace : {};
  const crown = isRecord(value.crown) ? value.crown : {};

  return {
    garment: {
      enabled:
        typeof garment.enabled === "boolean"
          ? garment.enabled
          : fallback.garment.enabled,
      baseAttributes: normalizeFixedPanelLines(
        garment.baseAttributes,
        fallback.garment.baseAttributes,
      ),
      enlightenmentAttributes: normalizeLines(
        garment.enlightenmentAttributes,
        PRIMARY_ATTRIBUTE_SET,
        2,
        fallback.garment.enlightenmentAttributes,
        true,
      ),
    },
    necklace: {
      enabled:
        typeof necklace.enabled === "boolean"
          ? necklace.enabled
          : fallback.necklace.enabled,
      enlightenmentAttributes: normalizeLines(
        necklace.enlightenmentAttributes,
        PRIMARY_ATTRIBUTE_SET,
        2,
        fallback.necklace.enlightenmentAttributes,
        true,
      ),
    },
    crown: {
      enabled:
        typeof crown.enabled === "boolean"
          ? crown.enabled
          : fallback.crown.enabled,
      baseAttributes: normalizeFixedPanelLines(
        crown.baseAttributes,
        fallback.crown.baseAttributes,
      ),
      secondaryAttributes: normalizeLines(
        crown.secondaryAttributes,
        SECONDARY_ATTRIBUTE_SET,
        3,
        fallback.crown.secondaryAttributes,
        false,
      ),
      temperingAttribute: normalizePrimaryLine(
        crown.temperingAttribute,
        fallback.crown.temperingAttribute,
      ),
      specialEffectName:
        typeof crown.specialEffectName === "string"
          ? crown.specialEffectName.slice(0, 40)
          : fallback.crown.specialEffectName,
      specialEffectAdjustments: normalizeLines(
        crown.specialEffectAdjustments,
        PRIMARY_ATTRIBUTE_SET,
        2,
        fallback.crown.specialEffectAdjustments,
        true,
      ),
    },
  };
};

export const createEmptySpiritBeastEquipmentBonuses =
  (): SpiritBeastEquipmentBonuses => ({
    physicalAttack: 0,
    magicalAttack: 0,
    physicalDefense: 0,
    magicalDefense: 0,
    speed: 0,
    health: 0,
    mana: 0,
    physicalDamageResult: 0,
    magicalDamageResult: 0,
    physicalDamageReduction: 0,
    magicalDamageReduction: 0,
    criticalDamagePercent: 0,
    constitution: 0,
    spirit: 0,
    strength: 0,
    endurance: 0,
    agility: 0,
  });

const addLines = (
  bonuses: SpiritBeastEquipmentBonuses,
  lines: readonly SpiritBeastEquipmentAttributeLine[],
) => {
  for (const line of lines) {
    bonuses[line.attribute] += line.value;
  }
};

/** 按三件装备的开关汇总原始词条，不把汇总结果写入本地存储。 */
export const calculateSpiritBeastEquipmentBonuses = (
  equipment: SpiritBeastEquipmentSet,
): SpiritBeastEquipmentBonuses => {
  const bonuses = createEmptySpiritBeastEquipmentBonuses();

  if (equipment.garment.enabled) {
    addLines(bonuses, equipment.garment.baseAttributes);
    addLines(bonuses, equipment.garment.enlightenmentAttributes);
  }

  if (equipment.necklace.enabled) {
    addLines(bonuses, equipment.necklace.enlightenmentAttributes);
  }

  if (equipment.crown.enabled) {
    addLines(bonuses, equipment.crown.baseAttributes);
    addLines(bonuses, equipment.crown.secondaryAttributes);
    addLines(bonuses, [equipment.crown.temperingAttribute]);
    addLines(bonuses, equipment.crown.specialEffectAdjustments);
  }

  return bonuses;
};
