export const SPIRIT_BEAST_DESTINY_SKILL_SLOT_COUNT = 6;

export const SPIRIT_BEAST_DESTINY_SKILL_LEVELS = [1, 2, 3, 4, 5] as const;

export type SpiritBeastDestinySkillLevel =
  (typeof SPIRIT_BEAST_DESTINY_SKILL_LEVELS)[number];

export const SPIRIT_BEAST_DESTINY_BIRTH_SKILLS = [
  "none",
  "divineCalculation",
] as const;

export type SpiritBeastDestinyBirthSkill =
  (typeof SPIRIT_BEAST_DESTINY_BIRTH_SKILLS)[number];

export const SPIRIT_BEAST_DESTINY_SKILL_ATTRIBUTES = [
  "health",
  "mana",
  "physicalAttack",
  "magicalAttack",
  "physicalDefense",
  "magicalDefense",
  "speed",
] as const;

export type SpiritBeastDestinySkillAttribute =
  (typeof SPIRIT_BEAST_DESTINY_SKILL_ATTRIBUTES)[number];

type DestinySkillValues = readonly [number, number, number, number, number];

export type SpiritBeastDestinySkillOption = {
  attribute: SpiritBeastDestinySkillAttribute;
  label: string;
  normalValues: DestinySkillValues;
  mutatedValues: DestinySkillValues;
};

/** 用户截图中的命技 1～5 级固定面板值，当前均标记为待复核资料。 */
export const SPIRIT_BEAST_DESTINY_SKILL_OPTIONS = [
  {
    attribute: "health",
    label: "气血",
    normalValues: [30, 50, 70, 90, 110],
    mutatedValues: [40, 70, 100, 130, 160],
  },
  {
    attribute: "mana",
    label: "法力",
    normalValues: [45, 75, 105, 135, 165],
    mutatedValues: [60, 105, 150, 195, 240],
  },
  {
    attribute: "physicalAttack",
    label: "物攻",
    normalValues: [9, 15, 21, 27, 33],
    mutatedValues: [12, 21, 30, 39, 48],
  },
  {
    attribute: "magicalAttack",
    label: "法攻",
    normalValues: [7, 12, 17, 22, 27],
    mutatedValues: [9, 17, 24, 32, 39],
  },
  {
    attribute: "physicalDefense",
    label: "物防",
    normalValues: [9, 15, 21, 27, 33],
    mutatedValues: [12, 21, 30, 39, 48],
  },
  {
    attribute: "magicalDefense",
    label: "法防",
    normalValues: [7, 12, 17, 22, 27],
    mutatedValues: [9, 17, 24, 32, 39],
  },
  {
    attribute: "speed",
    label: "速度",
    normalValues: [3, 5, 7, 9, 11],
    mutatedValues: [4, 7, 10, 13, 16],
  },
] as const satisfies readonly SpiritBeastDestinySkillOption[];

export type SpiritBeastDestinySkill = {
  attribute: SpiritBeastDestinySkillAttribute | null;
  level: SpiritBeastDestinySkillLevel;
  isMutated: boolean;
};

export type SpiritBeastDestiny = {
  birthSkill: SpiritBeastDestinyBirthSkill;
  skills: SpiritBeastDestinySkill[];
};

export type SpiritBeastDestinyBonuses = Record<
  SpiritBeastDestinySkillAttribute,
  number
>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isDestinySkillAttribute = (
  value: unknown,
): value is SpiritBeastDestinySkillAttribute =>
  SPIRIT_BEAST_DESTINY_SKILL_ATTRIBUTES.some(
    (attribute) => attribute === value,
  );

const normalizeLevel = (value: unknown): SpiritBeastDestinySkillLevel => {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;
  const level = Number.isFinite(parsed) ? Math.floor(parsed) : 1;

  return Math.min(5, Math.max(1, level)) as SpiritBeastDestinySkillLevel;
};

export const createEmptySpiritBeastDestinySkill =
  (): SpiritBeastDestinySkill => ({
    attribute: null,
    level: 1,
    isMutated: false,
  });

export const createEmptySpiritBeastDestiny = (): SpiritBeastDestiny => ({
  birthSkill: "none",
  skills: [],
});

/**
 * 校验命格原始配置，并清除后出现的同属性重复命技。
 * 普通和变异命技共用属性唯一约束。
 */
export const normalizeSpiritBeastDestiny = (
  value: unknown,
): SpiritBeastDestiny => {
  const source = isRecord(value) ? value : {};
  const skillSource = Array.isArray(source.skills) ? source.skills : [];
  const usedAttributes = new Set<SpiritBeastDestinySkillAttribute>();
  const skills: SpiritBeastDestinySkill[] = [];

  skillSource
    .slice(0, SPIRIT_BEAST_DESTINY_SKILL_SLOT_COUNT)
    .forEach((value) => {
      if (!isRecord(value)) return;
      if (!isDestinySkillAttribute(value.attribute)) return;
      if (usedAttributes.has(value.attribute)) return;

      usedAttributes.add(value.attribute);
      skills.push({
        attribute: value.attribute,
        level: normalizeLevel(value.level),
        isMutated: value.isMutated === true,
      });
    });

  return {
    birthSkill:
      source.birthSkill === "divineCalculation" ? "divineCalculation" : "none",
    skills,
  };
};

/** 返回单条命技当前等级和品质对应的固定面板值。 */
export const getSpiritBeastDestinySkillValue = (
  skill: SpiritBeastDestinySkill,
): number => {
  if (!skill.attribute) return 0;

  const option = SPIRIT_BEAST_DESTINY_SKILL_OPTIONS.find(
    ({ attribute }) => attribute === skill.attribute,
  );
  if (!option) return 0;

  const values = skill.isMutated ? option.mutatedValues : option.normalValues;
  return values[skill.level - 1];
};

/**
 * 汇总命格面板值。本命技“被动·神机妙算”按灵兽等级每级减少 1 点速度。
 */
export const calculateSpiritBeastDestinyBonuses = (
  destiny: SpiritBeastDestiny,
  spiritBeastLevel: number,
): SpiritBeastDestinyBonuses => {
  const bonuses: SpiritBeastDestinyBonuses = {
    health: 0,
    mana: 0,
    physicalAttack: 0,
    magicalAttack: 0,
    physicalDefense: 0,
    magicalDefense: 0,
    speed:
      destiny.birthSkill === "divineCalculation"
        ? -Math.max(0, Math.floor(spiritBeastLevel))
        : 0,
  };

  destiny.skills.forEach((skill) => {
    if (!skill.attribute) return;
    bonuses[skill.attribute] += getSpiritBeastDestinySkillValue(skill);
  });

  return bonuses;
};

export const countConfiguredSpiritBeastDestinySkills = (
  destiny: SpiritBeastDestiny,
): number =>
  destiny.skills.filter(({ attribute }) => attribute !== null).length;
