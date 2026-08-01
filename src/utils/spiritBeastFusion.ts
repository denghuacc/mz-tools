import {
  SPIRIT_BEAST_GROWTH_MAX,
  SPIRIT_BEAST_GROWTH_MIN,
  SPIRIT_BEAST_QUALIFICATION_MAX,
  SPIRIT_BEAST_QUALIFICATION_MIN,
  SPIRIT_BEAST_QUALIFICATIONS,
} from "./spiritBeastAttributes";
import type {
  SpiritBeastQualification,
  SpiritBeastQualifications,
} from "./spiritBeastAttributes";
import { SPIRIT_BEAST_FUSION_STORAGE_KEY } from "./calculatorStorage";

export { SPIRIT_BEAST_FUSION_STORAGE_KEY };
export const FUSION_QUALIFICATION_UPPER_RATE = 1.035;
export const FUSION_GROWTH_UPPER_BONUS = 0.042;
export const FUSION_INITIAL_ATTRIBUTE_MIN = 100;
export const FUSION_INITIAL_ATTRIBUTE_MAX = 135;
export const FUSION_SKILL_MIN_PER_BEAST = 4;
export const FUSION_SKILL_MAX_PER_BEAST = 6;
export const FUSION_SKILL_TOTAL_MIN = 8;
export const FUSION_SKILL_TOTAL_MAX = 12;
export const FUSION_SPECIAL_SKILL_MAX = 2;
export const FUSION_PILLS_PER_ATTEMPT = 3;
export const FUSION_SILVER_PER_PILL = 5_000;
export const FUSION_SILVER_PER_ATTEMPT =
  FUSION_PILLS_PER_ATTEMPT * FUSION_SILVER_PER_PILL;
export const FUSION_PITY_WITHOUT_FRUIT = 240;
export const FUSION_PITY_WITH_FRUIT = 80;
export const FUSION_DOUBLE_SPECIAL_PITY = 4;
export const FUSION_RECORD_LIMIT = 10;

export type FusionStrategy = "without-fruit" | "with-fruit";

export type FusionSpecialSkillType = "active" | "passive";

export type FusionSkill = {
  id: string;
  name: string;
  isSpecial: boolean;
  specialType: FusionSpecialSkillType | null;
};

export type FusionBeast = {
  name: string;
  qualifications: SpiritBeastQualifications;
  growth: number;
  skills: readonly FusionSkill[];
};

export type FusionParents = {
  main: FusionBeast;
  secondary: FusionBeast;
};

export type FusionPityProgress = {
  withoutFruit: number;
  withFruit: number;
  fullDoubleSpecial: number;
};

export type FusionTarget = {
  requireFullSkills: boolean;
  requireDoubleSpecial: boolean;
  minimumQualifications: SpiritBeastQualifications;
  minimumGrowth: number;
};

export type FusionProbabilities = {
  fullSkills: number;
  doubleSpecial: number;
};

export type FusionQualificationRange = {
  minimum: number;
  maximum: number;
};

export type FusionPreview = {
  qualificationRanges: Record<
    SpiritBeastQualification,
    FusionQualificationRange
  >;
  growthRange: FusionQualificationRange;
  initialAttributeRange: FusionQualificationRange;
  minimumSkillCount: number;
  maximumSkillCount: number;
  specialSkillPoolCount: number;
};

export type FusionResult = {
  qualifications: SpiritBeastQualifications;
  qualificationBreakthroughs: Record<SpiritBeastQualification, boolean>;
  growth: number;
  initialAttributeTotal: number;
  skills: readonly FusionSkill[];
  skillCount: number;
  specialSkillCount: number;
  isFullSkills: boolean;
  isDoubleSpecial: boolean;
};

export type FusionCost = {
  attempts: number;
  pills: number;
  silver: number;
  fruits: number;
};

export type FusionAttempt = {
  result: FusionResult;
  pity: FusionPityProgress;
  cost: FusionCost;
};

export type FusionRun = {
  result: FusionResult;
  pity: FusionPityProgress;
  cost: FusionCost;
  reachedTarget: boolean;
};

export type FusionAnalysis = {
  sampleCount: number;
  completedSampleCount: number;
  averageAttempts: number;
  medianAttempts: number;
  percentile90Attempts: number;
  maximumAttempts: number;
  averageCost: FusionCost;
  skillPityMaximumAttempts: number | null;
  hasNonGuaranteedAttributeTarget: boolean;
};

export type FusionRecord = {
  id: string;
  createdAt: number;
  mainName: string;
  secondaryName: string;
  result: FusionResult;
};

export type SpiritBeastFusionState = {
  parents: FusionParents;
  strategy: FusionStrategy;
  probabilities: FusionProbabilities;
  pity: FusionPityProgress;
  target: FusionTarget;
  records: readonly FusionRecord[];
};

type RandomSource = () => number;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const clampInteger = (value: unknown, minimum: number, maximum: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return minimum;

  return clamp(Math.round(value), minimum, maximum);
};

const clampNumber = (value: unknown, minimum: number, maximum: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return minimum;

  return clamp(value, minimum, maximum);
};

const roundGrowth = (value: number) => Math.round(value * 1_000) / 1_000;

const getFusionSkillSortRank = (skill: FusionSkill) => {
  if (!skill.isSpecial) return 1;

  return skill.specialType === "passive" ? 2 : 0;
};

/** 融合结果固定按主动特殊、普通、被动特殊排列。 */
export const sortFusionSkills = (
  skills: readonly FusionSkill[],
): readonly FusionSkill[] =>
  [...skills].sort(
    (first, second) =>
      getFusionSkillSortRank(first) - getFusionSkillSortRank(second),
  );

/** 统一生成融合技能的用户可见名称。 */
export const formatFusionSkillLabel = (skill: FusionSkill) => {
  if (!skill.isSpecial) return skill.name;

  return `${skill.specialType === "passive" ? "被动特" : "主动特"} · ${skill.name}`;
};

const createDefaultQualifications = (): SpiritBeastQualifications => ({
  physicalAttack: 1_500,
  physicalDefense: 1_500,
  health: 1_500,
  spirit: 1_500,
  speed: 1_500,
});

const createEmptyQualificationTargets = (): SpiritBeastQualifications => ({
  physicalAttack: 0,
  physicalDefense: 0,
  health: 0,
  spirit: 0,
  speed: 0,
});

const createEmptyQualificationBreakthroughs = (): Record<
  SpiritBeastQualification,
  boolean
> => ({
  physicalAttack: false,
  physicalDefense: false,
  health: false,
  spirit: false,
  speed: false,
});

const createDefaultBeast = (name: string): FusionBeast => ({
  name,
  qualifications: createDefaultQualifications(),
  growth: 1.2,
  skills: [],
});

export const createDefaultSpiritBeastFusionState =
  (): SpiritBeastFusionState => ({
    parents: {
      main: createDefaultBeast("主宠"),
      secondary: createDefaultBeast("副宠"),
    },
    strategy: "without-fruit",
    probabilities: {
      fullSkills: 0.01,
      doubleSpecial: 0.1,
    },
    pity: {
      withoutFruit: 0,
      withFruit: 0,
      fullDoubleSpecial: 0,
    },
    target: {
      requireFullSkills: true,
      requireDoubleSpecial: false,
      minimumQualifications: createEmptyQualificationTargets(),
      minimumGrowth: 0,
    },
    records: [],
  });

const normalizeQualifications = (
  value: unknown,
  fallback: SpiritBeastQualifications,
): SpiritBeastQualifications => {
  if (!isRecord(value)) return { ...fallback };

  return Object.fromEntries(
    SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => [
      qualification,
      clampInteger(
        typeof value[qualification] === "number"
          ? value[qualification]
          : fallback[qualification],
        SPIRIT_BEAST_QUALIFICATION_MIN,
        SPIRIT_BEAST_QUALIFICATION_MAX,
      ),
    ]),
  ) as SpiritBeastQualifications;
};

const normalizeMinimumQualifications = (
  value: unknown,
): SpiritBeastQualifications => {
  if (!isRecord(value)) return createEmptyQualificationTargets();

  return Object.fromEntries(
    SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => [
      qualification,
      clampInteger(value[qualification], 0, 2_000),
    ]),
  ) as SpiritBeastQualifications;
};

const normalizeResultQualifications = (
  value: unknown,
): SpiritBeastQualifications => {
  if (!isRecord(value)) return createDefaultQualifications();

  return Object.fromEntries(
    SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => [
      qualification,
      clampInteger(value[qualification], 0, 2_000),
    ]),
  ) as SpiritBeastQualifications;
};

const normalizeQualificationBreakthroughs = (
  value: unknown,
): Record<SpiritBeastQualification, boolean> => {
  if (!isRecord(value)) return createEmptyQualificationBreakthroughs();

  return Object.fromEntries(
    SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => [
      qualification,
      value[qualification] === true,
    ]),
  ) as Record<SpiritBeastQualification, boolean>;
};

const normalizeSkill = (
  value: unknown,
  fallbackId: string,
): FusionSkill | null => {
  if (!isRecord(value) || typeof value.name !== "string") return null;

  const name = value.name.trim().slice(0, 20);
  if (!name) return null;

  const isSpecial = value.isSpecial === true;

  return {
    id:
      typeof value.id === "string" && value.id
        ? value.id.slice(0, 80)
        : fallbackId,
    name,
    isSpecial,
    specialType: isSpecial
      ? value.specialType === "passive"
        ? "passive"
        : "active"
      : null,
  };
};

const normalizeBeast = (value: unknown, fallback: FusionBeast): FusionBeast => {
  if (!isRecord(value)) return fallback;

  const skills = Array.isArray(value.skills)
    ? value.skills
        .slice(0, FUSION_SKILL_MAX_PER_BEAST)
        .map((skill, index) =>
          normalizeSkill(skill, `${fallback.name}-skill-${index}`),
        )
        .filter((skill): skill is FusionSkill => skill !== null)
    : [];

  return {
    name:
      typeof value.name === "string"
        ? value.name.trim().slice(0, 20) || fallback.name
        : fallback.name,
    qualifications: normalizeQualifications(
      value.qualifications,
      fallback.qualifications,
    ),
    growth: roundGrowth(
      clampNumber(
        typeof value.growth === "number" ? value.growth : fallback.growth,
        SPIRIT_BEAST_GROWTH_MIN,
        SPIRIT_BEAST_GROWTH_MAX,
      ),
    ),
    skills,
  };
};

const normalizeResult = (value: unknown): FusionResult | null => {
  if (!isRecord(value)) return null;

  const skills = sortFusionSkills(
    Array.isArray(value.skills)
      ? value.skills
          .slice(0, 7)
          .map((skill, index) => normalizeSkill(skill, `result-skill-${index}`))
          .filter((skill): skill is FusionSkill => skill !== null)
      : [],
  );
  const specialSkillCount = skills.filter((skill) => skill.isSpecial).length;

  return {
    qualifications: normalizeResultQualifications(value.qualifications),
    qualificationBreakthroughs: normalizeQualificationBreakthroughs(
      value.qualificationBreakthroughs,
    ),
    growth: roundGrowth(clampNumber(value.growth, 1, 1.6)),
    initialAttributeTotal: clampInteger(
      value.initialAttributeTotal,
      FUSION_INITIAL_ATTRIBUTE_MIN,
      FUSION_INITIAL_ATTRIBUTE_MAX,
    ),
    skills,
    skillCount: skills.length,
    specialSkillCount,
    isFullSkills: value.isFullSkills === true,
    isDoubleSpecial: specialSkillCount >= FUSION_SPECIAL_SKILL_MAX,
  };
};

const normalizeFusionRecord = (
  value: unknown,
  index: number,
): FusionRecord | null => {
  if (!isRecord(value)) return null;

  const result = normalizeResult(value.result);
  if (!result) return null;

  return {
    id:
      typeof value.id === "string" && value.id
        ? value.id.slice(0, 80)
        : `fusion-record-${index}`,
    createdAt:
      typeof value.createdAt === "number" && Number.isFinite(value.createdAt)
        ? value.createdAt
        : 0,
    mainName:
      typeof value.mainName === "string"
        ? value.mainName.trim().slice(0, 20) || "主宠"
        : "主宠",
    secondaryName:
      typeof value.secondaryName === "string"
        ? value.secondaryName.trim().slice(0, 20) || "副宠"
        : "副宠",
    result,
  };
};

/** 校验融合模拟器的高输入量表单和保底进度，损坏缓存安全回退。 */
export const normalizeSpiritBeastFusionState = (
  value: unknown,
): SpiritBeastFusionState | null => {
  if (!isRecord(value)) return null;

  const fallback = createDefaultSpiritBeastFusionState();
  const parents = isRecord(value.parents) ? value.parents : {};
  const probabilities = isRecord(value.probabilities)
    ? value.probabilities
    : {};
  const pity = isRecord(value.pity) ? value.pity : {};
  const target = isRecord(value.target) ? value.target : {};
  const records = Array.isArray(value.records)
    ? value.records
        .slice(0, FUSION_RECORD_LIMIT)
        .map(normalizeFusionRecord)
        .filter((record): record is FusionRecord => record !== null)
    : [];

  return {
    parents: {
      main: normalizeBeast(parents.main, fallback.parents.main),
      secondary: normalizeBeast(parents.secondary, fallback.parents.secondary),
    },
    strategy: value.strategy === "with-fruit" ? "with-fruit" : "without-fruit",
    probabilities: {
      fullSkills: clampNumber(
        typeof probabilities.fullSkills === "number"
          ? probabilities.fullSkills
          : fallback.probabilities.fullSkills,
        0,
        1,
      ),
      doubleSpecial: clampNumber(
        typeof probabilities.doubleSpecial === "number"
          ? probabilities.doubleSpecial
          : fallback.probabilities.doubleSpecial,
        0,
        1,
      ),
    },
    pity: {
      withoutFruit: clampInteger(
        pity.withoutFruit,
        0,
        FUSION_PITY_WITHOUT_FRUIT - 1,
      ),
      withFruit: clampInteger(pity.withFruit, 0, FUSION_PITY_WITH_FRUIT - 1),
      fullDoubleSpecial: clampInteger(
        pity.fullDoubleSpecial,
        0,
        FUSION_DOUBLE_SPECIAL_PITY - 1,
      ),
    },
    target: {
      requireFullSkills: target.requireFullSkills !== false,
      requireDoubleSpecial: target.requireDoubleSpecial === true,
      minimumQualifications: normalizeMinimumQualifications(
        target.minimumQualifications,
      ),
      minimumGrowth: roundGrowth(clampNumber(target.minimumGrowth, 0, 1.6)),
    },
    records,
  };
};

export const getFusionMaximumSkillCount = (totalSkillCount: number) => {
  if (totalSkillCount <= 9) return 5;
  if (totalSkillCount <= 11) return 6;

  return 7;
};

export const getFusionPityLimit = (strategy: FusionStrategy) =>
  strategy === "with-fruit"
    ? FUSION_PITY_WITH_FRUIT
    : FUSION_PITY_WITHOUT_FRUIT;

export const getSelectedFusionPity = (
  strategy: FusionStrategy,
  pity: FusionPityProgress,
) => (strategy === "with-fruit" ? pity.withFruit : pity.withoutFruit);

const getFusionSkillPool = (parents: FusionParents) => {
  const seenNames = new Set<string>();

  return [...parents.main.skills, ...parents.secondary.skills].filter(
    (skill) => {
      const normalizedName = skill.name.trim().toLocaleLowerCase();
      if (!normalizedName || seenNames.has(normalizedName)) return false;

      seenNames.add(normalizedName);
      return true;
    },
  );
};

export const calculateFusionPreview = (
  parents: FusionParents,
): FusionPreview => {
  const qualificationRanges = Object.fromEntries(
    SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => {
      const mainValue = parents.main.qualifications[qualification];
      const secondaryValue = parents.secondary.qualifications[qualification];

      return [
        qualification,
        {
          minimum: Math.min(mainValue, secondaryValue),
          maximum: Math.round(
            Math.max(mainValue, secondaryValue) *
              FUSION_QUALIFICATION_UPPER_RATE,
          ),
        },
      ];
    }),
  ) as FusionPreview["qualificationRanges"];
  const totalSkillCount =
    parents.main.skills.length + parents.secondary.skills.length;
  const skillPool = getFusionSkillPool(parents);

  return {
    qualificationRanges,
    growthRange: {
      minimum: Math.min(parents.main.growth, parents.secondary.growth),
      maximum: roundGrowth(
        Math.max(parents.main.growth, parents.secondary.growth) +
          FUSION_GROWTH_UPPER_BONUS,
      ),
    },
    initialAttributeRange: {
      minimum: FUSION_INITIAL_ATTRIBUTE_MIN,
      maximum: FUSION_INITIAL_ATTRIBUTE_MAX,
    },
    minimumSkillCount: Math.min(
      parents.main.skills.length,
      parents.secondary.skills.length,
    ),
    maximumSkillCount: getFusionMaximumSkillCount(totalSkillCount),
    specialSkillPoolCount: skillPool.filter((skill) => skill.isSpecial).length,
  };
};

export const getFusionConfigurationError = (
  state: Pick<SpiritBeastFusionState, "parents" | "target">,
): string | null => {
  const { main, secondary } = state.parents;
  const totalSkillCount = main.skills.length + secondary.skills.length;
  const preview = calculateFusionPreview(state.parents);
  const skillPool = getFusionSkillPool(state.parents);
  const distinctSkillCount = skillPool.length;
  const normalSkillCount = skillPool.filter((skill) => !skill.isSpecial).length;
  const specialSkillCount = skillPool.length - normalSkillCount;

  if (
    main.skills.length < FUSION_SKILL_MIN_PER_BEAST ||
    secondary.skills.length < FUSION_SKILL_MIN_PER_BEAST
  ) {
    return `主宠和副宠都至少需要录入 ${FUSION_SKILL_MIN_PER_BEAST} 个自身技能。`;
  }

  if (
    main.skills.length > FUSION_SKILL_MAX_PER_BEAST ||
    secondary.skills.length > FUSION_SKILL_MAX_PER_BEAST
  ) {
    return `每只灵兽最多录入 ${FUSION_SKILL_MAX_PER_BEAST} 个自身技能。`;
  }

  if (
    totalSkillCount < FUSION_SKILL_TOTAL_MIN ||
    totalSkillCount > FUSION_SKILL_TOTAL_MAX
  ) {
    return `主副宠自身技能之和需要在 ${FUSION_SKILL_TOTAL_MIN}～${FUSION_SKILL_TOTAL_MAX} 个之间。`;
  }

  if (distinctSkillCount < preview.maximumSkillCount) {
    return "去除主副宠的同名技能后，候选技能不足以生成满技能结果。";
  }

  if (
    normalSkillCount + Math.min(specialSkillCount, 1) <
    preview.maximumSkillCount
  ) {
    return "普通技能不足，无法生成不超过 1 个特殊技能的满技能结果。";
  }

  if (
    state.target.requireDoubleSpecial &&
    preview.specialSkillPoolCount < FUSION_SPECIAL_SKILL_MAX
  ) {
    return "目标包含双特殊时，主副宠至少需要录入 2 个特殊技能。";
  }

  for (const qualification of SPIRIT_BEAST_QUALIFICATIONS) {
    if (
      state.target.minimumQualifications[qualification] >
      preview.qualificationRanges[qualification].maximum
    ) {
      return "目标资质不能高于当前融合预览上限。";
    }
  }

  if (state.target.minimumGrowth > preview.growthRange.maximum) {
    return "目标成长不能高于当前融合预览上限。";
  }

  return null;
};

const randomInteger = (
  minimum: number,
  maximum: number,
  random: RandomSource,
) => minimum + Math.floor(random() * (maximum - minimum + 1));

const shuffle = <T>(values: readonly T[], random: RandomSource): T[] => {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const selectFusionSkills = (
  parents: FusionParents,
  skillCount: number,
  isDoubleSpecial: boolean,
  random: RandomSource,
): readonly FusionSkill[] => {
  const pool = getFusionSkillPool(parents);
  const specialSkills = shuffle(
    pool.filter((skill) => skill.isSpecial),
    random,
  );
  const normalSkills = shuffle(
    pool.filter((skill) => !skill.isSpecial),
    random,
  );

  if (isDoubleSpecial) {
    return sortFusionSkills(
      shuffle(
        [
          ...specialSkills.slice(0, FUSION_SPECIAL_SKILL_MAX),
          ...normalSkills.slice(0, skillCount - FUSION_SPECIAL_SKILL_MAX),
        ],
        random,
      ).slice(0, skillCount),
    );
  }

  const needsSpecialSkill = normalSkills.length < skillCount;
  const optionalSpecial =
    specialSkills.length > 0 && (needsSpecialSkill || random() < 0.5)
      ? specialSkills.slice(0, 1)
      : [];

  return sortFusionSkills(
    shuffle(
      [
        ...optionalSpecial,
        ...normalSkills.slice(0, skillCount - optionalSpecial.length),
      ],
      random,
    ).slice(0, skillCount),
  );
};

export const calculateFusionCost = (
  attempts: number,
  strategy: FusionStrategy,
): FusionCost => ({
  attempts,
  pills: attempts * FUSION_PILLS_PER_ATTEMPT,
  silver: attempts * FUSION_SILVER_PER_ATTEMPT,
  fruits: strategy === "with-fruit" ? attempts : 0,
});

/** 执行一次融合；有果和无果保底分别累计，满技能双特殊按满技能结果累计。 */
export const simulateFusionAttempt = (
  state: Pick<
    SpiritBeastFusionState,
    "parents" | "strategy" | "probabilities" | "pity"
  >,
  random: RandomSource = Math.random,
): FusionAttempt => {
  const preview = calculateFusionPreview(state.parents);
  const pityLimit = getFusionPityLimit(state.strategy);
  const selectedPity = getSelectedFusionPity(state.strategy, state.pity);
  const isFullSkills =
    selectedPity + 1 >= pityLimit || random() < state.probabilities.fullSkills;
  const isEligibleForDoubleSpecial =
    preview.specialSkillPoolCount >= FUSION_SPECIAL_SKILL_MAX;
  const isDoubleSpecialPity =
    isFullSkills &&
    isEligibleForDoubleSpecial &&
    state.pity.fullDoubleSpecial + 1 >= FUSION_DOUBLE_SPECIAL_PITY;
  const isDoubleSpecial =
    isEligibleForDoubleSpecial &&
    (isDoubleSpecialPity || random() < state.probabilities.doubleSpecial);
  const skillCount = isFullSkills
    ? preview.maximumSkillCount
    : preview.minimumSkillCount;
  const qualifications = Object.fromEntries(
    SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => {
      const range = preview.qualificationRanges[qualification];
      return [
        qualification,
        randomInteger(range.minimum, range.maximum, random),
      ];
    }),
  ) as SpiritBeastQualifications;
  const qualificationBreakthroughs = Object.fromEntries(
    SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => [
      qualification,
      qualifications[qualification] >
        Math.max(
          state.parents.main.qualifications[qualification],
          state.parents.secondary.qualifications[qualification],
        ),
    ]),
  ) as Record<SpiritBeastQualification, boolean>;
  const growthStepCount = Math.round(
    (preview.growthRange.maximum - preview.growthRange.minimum) * 1_000,
  );
  const skills = selectFusionSkills(
    state.parents,
    skillCount,
    isDoubleSpecial,
    random,
  );
  const specialSkillCount = skills.filter((skill) => skill.isSpecial).length;
  const hasDoubleSpecial = specialSkillCount >= FUSION_SPECIAL_SKILL_MAX;
  const nextSelectedPity = isFullSkills ? 0 : selectedPity + 1;

  return {
    result: {
      qualifications,
      qualificationBreakthroughs,
      growth: roundGrowth(
        preview.growthRange.minimum +
          randomInteger(0, growthStepCount, random) / 1_000,
      ),
      initialAttributeTotal: randomInteger(
        FUSION_INITIAL_ATTRIBUTE_MIN,
        FUSION_INITIAL_ATTRIBUTE_MAX,
        random,
      ),
      skills,
      skillCount: skills.length,
      specialSkillCount,
      isFullSkills,
      isDoubleSpecial: hasDoubleSpecial,
    },
    pity: {
      withoutFruit:
        state.strategy === "without-fruit"
          ? nextSelectedPity
          : state.pity.withoutFruit,
      withFruit:
        state.strategy === "with-fruit"
          ? nextSelectedPity
          : state.pity.withFruit,
      fullDoubleSpecial:
        isFullSkills && isEligibleForDoubleSpecial
          ? hasDoubleSpecial
            ? 0
            : state.pity.fullDoubleSpecial + 1
          : state.pity.fullDoubleSpecial,
    },
    cost: calculateFusionCost(1, state.strategy),
  };
};

export const doesFusionResultReachTarget = (
  result: FusionResult,
  target: FusionTarget,
) => {
  if (target.requireFullSkills && !result.isFullSkills) return false;
  if (target.requireDoubleSpecial && !result.isDoubleSpecial) return false;
  if (result.growth < target.minimumGrowth) return false;

  return SPIRIT_BEAST_QUALIFICATIONS.every(
    (qualification) =>
      result.qualifications[qualification] >=
      target.minimumQualifications[qualification],
  );
};

export const simulateFusionUntilTarget = (
  state: Pick<
    SpiritBeastFusionState,
    "parents" | "strategy" | "probabilities" | "pity" | "target"
  >,
  random: RandomSource = Math.random,
  maximumAttempts = 100_000,
): FusionRun => {
  let pity = state.pity;
  let lastResult: FusionResult | null = null;

  for (let attempts = 1; attempts <= maximumAttempts; attempts += 1) {
    const attempt = simulateFusionAttempt({ ...state, pity }, random);
    pity = attempt.pity;
    lastResult = attempt.result;

    if (doesFusionResultReachTarget(attempt.result, state.target)) {
      return {
        result: attempt.result,
        pity,
        cost: calculateFusionCost(attempts, state.strategy),
        reachedTarget: true,
      };
    }
  }

  if (!lastResult) {
    throw new Error("融合模拟至少需要执行一次。");
  }

  return {
    result: lastResult,
    pity,
    cost: calculateFusionCost(maximumAttempts, state.strategy),
    reachedTarget: false,
  };
};

const hasAttributeTarget = (target: FusionTarget) =>
  target.minimumGrowth > 0 ||
  SPIRIT_BEAST_QUALIFICATIONS.some(
    (qualification) => target.minimumQualifications[qualification] > 0,
  );

export const getFusionSkillPityMaximumAttempts = (
  state: Pick<SpiritBeastFusionState, "strategy" | "pity" | "target">,
) => {
  if (!state.target.requireFullSkills && !state.target.requireDoubleSpecial) {
    return null;
  }

  const pityLimit = getFusionPityLimit(state.strategy);
  const firstFullSkillsMaximum =
    pityLimit - getSelectedFusionPity(state.strategy, state.pity);

  if (!state.target.requireDoubleSpecial) return firstFullSkillsMaximum;

  const remainingFullSkillResults =
    FUSION_DOUBLE_SPECIAL_PITY - state.pity.fullDoubleSpecial;

  return firstFullSkillsMaximum + (remainingFullSkillResults - 1) * pityLimit;
};

/** 用多轮随机样本估算达标成本；资质目标没有官方保底，因此可能出现截断样本。 */
export const analyzeFusionTarget = (
  state: Pick<
    SpiritBeastFusionState,
    "parents" | "strategy" | "probabilities" | "pity" | "target"
  >,
  sampleCount = 500,
  random: RandomSource = Math.random,
  maximumAttemptsPerSample = 10_000,
): FusionAnalysis => {
  const attempts: number[] = [];

  for (let sample = 0; sample < sampleCount; sample += 1) {
    const run = simulateFusionUntilTarget(
      state,
      random,
      maximumAttemptsPerSample,
    );
    if (run.reachedTarget) attempts.push(run.cost.attempts);
  }

  const sortedAttempts = [...attempts].sort((left, right) => left - right);
  const completedSampleCount = sortedAttempts.length;
  const averageAttempts =
    completedSampleCount === 0
      ? maximumAttemptsPerSample
      : sortedAttempts.reduce((total, value) => total + value, 0) /
        completedSampleCount;
  const percentileValue = (percentile: number) =>
    completedSampleCount === 0
      ? maximumAttemptsPerSample
      : sortedAttempts[
          Math.min(
            completedSampleCount - 1,
            Math.ceil(completedSampleCount * percentile) - 1,
          )
        ];
  const roundedAverageAttempts = Math.round(averageAttempts);

  return {
    sampleCount,
    completedSampleCount,
    averageAttempts,
    medianAttempts: percentileValue(0.5),
    percentile90Attempts: percentileValue(0.9),
    maximumAttempts:
      completedSampleCount === 0
        ? maximumAttemptsPerSample
        : sortedAttempts[completedSampleCount - 1],
    averageCost: calculateFusionCost(roundedAverageAttempts, state.strategy),
    skillPityMaximumAttempts: getFusionSkillPityMaximumAttempts(state),
    hasNonGuaranteedAttributeTarget: hasAttributeTarget(state.target),
  };
};
