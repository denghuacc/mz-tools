export const SPIRIT_BEAST_SKILL_GRADES = [
  "none",
  "normal",
  "advanced",
] as const;

export type SpiritBeastSkillGrade = (typeof SPIRIT_BEAST_SKILL_GRADES)[number];

export type SpiritBeastSkillSelection = {
  normal: boolean;
  advanced: boolean;
};

export const SPIRIT_BEAST_AFFINITY_SKILL_IDS = [
  "fireAffinity",
  "waterAffinity",
  "electricAffinity",
  "poisonAffinity",
  "iceAffinity",
  "windAffinity",
] as const;

export type SpiritBeastAffinitySkillId =
  (typeof SPIRIT_BEAST_AFFINITY_SKILL_IDS)[number];

export const SPIRIT_BEAST_CORE_SKILL_IDS = [
  "magicalPower",
  "swiftness",
  "slowness",
  "robustness",
  "luckyStar",
] as const;

export type SpiritBeastCoreSkillId =
  (typeof SPIRIT_BEAST_CORE_SKILL_IDS)[number];

export type SpiritBeastSkills = Record<
  SpiritBeastCoreSkillId,
  SpiritBeastSkillSelection
> & {
  affinities: Record<SpiritBeastAffinitySkillId, SpiritBeastSkillSelection>;
};

export type SpiritBeastSkillCalculationBase = {
  spirit: number;
  health: number;
  speed: number;
};

export type SpiritBeastSkillEffects = {
  magicalAttack: number;
  health: number;
  speed: number;
  affinities: Record<SpiritBeastAffinitySkillId, number>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const createEmptySkillSelection = (): SpiritBeastSkillSelection => ({
  normal: false,
  advanced: false,
});

const normalizeSkillSelection = (value: unknown): SpiritBeastSkillSelection => {
  if (value === "normal") return { normal: true, advanced: false };
  if (value === "advanced") return { normal: false, advanced: true };

  const source = isRecord(value) ? value : {};
  return {
    normal: source.normal === true,
    advanced: source.advanced === true,
  };
};

export const getEffectiveSpiritBeastSkillGrade = (
  selection: SpiritBeastSkillSelection,
): SpiritBeastSkillGrade => {
  if (selection.advanced) return "advanced";
  if (selection.normal) return "normal";
  return "none";
};

const getGradeValue = (
  grade: SpiritBeastSkillGrade,
  normalValue: number,
  advancedValue: number,
): number => {
  if (grade === "normal") return normalValue;
  if (grade === "advanced") return advancedValue;
  return 0;
};

export const createEmptySpiritBeastSkills = (): SpiritBeastSkills => ({
  magicalPower: createEmptySkillSelection(),
  swiftness: createEmptySkillSelection(),
  slowness: createEmptySkillSelection(),
  robustness: createEmptySkillSelection(),
  luckyStar: createEmptySkillSelection(),
  affinities: {
    fireAffinity: createEmptySkillSelection(),
    waterAffinity: createEmptySkillSelection(),
    electricAffinity: createEmptySkillSelection(),
    poisonAffinity: createEmptySkillSelection(),
    iceAffinity: createEmptySkillSelection(),
    windAffinity: createEmptySkillSelection(),
  },
});

/** 校验结构化技能配置；旧缓存缺少字段时补为未携带。 */
export const normalizeSpiritBeastSkills = (
  value: unknown,
): SpiritBeastSkills => {
  const source = isRecord(value) ? value : {};
  const affinitySource = isRecord(source.affinities) ? source.affinities : {};

  return {
    magicalPower: normalizeSkillSelection(source.magicalPower),
    swiftness: normalizeSkillSelection(source.swiftness),
    slowness: normalizeSkillSelection(source.slowness),
    robustness: normalizeSkillSelection(source.robustness),
    luckyStar: normalizeSkillSelection(source.luckyStar),
    affinities: Object.fromEntries(
      SPIRIT_BEAST_AFFINITY_SKILL_IDS.map((affinity) => [
        affinity,
        normalizeSkillSelection(affinitySource[affinity]),
      ]),
    ) as SpiritBeastSkills["affinities"],
  };
};

/**
 * 百分比技能按进入技能结算前的精确面板值计算；同名技能同时存在时高级覆盖低级。
 * 健壮与吉星、迅捷与迟钝分别按百分比加减后一次性叠加。
 */
export const calculateSpiritBeastSkillEffects = (
  skills: SpiritBeastSkills,
  base: SpiritBeastSkillCalculationBase,
): SpiritBeastSkillEffects => {
  const healthRatio =
    getGradeValue(
      getEffectiveSpiritBeastSkillGrade(skills.robustness),
      0.15,
      0.25,
    ) +
    getGradeValue(
      getEffectiveSpiritBeastSkillGrade(skills.luckyStar),
      0.05,
      0.1,
    );
  const speedRatio =
    getGradeValue(
      getEffectiveSpiritBeastSkillGrade(skills.swiftness),
      0.1,
      0.2,
    ) -
    getGradeValue(getEffectiveSpiritBeastSkillGrade(skills.slowness), 0.1, 0.2);

  return {
    magicalAttack:
      base.spirit *
      getGradeValue(
        getEffectiveSpiritBeastSkillGrade(skills.magicalPower),
        0.06,
        0.1,
      ),
    health: base.health * healthRatio,
    speed: base.speed * speedRatio,
    affinities: Object.fromEntries(
      SPIRIT_BEAST_AFFINITY_SKILL_IDS.map((affinity) => [
        affinity,
        getGradeValue(
          getEffectiveSpiritBeastSkillGrade(skills.affinities[affinity]),
          15,
          25,
        ),
      ]),
    ) as SpiritBeastSkillEffects["affinities"],
  };
};

export const countConfiguredSpiritBeastSkills = (
  skills: SpiritBeastSkills,
): number =>
  SPIRIT_BEAST_CORE_SKILL_IDS.reduce(
    (total, skillId) =>
      total + Number(skills[skillId].normal) + Number(skills[skillId].advanced),
    0,
  ) +
  SPIRIT_BEAST_AFFINITY_SKILL_IDS.reduce(
    (total, affinity) =>
      total +
      Number(skills.affinities[affinity].normal) +
      Number(skills.affinities[affinity].advanced),
    0,
  );
