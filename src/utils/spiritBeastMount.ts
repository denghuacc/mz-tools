export const SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTES = [
  "health",
  "mana",
  "physicalAttack",
  "magicalAttack",
  "physicalDefense",
  "magicalDefense",
  "speed",
] as const;

export type SpiritBeastMountFixedAttribute =
  (typeof SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTES)[number];

export type SpiritBeastMountFixedAttributeLine = {
  attribute: SpiritBeastMountFixedAttribute;
  value: number;
};

export type SpiritBeastMountSpeedSkill = {
  enabled: boolean;
  percentage: number;
};

export type SpiritBeastMountConfig = {
  fixedAttributes: readonly SpiritBeastMountFixedAttributeLine[];
  gale: SpiritBeastMountSpeedSkill;
  slownessSpell: SpiritBeastMountSpeedSkill;
};

export const SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTE_MAX_COUNT = 2;
export const SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MIN = 1;
export const SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MAX = 10;
export const SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MIN = 2;
export const SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MAX = 20;
export const SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_STEP = 2;

export type SpiritBeastMountFixedBonuses = Record<
  SpiritBeastMountFixedAttribute,
  number
>;

const MOUNT_FIXED_ATTRIBUTE_SET = new Set<string>(
  SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTES,
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeNumber = (
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

const normalizeSpeedSkill = (
  value: unknown,
  minimum: number,
  maximum: number,
  step: number,
): SpiritBeastMountSpeedSkill => {
  const source = isRecord(value) ? value : {};
  const percentage = normalizeNumber(
    source.percentage,
    minimum,
    maximum,
    minimum,
  );

  return {
    enabled: source.enabled === true,
    percentage: minimum + Math.floor((percentage - minimum) / step) * step,
  };
};

export const createEmptySpiritBeastMountConfig =
  (): SpiritBeastMountConfig => ({
    fixedAttributes: [],
    gale: {
      enabled: false,
      percentage: SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MIN,
    },
    slownessSpell: {
      enabled: false,
      percentage: SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MIN,
    },
  });

/** 校验坐骑统御配置；固定属性最多保留两条且同一属性只保留一次。 */
export const normalizeSpiritBeastMountConfig = (
  value: unknown,
): SpiritBeastMountConfig => {
  const source = isRecord(value) ? value : {};
  const fixedAttributes: SpiritBeastMountFixedAttributeLine[] = [];

  if (Array.isArray(source.fixedAttributes)) {
    for (const candidate of source.fixedAttributes) {
      if (!isRecord(candidate)) continue;
      if (
        typeof candidate.attribute !== "string" ||
        !MOUNT_FIXED_ATTRIBUTE_SET.has(candidate.attribute) ||
        fixedAttributes.some(
          ({ attribute }) => attribute === candidate.attribute,
        )
      ) {
        continue;
      }

      fixedAttributes.push({
        attribute: candidate.attribute as SpiritBeastMountFixedAttribute,
        value: normalizeNumber(candidate.value, 0, 999999, 0),
      });
      if (
        fixedAttributes.length === SPIRIT_BEAST_MOUNT_FIXED_ATTRIBUTE_MAX_COUNT
      ) {
        break;
      }
    }
  }

  return {
    fixedAttributes,
    gale: normalizeSpeedSkill(
      source.gale,
      SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MIN,
      SPIRIT_BEAST_MOUNT_GALE_PERCENTAGE_MAX,
      1,
    ),
    slownessSpell: normalizeSpeedSkill(
      source.slownessSpell,
      SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MIN,
      SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_MAX,
      SPIRIT_BEAST_MOUNT_SLOWNESS_PERCENTAGE_STEP,
    ),
  };
};

export const calculateSpiritBeastMountFixedBonuses = (
  mount: SpiritBeastMountConfig,
): SpiritBeastMountFixedBonuses => {
  const bonuses: SpiritBeastMountFixedBonuses = {
    health: 0,
    mana: 0,
    physicalAttack: 0,
    magicalAttack: 0,
    physicalDefense: 0,
    magicalDefense: 0,
    speed: 0,
  };

  mount.fixedAttributes.forEach(({ attribute, value }) => {
    bonuses[attribute] += value;
  });

  return bonuses;
};

/** 疾风与迟钝术同时启用时按同一份技能结算前速度加减，不做顺序乘算。 */
export const calculateSpiritBeastMountSpeedBonus = (
  mount: SpiritBeastMountConfig,
  baseSpeed: number,
): number => {
  const galePercentage = mount.gale.enabled ? mount.gale.percentage : 0;
  const slownessPercentage = mount.slownessSpell.enabled
    ? mount.slownessSpell.percentage
    : 0;

  return (baseSpeed * (galePercentage - slownessPercentage)) / 100;
};

export const countConfiguredSpiritBeastMountSkills = (
  mount: SpiritBeastMountConfig,
): number => Number(mount.gale.enabled) + Number(mount.slownessSpell.enabled);
