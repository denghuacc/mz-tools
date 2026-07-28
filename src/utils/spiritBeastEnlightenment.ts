import type {
  SpiritBeastPrimaryAttribute,
  SpiritBeastPrimaryAttributes,
  SpiritBeastQualification,
  SpiritBeastQualifications,
} from "./spiritBeastAttributes";

export const SPIRIT_BEAST_ENLIGHTENMENT_STARS = [1, 2, 3, 4, 5] as const;

export type SpiritBeastEnlightenmentStar =
  | 0
  | (typeof SPIRIT_BEAST_ENLIGHTENMENT_STARS)[number];

export type SpiritBeastEnlightenmentQualificationLine = {
  qualification: SpiritBeastQualification;
  value: number;
};

export type SpiritBeastEnlightenmentPrimaryLine = {
  attribute: SpiritBeastPrimaryAttribute;
  value: number;
};

export type SpiritBeastEnlightenment = {
  star: SpiritBeastEnlightenmentStar;
  qualificationBonuses: readonly SpiritBeastEnlightenmentQualificationLine[];
  primaryBonuses: readonly SpiritBeastEnlightenmentPrimaryLine[];
};

export type SpiritBeastEnlightenmentBonuses = {
  qualifications: SpiritBeastQualifications;
  primary: SpiritBeastPrimaryAttributes;
};

export const SPIRIT_BEAST_ENLIGHTENMENT_QUALIFICATION_COUNT = 2;

const QUALIFICATIONS = [
  "physicalAttack",
  "physicalDefense",
  "health",
  "spirit",
  "speed",
] as const satisfies readonly SpiritBeastQualification[];

const PRIMARY_ATTRIBUTES = [
  "constitution",
  "spirit",
  "strength",
  "endurance",
  "agility",
] as const satisfies readonly SpiritBeastPrimaryAttribute[];

const QUALIFICATION_SET = new Set<string>(QUALIFICATIONS);
const PRIMARY_ATTRIBUTE_SET = new Set<string>(PRIMARY_ATTRIBUTES);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeInteger = (
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
    ? Math.min(maximum, Math.max(minimum, Math.floor(parsed)))
    : fallback;
};

export const getSpiritBeastEnlightenmentPrimaryCount = (
  star: SpiritBeastEnlightenmentStar,
): number => (star === 0 ? 0 : Math.ceil(star / 2));

/**
 * 截图规则：1～3 星词条上限分别为 5、10、15；
 * 4～5 星首条上限为 20，其余词条上限为 15。
 */
export const getSpiritBeastEnlightenmentPrimaryValueMaximum = (
  star: SpiritBeastEnlightenmentStar,
  lineIndex: number,
): number => {
  if (star === 0) return 0;
  if (star === 1) return 5;
  if (star === 2) return 10;
  if (star === 3 || lineIndex > 0) return 15;
  return 20;
};

export const createEmptySpiritBeastEnlightenment =
  (): SpiritBeastEnlightenment => ({
    star: 0,
    qualificationBonuses: [],
    primaryBonuses: [],
  });

/** 兼容旧缓存，并收紧星级、词条数量、重复属性和截图已知的五维范围。 */
export const normalizeSpiritBeastEnlightenment = (
  value: unknown,
): SpiritBeastEnlightenment => {
  const source = isRecord(value) ? value : {};
  const star = normalizeInteger(
    source.star,
    0,
    5,
    0,
  ) as SpiritBeastEnlightenmentStar;

  if (star === 0) return createEmptySpiritBeastEnlightenment();

  const qualificationBonuses: SpiritBeastEnlightenmentQualificationLine[] = [];
  if (Array.isArray(source.qualificationBonuses)) {
    for (const candidate of source.qualificationBonuses) {
      if (!isRecord(candidate)) continue;
      if (
        typeof candidate.qualification !== "string" ||
        !QUALIFICATION_SET.has(candidate.qualification) ||
        qualificationBonuses.some(
          ({ qualification }) => qualification === candidate.qualification,
        )
      ) {
        continue;
      }

      qualificationBonuses.push({
        qualification: candidate.qualification as SpiritBeastQualification,
        value: normalizeInteger(candidate.value, 0, 9999, 0),
      });
      if (
        qualificationBonuses.length ===
        SPIRIT_BEAST_ENLIGHTENMENT_QUALIFICATION_COUNT
      ) {
        break;
      }
    }
  }

  const primaryBonuses: SpiritBeastEnlightenmentPrimaryLine[] = [];
  const primaryCount = getSpiritBeastEnlightenmentPrimaryCount(star);
  if (Array.isArray(source.primaryBonuses)) {
    for (const candidate of source.primaryBonuses) {
      if (!isRecord(candidate)) continue;
      if (
        typeof candidate.attribute !== "string" ||
        !PRIMARY_ATTRIBUTE_SET.has(candidate.attribute) ||
        primaryBonuses.some(
          ({ attribute }) => attribute === candidate.attribute,
        )
      ) {
        continue;
      }

      primaryBonuses.push({
        attribute: candidate.attribute as SpiritBeastPrimaryAttribute,
        value: normalizeInteger(
          candidate.value,
          0,
          getSpiritBeastEnlightenmentPrimaryValueMaximum(
            star,
            primaryBonuses.length,
          ),
          0,
        ),
      });
      if (primaryBonuses.length === primaryCount) break;
    }
  }

  return {
    star,
    qualificationBonuses,
    primaryBonuses,
  };
};

export const getSpiritBeastEnlightenmentValidationError = (
  enlightenment: SpiritBeastEnlightenment,
): string | null => {
  if (enlightenment.star === 0) return null;
  if (
    enlightenment.qualificationBonuses.length !==
    SPIRIT_BEAST_ENLIGHTENMENT_QUALIFICATION_COUNT
  ) {
    return "仙府点化必须选择 2 项不同资质。";
  }
  if (enlightenment.qualificationBonuses.some(({ value }) => value < 1)) {
    return "两项资质加成都必须录入大于 0 的实际点数。";
  }

  const primaryCount = getSpiritBeastEnlightenmentPrimaryCount(
    enlightenment.star,
  );
  if (enlightenment.primaryBonuses.length !== primaryCount) {
    return `${enlightenment.star} 星点化必须选择 ${primaryCount} 条五维属性。`;
  }
  if (
    enlightenment.primaryBonuses.some(
      ({ value }, lineIndex) =>
        value < 1 ||
        value >
          getSpiritBeastEnlightenmentPrimaryValueMaximum(
            enlightenment.star,
            lineIndex,
          ),
    )
  ) {
    return "五维属性数值超出当前星级范围。";
  }

  return null;
};

export const calculateSpiritBeastEnlightenmentBonuses = (
  enlightenment: SpiritBeastEnlightenment,
): SpiritBeastEnlightenmentBonuses => {
  const qualifications: SpiritBeastQualifications = {
    physicalAttack: 0,
    physicalDefense: 0,
    health: 0,
    spirit: 0,
    speed: 0,
  };
  const primary: SpiritBeastPrimaryAttributes = {
    constitution: 0,
    spirit: 0,
    strength: 0,
    endurance: 0,
    agility: 0,
  };

  enlightenment.qualificationBonuses.forEach(({ qualification, value }) => {
    qualifications[qualification] += value;
  });
  enlightenment.primaryBonuses.forEach(({ attribute, value }) => {
    primary[attribute] += value;
  });

  return { qualifications, primary };
};
