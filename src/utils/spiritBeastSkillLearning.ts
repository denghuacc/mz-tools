import {
  getSpiritBeastFusionSkillOption,
  isKnownSpiritBeastSkillName,
} from "../data/spiritBeastFusionSkills";
import {
  SPIRIT_BEAST_SKILL_LEARNING_STORAGE_KEY,
  loadCalculatorState,
  saveCalculatorState,
} from "./calculatorStorage";
export const SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS = 9;
export const SPIRIT_BEAST_SKILL_LEARNING_MAX_OWN_SKILLS = 7;
export const SPIRIT_BEAST_SKILL_LEARNING_MAX_CHAIN_SKILLS = 2;
export const SPIRIT_BEAST_SKILL_LEARNING_ADD_CHANCE = 0.05;

export type SpiritBeastSkillLearningState = {
  skillNames: readonly string[];
  chainSkillNames: readonly string[];
  attemptCount: number;
  totalReferenceSilver: number;
};

export type SpiritBeastSkillLearningAttempt = {
  beforeSkillNames: readonly string[];
  afterSkillNames: readonly string[];
  chainSkillNames: readonly string[];
  learnedSkillName: string;
  resultType: "added" | "replaced";
  learnedSkillIndex: number;
  replacedSkillName: string | null;
  referencePrice: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeNonNegativeInteger = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;

const normalizeSkillNames = (value: unknown, maxSkills?: number) => {
  if (!Array.isArray(value)) return [];

  const skillNames: string[] = [];
  const seenSkillNames = new Set<string>();
  for (const name of value) {
    if (
      typeof name !== "string" ||
      seenSkillNames.has(name) ||
      !isKnownSpiritBeastSkillName(name)
    ) {
      continue;
    }

    seenSkillNames.add(name);
    skillNames.push(name);
    if (maxSkills !== undefined && skillNames.length >= maxSkills) break;
  }

  return skillNames;
};

export const createDefaultSpiritBeastSkillLearningState =
  (): SpiritBeastSkillLearningState => ({
    skillNames: [],
    chainSkillNames: [],
    attemptCount: 0,
    totalReferenceSilver: 0,
  });

/** 校验技能学习缓存，未知技能、重复技能和越界计数会安全清理。 */
export const normalizeSpiritBeastSkillLearningState = (
  value: unknown,
): SpiritBeastSkillLearningState | null => {
  if (!isRecord(value)) return null;

  const skillNames = normalizeSkillNames(
    value.skillNames,
    SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS,
  );
  const selectedSkillNameSet = new Set(skillNames);
  const chainSkillNames = normalizeSkillNames(value.chainSkillNames)
    .filter((name) => selectedSkillNameSet.has(name))
    .slice(0, SPIRIT_BEAST_SKILL_LEARNING_MAX_CHAIN_SKILLS);

  return {
    skillNames,
    chainSkillNames,
    attemptCount: normalizeNonNegativeInteger(value.attemptCount),
    totalReferenceSilver: normalizeNonNegativeInteger(
      value.totalReferenceSilver,
    ),
  };
};

export const loadSpiritBeastSkillLearningState = () => {
  const fallback = createDefaultSpiritBeastSkillLearningState();
  return loadCalculatorState(
    SPIRIT_BEAST_SKILL_LEARNING_STORAGE_KEY,
    fallback,
    normalizeSpiritBeastSkillLearningState,
  );
};

export const saveSpiritBeastSkillLearningState = (
  state: SpiritBeastSkillLearningState,
) => saveCalculatorState(SPIRIT_BEAST_SKILL_LEARNING_STORAGE_KEY, state);

export const toggleSpiritBeastSkillLearningSkill = (
  skillNames: readonly string[],
  skillName: string,
  maxSkills = SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS,
): readonly string[] => {
  if (!isKnownSpiritBeastSkillName(skillName)) return skillNames;
  if (skillNames.includes(skillName)) {
    return skillNames.filter((name) => name !== skillName);
  }
  if (skillNames.length >= maxSkills) {
    return skillNames;
  }

  return [...skillNames, skillName];
};

export const getSpiritBeastSkillLearningError = (
  skillNames: readonly string[],
  learnedSkillName: string | null,
  chainSkillNames: readonly string[] = [],
) => {
  const chainSkillNameSet = new Set(
    chainSkillNames.filter((name) => skillNames.includes(name)),
  );
  const ownSkillCount = skillNames.length - chainSkillNameSet.size;
  if (ownSkillCount > SPIRIT_BEAST_SKILL_LEARNING_MAX_OWN_SKILLS) {
    return `请先将 ${ownSkillCount - SPIRIT_BEAST_SKILL_LEARNING_MAX_OWN_SKILLS} 个当前技能标记为宝链技能。`;
  }
  if (!learnedSkillName) return "请选择要学习的高级技能。";
  if (!isKnownSpiritBeastSkillName(learnedSkillName)) {
    return "所选技能不在当前技能库中。";
  }
  if (
    skillNames.includes(learnedSkillName) ||
    chainSkillNames.includes(learnedSkillName)
  ) {
    return "灵兽已经拥有这个技能。";
  }

  return null;
};

/**
 * 模拟一次技能学习：无自身技能时必定新增，1～3 个自身技能时有 5% 概率新增，
 * 其余情况只在自身技能中等概率替换一个；宝链技能始终保留。
 */
export const simulateSpiritBeastSkillLearning = (
  skillNames: readonly string[],
  learnedSkillName: string,
  randomValue = Math.random(),
  chainSkillNames: readonly string[] = [],
): SpiritBeastSkillLearningAttempt | null => {
  if (
    getSpiritBeastSkillLearningError(
      skillNames,
      learnedSkillName,
      chainSkillNames,
    )
  ) {
    return null;
  }

  const skillOption = getSpiritBeastFusionSkillOption(learnedSkillName);
  if (!skillOption) return null;

  const chainSkillNameSet = new Set(chainSkillNames);
  const replaceableSkillIndexes = skillNames.flatMap((skillName, index) =>
    chainSkillNameSet.has(skillName) ? [] : [index],
  );
  const ownSkillCount = replaceableSkillIndexes.length;
  const normalizedRandomValue = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 0.999_999_999)
    : 0;
  const shouldAddSkill =
    ownSkillCount === 0 ||
    (ownSkillCount <= 3 &&
      normalizedRandomValue < SPIRIT_BEAST_SKILL_LEARNING_ADD_CHANCE);

  if (shouldAddSkill) {
    return {
      beforeSkillNames: [...skillNames],
      afterSkillNames: [...skillNames, learnedSkillName],
      chainSkillNames: [...chainSkillNames],
      learnedSkillName,
      resultType: "added",
      learnedSkillIndex: skillNames.length,
      replacedSkillName: null,
      referencePrice: skillOption.referencePrice,
    };
  }

  // 低技能数先占用前 5% 概率区间，剩余区间重新映射后仍能等概率选中每个技能。
  const replacementRandomValue =
    ownSkillCount <= 3
      ? (normalizedRandomValue - SPIRIT_BEAST_SKILL_LEARNING_ADD_CHANCE) /
        (1 - SPIRIT_BEAST_SKILL_LEARNING_ADD_CHANCE)
      : normalizedRandomValue;
  const replacementPoolIndex = Math.floor(
    replacementRandomValue * ownSkillCount,
  );
  const replacedSkillIndex = replaceableSkillIndexes[replacementPoolIndex];
  const afterSkillNames = [...skillNames];
  const replacedSkillName = afterSkillNames[replacedSkillIndex];
  afterSkillNames[replacedSkillIndex] = learnedSkillName;

  return {
    beforeSkillNames: [...skillNames],
    afterSkillNames,
    chainSkillNames: [...chainSkillNames],
    learnedSkillName,
    resultType: "replaced",
    learnedSkillIndex: replacedSkillIndex,
    replacedSkillName,
    referencePrice: skillOption.referencePrice,
  };
};
