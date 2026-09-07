import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../test/testUtils";
import {
  calculateFusionPreview,
  createDefaultSpiritBeastFusionState,
} from "../../utils/spiritBeastFusion";
import SpiritBeastFusionStrategyPanel from "../SpiritBeastFusionStrategyPanel";

describe("SpiritBeastFusionStrategyPanel", () => {
  it("应该更新目标、路线、保底与概率并收紧输入范围", async () => {
    const user = userEvent.setup();
    const state = createDefaultSpiritBeastFusionState();
    const preview = calculateFusionPreview(state.parents);
    const onTargetChange = vi.fn();
    const onStrategyChange = vi.fn();
    const onPityChange = vi.fn();
    const onProbabilitiesChange = vi.fn();
    const { rerender } = render(
      <SpiritBeastFusionStrategyPanel
        target={state.target}
        strategy={state.strategy}
        pity={state.pity}
        probabilities={state.probabilities}
        preview={preview}
        onTargetChange={onTargetChange}
        onStrategyChange={onStrategyChange}
        onPityChange={onPityChange}
        onProbabilitiesChange={onProbabilitiesChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: /满技能/ }));
    await user.click(screen.getByRole("checkbox", { name: "双特殊技能" }));
    expect(onTargetChange).toHaveBeenNthCalledWith(1, {
      ...state.target,
      requireFullSkills: false,
    });
    expect(onTargetChange).toHaveBeenNthCalledWith(2, {
      ...state.target,
      requireDoubleSpecial: true,
    });

    await user.click(screen.getByText("设置资质与成长门槛"));
    const physicalAttackTarget = screen.getByRole("spinbutton", {
      name: "目标最低物攻资质",
    });
    fireEvent.change(physicalAttackTarget, { target: { value: "9999" } });
    rerender(
      <SpiritBeastFusionStrategyPanel
        target={{
          ...state.target,
          minimumQualifications: {
            ...state.target.minimumQualifications,
            physicalAttack: preview.qualificationRanges.physicalAttack.maximum,
          },
        }}
        strategy={state.strategy}
        pity={state.pity}
        probabilities={state.probabilities}
        preview={preview}
        onTargetChange={onTargetChange}
        onStrategyChange={onStrategyChange}
        onPityChange={onPityChange}
        onProbabilitiesChange={onProbabilitiesChange}
      />,
    );
    await user.clear(
      screen.getByRole("spinbutton", { name: "目标最低物攻资质" }),
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "目标最低成长" }), {
      target: { value: "9999" },
    });
    expect(onTargetChange).toHaveBeenNthCalledWith(3, {
      ...state.target,
      minimumQualifications: {
        ...state.target.minimumQualifications,
        physicalAttack: preview.qualificationRanges.physicalAttack.maximum,
      },
    });
    expect(onTargetChange).toHaveBeenNthCalledWith(4, {
      ...state.target,
      minimumQualifications: {
        ...state.target.minimumQualifications,
        physicalAttack: 0,
      },
    });
    expect(onTargetChange).toHaveBeenNthCalledWith(5, {
      ...state.target,
      minimumQualifications: {
        ...state.target.minimumQualifications,
        physicalAttack: preview.qualificationRanges.physicalAttack.maximum,
      },
      minimumGrowth: preview.growthRange.maximum,
    });

    await user.click(screen.getByRole("radio", { name: /每次使用/ }));
    expect(onStrategyChange).toHaveBeenCalledWith("with-fruit");

    fireEvent.change(
      screen.getByRole("spinbutton", {
        name: "不使用灵融果满技能保底进度",
      }),
      { target: { value: "999" } },
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "使用灵融果满技能保底进度" }),
      { target: { value: "-1" } },
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "满技能双特殊保底进度" }),
      { target: { value: "9" } },
    );
    expect(onPityChange).toHaveBeenNthCalledWith(1, {
      ...state.pity,
      withoutFruit: 239,
    });
    expect(onPityChange).toHaveBeenNthCalledWith(2, {
      ...state.pity,
      withFruit: 0,
    });
    expect(onPityChange).toHaveBeenNthCalledWith(3, {
      ...state.pity,
      fullDoubleSpecial: 3,
    });

    await user.click(screen.getByText("经验概率设置"));
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "满技能基础概率" }),
      { target: { value: "120" } },
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: "双特殊基础概率" }),
      { target: { value: "-5" } },
    );
    expect(onProbabilitiesChange).toHaveBeenNthCalledWith(1, {
      ...state.probabilities,
      fullSkills: 1,
    });
    expect(onProbabilitiesChange).toHaveBeenNthCalledWith(2, {
      ...state.probabilities,
      doubleSpecial: 0,
    });
  });
});
