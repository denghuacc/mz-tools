import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";
import {
  SPIRIT_BEAST_FUSION_STORAGE_KEY,
  createDefaultSpiritBeastFusionState,
  type FusionSkill,
} from "../../utils/spiritBeastFusion";
import SpiritBeastFusionSimulator from "../SpiritBeastFusionSimulator";

const createSkills = (
  prefix: string,
  specialIndexes: readonly number[] = [],
  passiveSpecialIndexes: readonly number[] = [],
): readonly FusionSkill[] =>
  Array.from({ length: 5 }, (_, index) => {
    const isSpecial = specialIndexes.includes(index);

    return {
      id: `${prefix}-${index}`,
      name: `${prefix}技能${index + 1}`,
      isSpecial,
      specialType: isSpecial
        ? passiveSpecialIndexes.includes(index)
          ? "passive"
          : "active"
        : null,
    };
  });

const createStoredState = () => {
  const state = createDefaultSpiritBeastFusionState();

  return {
    ...state,
    probabilities: { fullSkills: 1, doubleSpecial: 0 },
    parents: {
      main: {
        ...state.parents.main,
        name: "惊了",
        skills: createSkills("主", [0]),
      },
      secondary: {
        ...state.parents.secondary,
        name: "小冰",
        skills: createSkills("副", [0], [0]),
      },
    },
  };
};

describe("SpiritBeastFusionSimulator", () => {
  it("展示主副宠输入、融合预览和经验模型说明", () => {
    render(<SpiritBeastFusionSimulator />);

    expect(
      screen.getByRole("heading", { name: "灵兽融合模拟器" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "主宠名称" })).toHaveValue(
      "主宠",
    );
    expect(screen.getByRole("textbox", { name: "副宠名称" })).toHaveValue(
      "副宠",
    );
    expect(screen.getByText("经验模型")).toBeInTheDocument();
    expect(screen.queryByText("预计范围")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "融合预览" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "融合" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("至少需要录入 4 个");
  });

  it("搜索并多选截图技能后将输入保存到本地", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastFusionSimulator />);

    const skillPicker = screen.getByRole("group", {
      name: "主宠技能技能选择",
    });
    await user.click(within(skillPicker).getByText("搜索并选择技能"));
    const searchInput = screen.getByRole("searchbox", {
      name: "主宠技能搜索技能",
    });
    const options = screen.getByRole("group", {
      name: "主宠技能可选技能",
    });

    await user.type(searchInput, "迅捷");
    await user.click(
      within(options).getByRole("checkbox", { name: "高级迅捷" }),
    );
    await user.clear(searchInput);
    await user.type(searchInput, "健壮");
    await user.click(
      within(options).getByRole("checkbox", { name: "高级健壮" }),
    );

    const selectedSkills = screen.getByLabelText("主宠技能已录入技能");
    expect(
      within(selectedSkills).queryByText("高级迅捷"),
    ).not.toBeInTheDocument();
    await user.click(
      within(selectedSkills).getByRole("button", {
        name: "查看高级迅捷技能名称",
      }),
    );
    expect(within(selectedSkills).getByText("高级迅捷")).toBeInTheDocument();
    expect(
      within(selectedSkills).getByRole("button", {
        name: "查看高级健壮技能名称",
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(SPIRIT_BEAST_FUSION_STORAGE_KEY) ?? "{}",
      );
      expect(stored.parents.main.skills[0].name).toBe("高级迅捷");
      expect(stored.parents.main.skills[0].isSpecial).toBe(false);
      expect(stored.parents.main.skills[1].name).toBe("高级健壮");
    });

    await user.click(
      screen.getByRole("button", { name: "删除主宠技能高级迅捷" }),
    );
    expect(
      within(selectedSkills).queryByText("高级迅捷"),
    ).not.toBeInTheDocument();
  });

  it("仍可补充截图列表外的被动特殊技能", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastFusionSimulator />);

    await user.click(screen.getAllByText("＋ 补充灵兽特殊技能")[0]);
    const nameInput = screen.getByRole("textbox", {
      name: "主宠技能特殊技能名称",
    });
    await user.type(nameInput, "月影奇袭");
    await user.click(
      screen.getByRole("radio", { name: "主宠技能被动特殊技能" }),
    );
    await user.click(
      within(nameInput.closest("details")!).getByRole("button", {
        name: "添加",
      }),
    );

    const specialSkillButton = screen.getByRole("button", {
      name: "查看被动特 · 月影奇袭技能名称",
    });
    expect(specialSkillButton).toHaveTextContent("特");
    expect(screen.queryByText("被动特 · 月影奇袭")).not.toBeInTheDocument();

    await user.click(specialSkillButton);
    expect(screen.getByText("被动特 · 月影奇袭")).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(SPIRIT_BEAST_FUSION_STORAGE_KEY) ?? "{}",
      );
      expect(stored.parents.main.skills[0]).toMatchObject({
        name: "月影奇袭",
        isSpecial: true,
        specialType: "passive",
      });
    });
  });

  it("允许清空资质输入框后重新输入范围内数值", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastFusionSimulator />);

    const qualificationInput = screen.getByRole("spinbutton", {
      name: "主宠物攻资质",
    });

    await user.clear(qualificationInput);
    await user.type(qualificationInput, "1300");

    expect(qualificationInput).toHaveValue(1300);
    await user.tab();
    expect(screen.getByText("1300～1552")).toBeInTheDocument();

    const growthInput = screen.getByRole("spinbutton", {
      name: "主宠成长",
    });
    await user.clear(growthInput);
    await user.type(growthInput, "1.3");

    expect(growthInput).toHaveValue(1.3);
    await user.tab();
    expect(screen.getByText("1.200～1.342")).toBeInTheDocument();
  });

  it("支持用滑杆调整主副宠资质，并与数字输入框保持同步", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastFusionSimulator />);

    const mainSlider = screen.getByRole("slider", {
      name: "主宠物攻资质滑杆",
    });
    const mainInput = screen.getByRole("spinbutton", {
      name: "主宠物攻资质",
    });

    expect(mainSlider).toHaveAttribute("min", "900");
    expect(mainSlider).toHaveAttribute("max", "1800");

    fireEvent.change(mainSlider, { target: { value: "1300" } });
    expect(mainInput).toHaveValue(1300);
    expect(screen.getByText("1300～1552")).toBeInTheDocument();

    const secondaryInput = screen.getByRole("spinbutton", {
      name: "副宠物攻资质",
    });
    const secondarySlider = screen.getByRole("slider", {
      name: "副宠物攻资质滑杆",
    });

    await user.clear(secondaryInput);
    await user.type(secondaryInput, "1450");
    await user.tab();

    expect(secondarySlider).toHaveValue("1450");
    expect(screen.getByText("1300～1501")).toBeInTheDocument();
  });

  it("恢复完整输入，模拟满技能结果并保存免费应用记录", async () => {
    window.localStorage.setItem(
      SPIRIT_BEAST_FUSION_STORAGE_KEY,
      JSON.stringify(createStoredState()),
    );
    const random = vi.spyOn(Math, "random").mockReturnValue(0.999_999);
    const user = userEvent.setup();
    render(<SpiritBeastFusionSimulator />);

    expect(screen.getByRole("textbox", { name: "主宠名称" })).toHaveValue(
      "惊了",
    );
    expect(screen.getByText("最多 6 技能")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "融合" }));

    const revealDialog = screen.getByRole("dialog", {
      name: "灵兽融合 · 揭秘",
    });
    expect(
      within(revealDialog).getByRole("button", { name: "一键揭秘" }),
    ).toBeInTheDocument();
    await user.click(
      within(revealDialog).getByRole("button", { name: "一键揭秘" }),
    );
    expect(within(revealDialog).getAllByLabelText("爆资质")).toHaveLength(5);
    await user.click(
      within(revealDialog).getByRole("button", { name: "确认" }),
    );

    const comparisonDialog = screen.getByRole("dialog", {
      name: "融合结果",
    });
    expect(screen.getByText(/已保存 0\/10/)).toBeInTheDocument();
    expect(
      within(comparisonDialog).getByRole("region", { name: "生效中" }),
    ).toBeInTheDocument();
    expect(
      within(comparisonDialog).getByRole("region", { name: "新属性" }),
    ).toBeInTheDocument();
    expect(within(comparisonDialog).getAllByLabelText("属性提升")).toHaveLength(
      7,
    );
    expect(within(comparisonDialog).getAllByLabelText("爆资质")).toHaveLength(
      5,
    );
    expect(
      within(comparisonDialog).getAllByLabelText("达到当前融合上限"),
    ).toHaveLength(6);

    await user.click(
      within(comparisonDialog).getByRole("button", {
        name: "保存",
      }),
    );
    const savedComparisonDialog = screen.getByRole("dialog", {
      name: "融合结果",
    });
    expect(
      within(
        within(savedComparisonDialog).getByRole("region", {
          name: "生效中",
        }),
      ).getAllByText("1552"),
    ).toHaveLength(5);
    const clearedCandidatePanel = within(savedComparisonDialog).getByRole(
      "region",
      { name: "新属性" },
    );
    expect(clearedCandidatePanel).toHaveTextContent(
      "点击下方重置按钮获得新的资质和技能吧",
    );
    expect(
      within(clearedCandidatePanel).queryByText("1552"),
    ).not.toBeInTheDocument();
    expect(
      within(savedComparisonDialog).queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "已保存为当前生效结果并加入融合记录；可以继续重置右侧新属性。",
    );
    expect(screen.getByText(/已保存 1\/10/)).toBeInTheDocument();
    expect(screen.getByText(/成长 1\.242 · 初始属性 135$/)).toBeInTheDocument();
    await user.click(
      within(savedComparisonDialog).getByRole("button", {
        name: "关闭融合结果",
      }),
    );

    const result = screen.getByRole("region", { name: "融合模拟结果" });
    expect(within(result).getByText("6 技能 · 0 特殊")).toBeInTheDocument();
    expect(within(result).getByText("已达标")).toBeInTheDocument();
    expect(within(result).getByText("15,000")).toBeInTheDocument();
    const physicalAttackRow = within(result).getByText("物攻").parentElement;
    const growthRow = within(result).getByText("成长").parentElement;
    expect(physicalAttackRow).toHaveClass(
      "grid",
      "grid-cols-[minmax(0,1fr)_3.5rem_1.25rem]",
    );
    expect(physicalAttackRow?.children).toHaveLength(3);
    expect(growthRow?.children).toHaveLength(3);

    expect(
      screen.queryByRole("button", { name: "保存到融合记录" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "免费应用记录" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "已免费应用记录，当前保底进度未变化。",
    );
    expect(within(result).getByText("0 次")).toBeInTheDocument();

    random.mockRestore();
  });

  it("保存后清空右侧候选并隐藏保存，重置后再生成新属性", async () => {
    const storedState = createStoredState();
    window.localStorage.setItem(
      SPIRIT_BEAST_FUSION_STORAGE_KEY,
      JSON.stringify({
        ...storedState,
        probabilities: { ...storedState.probabilities, fullSkills: 0 },
        pity: { ...storedState.pity, withoutFruit: 0 },
        parents: {
          ...storedState.parents,
          secondary: {
            ...storedState.parents.secondary,
            qualifications: {
              physicalAttack: 1_200,
              physicalDefense: 1_200,
              health: 1_200,
              spirit: 1_200,
              speed: 1_200,
            },
            growth: 1.1,
          },
        },
      }),
    );
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    render(<SpiritBeastFusionSimulator />);

    await user.click(screen.getByRole("button", { name: "融合" }));

    expect(
      screen.queryByRole("dialog", { name: "灵兽融合 · 揭秘" }),
    ).not.toBeInTheDocument();
    const comparisonDialog = screen.getByRole("dialog", {
      name: "融合结果",
    });
    const currentPanel = within(comparisonDialog).getByRole("region", {
      name: "生效中",
    });
    const candidatePanel = within(comparisonDialog).getByRole("region", {
      name: "新属性",
    });
    expect(within(currentPanel).getAllByText("1500")).toHaveLength(5);
    expect(within(candidatePanel).getAllByText("1200")).toHaveLength(5);
    expect(within(comparisonDialog).getAllByLabelText("属性下降")).toHaveLength(
      6,
    );
    expect(within(comparisonDialog).getAllByLabelText("属性持平")).toHaveLength(
      1,
    );
    expect(
      within(comparisonDialog).queryByLabelText("达到当前融合上限"),
    ).not.toBeInTheDocument();
    const useFusionFruit = within(comparisonDialog).getByRole("checkbox", {
      name: "重置时使用灵融果",
    });
    expect(useFusionFruit).not.toBeChecked();

    await user.click(useFusionFruit);
    expect(useFusionFruit).toBeChecked();
    expect(within(comparisonDialog).getByText("1/1")).toBeInTheDocument();
    random.mockReturnValue(0.999_999);

    await user.click(
      within(comparisonDialog).getByRole("button", {
        name: "15,000 银 · 重置",
      }),
    );
    expect(
      screen.queryByRole("dialog", { name: "灵兽融合 · 揭秘" }),
    ).not.toBeInTheDocument();
    const resetComparisonDialog = screen.getByRole("dialog", {
      name: "融合结果",
    });
    expect(
      within(
        within(resetComparisonDialog).getByRole("region", {
          name: "生效中",
        }),
      ).getAllByText("1500"),
    ).toHaveLength(5);
    expect(
      within(
        within(resetComparisonDialog).getByRole("region", {
          name: "新属性",
        }),
      ).getAllByText("1552"),
    ).toHaveLength(5);
    expect(
      within(resetComparisonDialog).getAllByLabelText("达到当前融合上限"),
    ).toHaveLength(6);

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(SPIRIT_BEAST_FUSION_STORAGE_KEY) ?? "{}",
      );
      expect(stored.strategy).toBe("with-fruit");
    });
    await user.click(
      within(resetComparisonDialog).getByRole("button", { name: "保存" }),
    );
    expect(screen.getByText(/已保存 1\/10/)).toBeInTheDocument();

    const savedBaselineDialog = screen.getByRole("dialog", {
      name: "融合结果",
    });
    expect(
      within(
        within(savedBaselineDialog).getByRole("region", { name: "生效中" }),
      ).getAllByText("1552"),
    ).toHaveLength(5);
    const clearedCandidatePanel = within(savedBaselineDialog).getByRole(
      "region",
      { name: "新属性" },
    );
    expect(clearedCandidatePanel).toHaveTextContent(
      "点击下方重置按钮获得新的资质和技能吧",
    );
    expect(
      within(clearedCandidatePanel).queryByText("1552"),
    ).not.toBeInTheDocument();
    expect(
      within(savedBaselineDialog).queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();

    random.mockReturnValue(0);
    await user.click(
      within(savedBaselineDialog).getByRole("button", {
        name: "15,000 银 · 重置",
      }),
    );
    const resetAfterSaveDialog = screen.getByRole("dialog", {
      name: "融合结果",
    });
    expect(
      within(
        within(resetAfterSaveDialog).getByRole("region", {
          name: "生效中",
        }),
      ).getAllByText("1552"),
    ).toHaveLength(5);
    expect(
      within(
        within(resetAfterSaveDialog).getByRole("region", {
          name: "新属性",
        }),
      ).getAllByText("1200"),
    ).toHaveLength(5);
    expect(
      within(
        within(resetAfterSaveDialog).getByRole("region", {
          name: "生效中",
        }),
      ).getByText("1.242"),
    ).toBeInTheDocument();
    expect(
      within(resetAfterSaveDialog).getByRole("button", { name: "保存" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "关闭融合结果" }));

    random.mockRestore();
  });

  it("融合至满技能不受双特殊目标阻挡", async () => {
    const storedState = createStoredState();
    window.localStorage.setItem(
      SPIRIT_BEAST_FUSION_STORAGE_KEY,
      JSON.stringify({
        ...storedState,
        probabilities: { ...storedState.probabilities, fullSkills: 0 },
        pity: { ...storedState.pity, withoutFruit: 239 },
        target: { ...storedState.target, requireDoubleSpecial: true },
        parents: {
          ...storedState.parents,
          secondary: {
            ...storedState.parents.secondary,
            skills: createSkills("副"),
          },
        },
      }),
    );
    const random = vi.spyOn(Math, "random").mockReturnValue(0.99);
    const user = userEvent.setup();
    render(<SpiritBeastFusionSimulator />);

    expect(screen.getByRole("button", { name: "融合" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "融合至满技能" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "融合至满技能" }));

    expect(
      screen.getByRole("dialog", { name: "灵兽融合 · 揭秘" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "已在第 1 次融合出满技能。",
    );

    const fullSkillReveal = screen.getByRole("dialog", {
      name: "灵兽融合 · 揭秘",
    });
    expect(screen.getByText(/已保存 0\/10/)).toBeInTheDocument();
    await user.click(
      within(fullSkillReveal).getByRole("button", { name: "一键揭秘" }),
    );
    await user.click(
      within(fullSkillReveal).getByRole("button", { name: "确认" }),
    );
    const fullSkillComparison = screen.getByRole("dialog", {
      name: "融合结果",
    });
    expect(screen.getByText(/已保存 0\/10/)).toBeInTheDocument();
    await user.click(
      within(fullSkillComparison).getByRole("button", { name: "保存" }),
    );
    expect(screen.getByText(/已保存 1\/10/)).toBeInTheDocument();
    expect(
      within(fullSkillComparison).queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
    expect(
      within(fullSkillComparison).getByText(
        "点击下方重置按钮获得新的资质和技能吧",
      ),
    ).toBeInTheDocument();
    await user.click(
      within(fullSkillComparison).getByRole("button", {
        name: "15,000 银 · 重置",
      }),
    );
    expect(
      screen.getByRole("dialog", { name: "融合结果" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "本次融合未达到目标。",
    );
    expect(
      within(screen.getByRole("dialog", { name: "融合结果" })).getByRole(
        "button",
        { name: "保存" },
      ),
    ).toBeInTheDocument();

    random.mockRestore();
  });
});
