import { useEffect, useState } from "react";
import {
  createDefaultSpiritBeastSkillLearningState,
  getSpiritBeastSkillLearningError,
  loadSpiritBeastSkillLearningState,
  saveSpiritBeastSkillLearningState,
  simulateSpiritBeastSkillLearning,
  SPIRIT_BEAST_SKILL_LEARNING_MAX_CHAIN_SKILLS,
  toggleSpiritBeastSkillLearningSkill,
  type SpiritBeastSkillLearningAttempt,
} from "../utils/spiritBeastSkillLearning";

/** 管理技能学习配置、参考消耗和待确认的新增或替换结果。 */
export const useSpiritBeastSkillLearningSimulator = () => {
  const [state, setState] = useState(loadSpiritBeastSkillLearningState);
  const [selectedSkillName, setSelectedSkillName] = useState<string | null>(
    null,
  );
  const [pendingAttempt, setPendingAttempt] =
    useState<SpiritBeastSkillLearningAttempt | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    saveSpiritBeastSkillLearningState(state);
  }, [state]);

  const configurationError = getSpiritBeastSkillLearningError(
    state.skillNames,
    selectedSkillName,
    state.chainSkillNames,
  );

  const toggleCurrentSkill = (skillName: string) => {
    setState((current) => {
      const skillNames = toggleSpiritBeastSkillLearningSkill(
        current.skillNames,
        skillName,
      );
      return {
        ...current,
        skillNames,
        chainSkillNames: current.chainSkillNames.filter((name) =>
          skillNames.includes(name),
        ),
      };
    });
    setNotice("");
  };

  const toggleChainSkill = (skillName: string) => {
    setState((current) => {
      if (!current.skillNames.includes(skillName)) return current;

      return {
        ...current,
        chainSkillNames: toggleSpiritBeastSkillLearningSkill(
          current.chainSkillNames,
          skillName,
          SPIRIT_BEAST_SKILL_LEARNING_MAX_CHAIN_SKILLS,
        ),
      };
    });
    setNotice("");
  };

  const learnSelectedSkill = () => {
    if (!selectedSkillName) return;

    const attempt = simulateSpiritBeastSkillLearning(
      state.skillNames,
      selectedSkillName,
      Math.random(),
      state.chainSkillNames,
    );
    if (!attempt) return;

    setState((current) => ({
      ...current,
      attemptCount: current.attemptCount + 1,
      totalReferenceSilver:
        current.totalReferenceSilver + attempt.referencePrice,
    }));
    setPendingAttempt(attempt);
    setNotice("");
  };

  const discardPendingAttempt = () => {
    setPendingAttempt(null);
    setNotice("已放弃本次学习结果，可以继续学习。");
  };

  const savePendingAttempt = () => {
    if (!pendingAttempt) return;

    setState((current) => ({
      ...current,
      skillNames: pendingAttempt.afterSkillNames,
    }));
    setPendingAttempt(null);
    setNotice(`已保存${pendingAttempt.learnedSkillName}，可以继续学习。`);
  };

  const reset = () => {
    setState(createDefaultSpiritBeastSkillLearningState());
    setSelectedSkillName(null);
    setPendingAttempt(null);
    setNotice("");
  };

  return {
    state,
    selectedSkillName,
    pendingAttempt,
    configurationError,
    notice,
    setSelectedSkillName,
    toggleCurrentSkill,
    toggleChainSkill,
    learnSelectedSkill,
    discardPendingAttempt,
    savePendingAttempt,
    reset,
  };
};
