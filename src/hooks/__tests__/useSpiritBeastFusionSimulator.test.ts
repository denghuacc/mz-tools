import { act, renderHook } from "@testing-library/react";
import { vi } from "vite-plus/test";

import {
  SPIRIT_BEAST_FUSION_STORAGE_KEY,
  createDefaultSpiritBeastFusionState,
  type FusionSkill,
} from "../../utils/spiritBeastFusion";
import { useSpiritBeastFusionSimulator } from "../useSpiritBeastFusionSimulator";

const createSkills = (prefix: string): readonly FusionSkill[] =>
  Array.from({ length: 4 }, (_, index) => ({
    id: `${prefix}-${index}`,
    name: `${prefix}技能${index + 1}`,
    isSpecial: false,
    specialType: null,
  }));

const storeValidState = () => {
  const state = createDefaultSpiritBeastFusionState();
  window.localStorage.setItem(
    SPIRIT_BEAST_FUSION_STORAGE_KEY,
    JSON.stringify({
      ...state,
      probabilities: { fullSkills: 1, doubleSpecial: 0 },
      parents: {
        main: { ...state.parents.main, skills: createSkills("主") },
        secondary: { ...state.parents.secondary, skills: createSkills("副") },
      },
    }),
  );
};

describe("useSpiritBeastFusionSimulator", () => {
  it("目标变化后重新判断最近结果是否达标", () => {
    storeValidState();
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const { result } = renderHook(() => useSpiritBeastFusionSimulator());

    act(() => result.current.simulateOnce());
    expect(result.current.lastRun?.reachedTarget).toBe(true);

    act(() => {
      result.current.updateTarget({
        ...result.current.state.target,
        minimumGrowth: result.current.preview.growthRange.maximum,
      });
    });

    expect(result.current.lastRun?.reachedTarget).toBe(false);
    random.mockRestore();
  });

  it("概率配置变化后清除旧的成本分析", () => {
    storeValidState();
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const { result } = renderHook(() => useSpiritBeastFusionSimulator());

    act(() => result.current.fuseUntilFullSkills());
    expect(result.current.analysis).not.toBeNull();

    act(() => {
      result.current.updateProbabilities({
        ...result.current.state.probabilities,
        fullSkills: 0.5,
      });
    });

    expect(result.current.analysis).toBeNull();
    random.mockRestore();
  });

  it("配置不完整时阻止模拟、重置和追满技能", () => {
    const { result } = renderHook(() => useSpiritBeastFusionSimulator());

    act(() => result.current.simulateOnce());
    expect(result.current.notice).toContain("至少需要录入 4 个");
    act(() => result.current.resetCandidateResult());
    expect(result.current.notice).toContain("至少需要录入 4 个");
    act(() => result.current.fuseUntilFullSkills());
    expect(result.current.notice).toContain("至少需要录入 4 个");
    act(() => result.current.acceptCurrentResult());

    expect(result.current.state.records).toHaveLength(0);
  });

  it("更新保底并保存、重复应用和删除当前结果记录", () => {
    storeValidState();
    const random = vi.spyOn(Math, "random").mockReturnValue(0.999_999);
    const { result } = renderHook(() => useSpiritBeastFusionSimulator());

    act(() => {
      result.current.updatePity({
        withoutFruit: 12,
        withFruit: 8,
        fullDoubleSpecial: 2,
      });
    });
    expect(result.current.state.pity).toEqual({
      withoutFruit: 12,
      withFruit: 8,
      fullDoubleSpecial: 2,
    });

    act(() => result.current.simulateOnce());
    act(() => result.current.acceptCurrentResult());
    expect(result.current.state.records).toHaveLength(1);

    act(() => result.current.acceptCurrentResult());
    expect(result.current.state.records).toHaveLength(1);

    const recordId = result.current.state.records[0].id;
    act(() => result.current.deleteRecord(recordId));
    expect(result.current.state.records).toHaveLength(0);
    random.mockRestore();
  });
});
