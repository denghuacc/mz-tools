import { useEffect, useMemo, useState } from "react";

import {
  SPIRIT_BEAST_QUALIFICATIONS,
  type SpiritBeastQualification,
} from "../utils/spiritBeastAttributes";
import {
  FUSION_INITIAL_ATTRIBUTE_MIN,
  FUSION_RECORD_LIMIT,
  SPIRIT_BEAST_FUSION_STORAGE_KEY,
  analyzeFusionTarget,
  calculateFusionPreview,
  createDefaultSpiritBeastFusionState,
  doesFusionResultReachTarget,
  getFusionConfigurationError,
  getFusionPityLimit,
  getSelectedFusionPity,
  normalizeSpiritBeastFusionState,
  simulateFusionAttempt,
  simulateFusionUntilTarget,
  sortFusionSkills,
  type FusionAnalysis,
  type FusionBeast,
  type FusionPityProgress,
  type FusionProbabilities,
  type FusionRecord,
  type FusionResult,
  type FusionRun,
  type FusionStrategy,
  type FusionTarget,
  type SpiritBeastFusionState,
} from "../utils/spiritBeastFusion";
import {
  loadCalculatorState,
  saveCalculatorState,
} from "../utils/calculatorStorage";
import { playFusionRevealSound } from "../utils/fusionRevealSound";

type FusionParentRole = keyof SpiritBeastFusionState["parents"];

const FULL_SKILL_ONLY_TARGET: FusionTarget = {
  requireFullSkills: true,
  requireDoubleSpecial: false,
  minimumQualifications: {
    physicalAttack: 0,
    physicalDefense: 0,
    health: 0,
    spirit: 0,
    speed: 0,
  },
  minimumGrowth: 0,
};

const loadFusionState = (): SpiritBeastFusionState =>
  loadCalculatorState(
    SPIRIT_BEAST_FUSION_STORAGE_KEY,
    createDefaultSpiritBeastFusionState(),
    normalizeSpiritBeastFusionState,
  );

const createRecordId = () =>
  `fusion-record-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createCurrentResultFromBeast = (beast: FusionBeast): FusionResult => {
  const skills = sortFusionSkills(beast.skills);
  const specialSkillCount = skills.filter((skill) => skill.isSpecial).length;

  return {
    qualifications: beast.qualifications,
    qualificationBreakthroughs: Object.fromEntries(
      SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => [
        qualification,
        false,
      ]),
    ) as Record<SpiritBeastQualification, boolean>,
    growth: beast.growth,
    initialAttributeTotal: FUSION_INITIAL_ATTRIBUTE_MIN,
    skills,
    skillCount: skills.length,
    specialSkillCount,
    isFullSkills: false,
    isDoubleSpecial: specialSkillCount >= 2,
  };
};

/** 管理融合模拟器的持久化配置、临时结果和完整操作流程。 */
export const useSpiritBeastFusionSimulator = () => {
  const [state, setState] = useState(loadFusionState);
  const [storedLastRun, setStoredLastRun] = useState<FusionRun | null>(null);
  const [activeResult, setActiveResult] = useState<FusionResult | null>(null);
  const [comparisonCurrentResult, setComparisonCurrentResult] =
    useState<FusionResult | null>(null);
  const [revealResult, setRevealResult] = useState<FusionResult | null>(null);
  const [analysis, setAnalysis] = useState<FusionAnalysis | null>(null);
  const [notice, setNotice] = useState("");
  const preview = useMemo(
    () => calculateFusionPreview(state.parents),
    [state.parents],
  );
  const configurationError = useMemo(
    () => getFusionConfigurationError(state),
    [state],
  );
  const fullSkillConfigurationError = useMemo(
    () =>
      getFusionConfigurationError({
        parents: state.parents,
        target: FULL_SKILL_ONLY_TARGET,
      }),
    [state.parents],
  );
  const lastRun = useMemo(
    () =>
      storedLastRun
        ? {
            ...storedLastRun,
            reachedTarget: doesFusionResultReachTarget(
              storedLastRun.result,
              state.target,
            ),
          }
        : null,
    [state.target, storedLastRun],
  );
  const selectedPity = getSelectedFusionPity(state.strategy, state.pity);
  const selectedPityLimit = getFusionPityLimit(state.strategy);
  const comparisonRun =
    lastRun && activeResult !== lastRun.result ? lastRun : null;

  useEffect(() => {
    saveCalculatorState(SPIRIT_BEAST_FUSION_STORAGE_KEY, state);
  }, [state]);

  const updateBeast = (role: FusionParentRole, beast: FusionBeast) => {
    setState((current) => ({
      ...current,
      parents: { ...current.parents, [role]: beast },
    }));
    setStoredLastRun(null);
    setActiveResult(null);
    setComparisonCurrentResult(null);
    setRevealResult(null);
    setAnalysis(null);
  };

  const updateBeastQualification = (
    role: FusionParentRole,
    qualification: SpiritBeastQualification,
    value: number,
  ) => {
    const beast = state.parents[role];
    updateBeast(role, {
      ...beast,
      qualifications: { ...beast.qualifications, [qualification]: value },
    });
  };

  const updateTarget = (target: FusionTarget) => {
    setState((current) => ({ ...current, target }));
    setAnalysis(null);
  };

  const updateStrategy = (strategy: FusionStrategy) => {
    setState((current) => ({ ...current, strategy }));
    setAnalysis(null);
  };

  const updatePity = (pity: FusionPityProgress) => {
    setState((current) => ({ ...current, pity }));
    setAnalysis(null);
  };

  const updateProbabilities = (probabilities: FusionProbabilities) => {
    setState((current) => ({ ...current, probabilities }));
    setAnalysis(null);
  };

  const performSingleFusion = () => {
    const attempt = simulateFusionAttempt(state);
    const run: FusionRun = {
      ...attempt,
      reachedTarget: doesFusionResultReachTarget(attempt.result, state.target),
    };
    const currentResult =
      activeResult ?? createCurrentResultFromBeast(state.parents.main);

    setState((current) => ({ ...current, pity: attempt.pity }));
    setStoredLastRun(run);
    // 重置候选结果时保留左侧当前结果，只有保存才更新生效基线。
    setComparisonCurrentResult((current) => current ?? currentResult);
    setRevealResult(run.result.isFullSkills ? run.result : null);
    if (run.result.isFullSkills) playFusionRevealSound();
    setAnalysis(null);
    setNotice(
      run.reachedTarget ? "本次融合已达到目标。" : "本次融合未达到目标。",
    );
  };

  const simulateOnce = () => {
    if (configurationError) {
      setNotice(configurationError);
      return;
    }

    performSingleFusion();
  };

  const resetCandidateResult = () => {
    // 对比窗口中的重置不受用户目标配置影响，只要求基础融合条件成立。
    if (fullSkillConfigurationError) {
      setNotice(fullSkillConfigurationError);
      return;
    }

    performSingleFusion();
  };

  const fuseUntilFullSkills = () => {
    if (fullSkillConfigurationError) {
      setNotice(fullSkillConfigurationError);
      return;
    }

    const fullSkillState = { ...state, target: FULL_SKILL_ONLY_TARGET };
    const run = simulateFusionUntilTarget(fullSkillState);
    const nextAnalysis = analyzeFusionTarget(fullSkillState, 300);
    const currentResult =
      activeResult ?? createCurrentResultFromBeast(state.parents.main);

    setState((current) => ({ ...current, pity: run.pity }));
    setStoredLastRun(run);
    setComparisonCurrentResult((current) => current ?? currentResult);
    setRevealResult(run.result.isFullSkills ? run.result : null);
    if (run.result.isFullSkills) playFusionRevealSound();
    setAnalysis(nextAnalysis);
    setNotice(
      `已在第 ${run.cost.attempts.toLocaleString("zh-CN")} 次融合出满技能。`,
    );
  };

  const acceptCurrentResult = () => {
    if (!storedLastRun) return;

    const savedResult = storedLastRun.result;

    if (activeResult !== savedResult) {
      const record: FusionRecord = {
        id: createRecordId(),
        createdAt: Date.now(),
        mainName: state.parents.main.name,
        secondaryName: state.parents.secondary.name,
        result: savedResult,
      };

      setState((current) => ({
        ...current,
        records: [record, ...current.records].slice(0, FUSION_RECORD_LIMIT),
      }));
    }

    setActiveResult(savedResult);
    setComparisonCurrentResult(savedResult);
    setNotice("已保存为当前生效结果并加入融合记录；可以继续重置右侧新属性。");
  };

  const applyRecord = (record: FusionRecord) => {
    setStoredLastRun({
      result: record.result,
      pity: state.pity,
      cost: { attempts: 0, pills: 0, silver: 0, fruits: 0 },
      reachedTarget: doesFusionResultReachTarget(record.result, state.target),
    });
    setActiveResult(record.result);
    setComparisonCurrentResult(null);
    setRevealResult(null);
    setAnalysis(null);
    setNotice("已免费应用记录，当前保底进度未变化。");
  };

  const deleteRecord = (recordId: string) => {
    setState((current) => ({
      ...current,
      records: current.records.filter((record) => record.id !== recordId),
    }));
  };

  return {
    state,
    preview,
    configurationError,
    fullSkillConfigurationError,
    selectedPity,
    selectedPityLimit,
    lastRun,
    comparisonRun,
    comparisonCurrentResult,
    revealResult,
    analysis,
    notice,
    updateBeast,
    updateBeastQualification,
    updateTarget,
    updateStrategy,
    updatePity,
    updateProbabilities,
    simulateOnce,
    resetCandidateResult,
    fuseUntilFullSkills,
    acceptCurrentResult,
    applyRecord,
    deleteRecord,
    closeReveal: () => setRevealResult(null),
    closeComparison: () => setComparisonCurrentResult(null),
  };
};
