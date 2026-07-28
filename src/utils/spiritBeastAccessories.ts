import {
  SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES,
  type SpiritBeastEquipmentPanelAttribute,
} from "./spiritBeastEquipment";

export const SPIRIT_BEAST_ACCESSORY_TIERS = [
  {
    id: "tierOne",
    label: "1阶灵饰",
    qualificationBonus: 10,
  },
  {
    id: "tierTwo",
    label: "2阶灵饰",
    qualificationBonus: 20,
  },
] as const;

export type SpiritBeastAccessoryTier =
  (typeof SPIRIT_BEAST_ACCESSORY_TIERS)[number]["id"];
export type SpiritBeastAccessoryAttribute = SpiritBeastEquipmentPanelAttribute;

export type SpiritBeastAccessoryItem = {
  enabled: boolean;
  attribute: SpiritBeastAccessoryAttribute;
  value: number;
};

export type SpiritBeastAccessories = Record<
  SpiritBeastAccessoryTier,
  SpiritBeastAccessoryItem
>;

export type SpiritBeastAccessoryBonuses = {
  qualification: number;
  panelAttributes: Record<SpiritBeastAccessoryAttribute, number>;
};

const ACCESSORY_ATTRIBUTE_SET = new Set<string>(
  SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES,
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeValue = (value: unknown): number => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? Math.min(999999, Math.max(0, parsed)) : 0;
};

export const createEmptySpiritBeastAccessories =
  (): SpiritBeastAccessories => ({
    tierOne: {
      enabled: false,
      attribute: "physicalAttack",
      value: 0,
    },
    tierTwo: {
      enabled: false,
      attribute: "physicalAttack",
      value: 0,
    },
  });

const normalizeAccessoryItem = (
  value: unknown,
  fallback: SpiritBeastAccessoryItem,
): SpiritBeastAccessoryItem => {
  if (!isRecord(value)) return { ...fallback };

  return {
    enabled: value.enabled === true,
    attribute:
      typeof value.attribute === "string" &&
      ACCESSORY_ATTRIBUTE_SET.has(value.attribute)
        ? (value.attribute as SpiritBeastAccessoryAttribute)
        : fallback.attribute,
    value: normalizeValue(value.value),
  };
};

/** 校验两件灵饰的原始配置；旧缓存缺少字段时默认均不计入。 */
export const normalizeSpiritBeastAccessories = (
  value: unknown,
): SpiritBeastAccessories => {
  const fallback = createEmptySpiritBeastAccessories();
  const source = isRecord(value) ? value : {};

  return {
    tierOne: normalizeAccessoryItem(source.tierOne, fallback.tierOne),
    tierTwo: normalizeAccessoryItem(source.tierTwo, fallback.tierTwo),
  };
};

/** 汇总已启用灵饰的固定全资质和随机面板属性。 */
export const calculateSpiritBeastAccessoryBonuses = (
  accessories: SpiritBeastAccessories,
): SpiritBeastAccessoryBonuses => {
  const panelAttributes = Object.fromEntries(
    SPIRIT_BEAST_EQUIPMENT_PANEL_ATTRIBUTES.map((attribute) => [attribute, 0]),
  ) as Record<SpiritBeastAccessoryAttribute, number>;
  let qualification = 0;

  for (const tier of SPIRIT_BEAST_ACCESSORY_TIERS) {
    const accessory = accessories[tier.id];
    if (!accessory.enabled) continue;

    qualification += tier.qualificationBonus;
    panelAttributes[accessory.attribute] += accessory.value;
  }

  return { qualification, panelAttributes };
};
