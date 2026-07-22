import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterAttributeCalculator from "../CharacterAttributeCalculator";
import {
  calculateSanshengPillMaximumCount,
  createEmptyCharacterAttributeBonuses,
} from "../../utils/characterAttributes";
import {
  CHARACTER_ATTRIBUTES_STORAGE_KEY,
  LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
} from "../../utils/calculatorStorage";

describe("CharacterAttributeCalculator", () => {
  it("应该展示角色面板计算结构", () => {
    render(<CharacterAttributeCalculator />);

    expect(
      screen.queryByRole("heading", { name: "69 级裸属性" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("潜力点总计")).not.toBeInTheDocument();
    expect(screen.getByText("基础属性 · 10 项")).toBeInTheDocument();
    expect(screen.getByText("五项派生初值待验证")).toBeInTheDocument();
    expect(screen.getByText("潜力 +690")).toBeInTheDocument();
    expect(screen.getByText("1390")).toBeInTheDocument();
    expect(screen.getByText("565")).toBeInTheDocument();
    expect(screen.getByText("等级 +748")).toBeInTheDocument();
    expect(screen.getByText("等级 +408")).toBeInTheDocument();
    const trueEnergyRow = screen.getByText("真气").closest("div");
    expect(trueEnergyRow).not.toBeNull();
    expect(within(trueEnergyRow!).getByText("100")).toBeInTheDocument();
    expect(screen.getByTestId("mana-value-bar")).toHaveClass("bg-blue-500");
    expect(screen.queryByText("进阶属性与亲和")).not.toBeInTheDocument();
  });

  it("应该在属性加成区域切换装备值并持久化选择", async () => {
    const user = userEvent.setup();
    const equipmentBonuses = {
      ...createEmptyCharacterAttributeBonuses(),
      health: 100,
    };
    const { unmount } = render(
      <CharacterAttributeCalculator equipmentBonuses={equipmentBonuses} />
    );

    const equipmentToggle = screen.getByRole("checkbox", {
      name: "计入装备值",
    });
    expect(equipmentToggle).toBeChecked();
    expect(
      screen.queryByRole("region", { name: "装备属性接入状态" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("+装备 100")).toBeInTheDocument();
    expect(screen.getByText("1490")).toBeInTheDocument();

    await user.click(equipmentToggle);

    expect(equipmentToggle).not.toBeChecked();
    expect(screen.queryByText("+装备 100")).not.toBeInTheDocument();
    expect(screen.getByText("1390")).toBeInTheDocument();
    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(CHARACTER_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(stored.isEquipmentIncluded).toBe(false);
    });

    unmount();
    render(<CharacterAttributeCalculator equipmentBonuses={equipmentBonuses} />);
    expect(
      screen.getByRole("checkbox", { name: "计入装备值" })
    ).not.toBeChecked();
    expect(screen.queryByText("+装备 100")).not.toBeInTheDocument();
    expect(screen.getByText("1390")).toBeInTheDocument();
  });

  it("应该为每个属性加成卡片显示编辑图标", () => {
    render(<CharacterAttributeCalculator />);

    const allocationEditButton = screen.getByRole("button", {
      name: "编辑潜力点分配",
    });
    expect(within(allocationEditButton).queryByText("编辑")).not.toBeInTheDocument();
    expect(allocationEditButton.querySelector("svg")).not.toBeNull();

    const editButtons = within(screen.getByTestId("attribute-bonus-rail"))
      .getAllByRole("button", { name: /^编辑/ });

    expect(editButtons).toHaveLength(16);
    expect(editButtons.map((button) => button.getAttribute("aria-label"))).toEqual([
      "编辑技能",
      "编辑人物修炼",
      "编辑神魂",
      "编辑天书",
      "编辑天书星魂",
      "编辑法宝",
      "编辑魅灵",
      "编辑缎纹",
      "编辑幻形符",
      "编辑灵符",
      "编辑魂器",
      "编辑赛季神器",
      "编辑帮派祝福",
      "编辑帮派天赋",
      "编辑星运祈福",
      "编辑三生造化丹",
    ]);
    editButtons.forEach((button) => {
      expect(button.textContent).toBe("");
      expect(button.querySelector("svg")).not.toBeNull();
    });
  });

  it("应该显示法宝名称和加成公式，并按等级计算互斥属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const talismanDialog = await openBonusEditor(user, "法宝");

    const physicalAttackOption = within(talismanDialog).getByRole("radio", {
      name: /物攻法宝：天魔幡/,
    });
    const magicAttackOption = within(talismanDialog).getByRole("radio", {
      name: /法攻法宝：四灵幡/,
    });
    const supportOption = within(talismanDialog).getByRole("radio", {
      name: /辅助 \/ 封印法宝：鹤云幡/,
    });
    expect(within(talismanDialog).getByText("等级 × 0.6 物攻")).toBeInTheDocument();
    expect(within(talismanDialog).getByText("等级 × 0.6 法攻")).toBeInTheDocument();
    expect(
      within(talismanDialog).getByText(
        "等级 × 0.4 物攻 · 血炼 +5% 物防 · +5% 法防"
      )
    ).toBeInTheDocument();

    await user.click(physicalAttackOption);
    expect(physicalAttackOption).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("天魔幡 · 物攻 +41.4")).toBeInTheDocument();
    expect(screen.getByText("法宝（天魔幡） +41.4")).toBeInTheDocument();

    await user.click(magicAttackOption);
    expect(physicalAttackOption).toHaveAttribute("aria-checked", "false");
    expect(magicAttackOption).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("四灵幡 · 法攻 +41.4")).toBeInTheDocument();

    await user.click(supportOption);
    expect(magicAttackOption).toHaveAttribute("aria-checked", "false");
    expect(supportOption).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("鹤云幡 · 物攻 +27.6")).toBeInTheDocument();
    expect(screen.getByText("法宝（鹤云幡） +27.6")).toBeInTheDocument();
    expect(screen.getAllByText("法宝（鹤云幡） +5%")).toHaveLength(2);
  });

  it("应该让琥珀朱绫实时获得幻形符一半属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const transformationDialog = await openBonusEditor(user, "幻形符");
    await user.click(
      within(transformationDialog).getByRole("button", { name: "气血" })
    );
    await user.click(
      within(transformationDialog).getByRole("button", {
        name: "物理暴击率",
      })
    );
    await user.type(
      within(transformationDialog).getByRole("spinbutton", {
        name: "幻形符：气血",
      }),
      "100"
    );
    await user.type(
      within(transformationDialog).getByRole("spinbutton", {
        name: "幻形符：物理暴击率",
      }),
      "3.5"
    );
    await user.click(
      within(transformationDialog).getByRole("button", { name: "完成" })
    );

    const talismanDialog = await openBonusEditor(user, "法宝");
    const physicalAttackOption = within(talismanDialog).getByRole("radio", {
      name: /物攻法宝：天魔幡/,
    });
    const amberOption = within(talismanDialog).getByRole("checkbox", {
      name: /法宝：琥珀朱绫/,
    });
    expect(
      within(talismanDialog).getByText("当前幻形符属性 × 50%")
    ).toBeInTheDocument();
    await user.click(physicalAttackOption);
    await user.click(amberOption);
    expect(physicalAttackOption).toHaveAttribute("aria-checked", "true");
    expect(amberOption).toBeChecked();
    await user.click(
      within(talismanDialog).getByRole("button", { name: "完成" })
    );

    const summaryCard = screen.getByRole("heading", { name: "法宝" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(
      within(summaryCard!).getByText("天魔幡 · 物攻 +41.4")
    ).toBeInTheDocument();
    expect(
      within(summaryCard!).getByText("琥珀朱绫 · 气血 +50")
    ).toBeInTheDocument();
    expect(
      within(summaryCard!).getByText("物理暴击率 +1.75%")
    ).toBeInTheDocument();
    expect(screen.getByText("+法宝（琥珀朱绫） 50")).toBeInTheDocument();
    expect(screen.getByText("1540")).toBeInTheDocument();
    expect(screen.getByText("法宝（天魔幡） +41.4"))
      .toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    expect(screen.getByText("法宝（琥珀朱绫） +1.75%"))
      .toBeInTheDocument();
    const physicalCriticalRow = screen.getByText("物理暴击").closest("div");
    expect(physicalCriticalRow).not.toBeNull();
    expect(within(physicalCriticalRow!).getByText("7%"))
      .toBeInTheDocument();
  });

  it("应该按当前年份限制三生造化丹颗数并换算五维属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const dialog = await openBonusEditor(user, "三生造化丹");
    const currentYear = new Date().getFullYear();
    const maximumCount = calculateSanshengPillMaximumCount(currentYear);

    expect(
      within(dialog).getByLabelText(
        `三生造化丹已服用 0 / ${maximumCount} 颗`
      )
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "增加三生造化丹：力量" })
    );
    await user.click(
      within(dialog).getByRole("button", { name: "增加三生造化丹：力量" })
    );
    await user.click(
      within(dialog).getByRole("button", { name: "增加三生造化丹：体力" })
    );

    expect(
      within(dialog).getByLabelText(
        `三生造化丹已服用 3 / ${maximumCount} 颗`
      )
    ).toBeInTheDocument();
    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "三生造化丹" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("力 +4")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("体 +2")).toBeInTheDocument();
    expect(
      within(summaryCard!).getByText(`已服 3 / ${maximumCount} 颗`)
    ).toBeInTheDocument();
    expect(screen.getByText("三生造化丹 +4")).toBeInTheDocument();

    const increaseStrengthButton = within(dialog).getByRole("button", {
      name: "增加三生造化丹：力量",
    });
    for (let count = 3; count < maximumCount; count += 1) {
      fireEvent.click(increaseStrengthButton);
    }
    within(dialog)
      .getAllByRole("button", { name: /^增加三生造化丹：/ })
      .forEach((button) => expect(button).toBeDisabled());
  });

  it("应该一键隐藏并恢复全部属性加成明细", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const skillDialog = await openBonusEditor(user, "技能");
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能：气血",
      }),
      "100"
    );
    await user.click(within(skillDialog).getByRole("button", { name: "完成" }));

    expect(screen.getByText("潜力 +690")).toBeInTheDocument();
    expect(screen.getByText("+技能 100")).toBeInTheDocument();

    const hideButton = screen.getByRole("button", {
      name: "隐藏全部属性加成",
    });
    expect(hideButton).toHaveAttribute("aria-pressed", "true");
    await user.click(hideButton);

    expect(screen.queryByText("潜力 +690")).not.toBeInTheDocument();
    expect(screen.queryByText("+技能 100")).not.toBeInTheDocument();
    expect(screen.getByText("1490")).toBeInTheDocument();
    expect(screen.queryByText("等级 +748")).not.toBeInTheDocument();
    expect(screen.queryByText("等级 +408")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    expect(screen.queryByText("等级 +138")).not.toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();

    const showButton = screen.getByRole("button", {
      name: "显示全部属性加成",
    });
    expect(showButton).toHaveAttribute("aria-pressed", "false");
    await user.click(showButton);
    expect(screen.getByText("等级 +138")).toBeInTheDocument();
  });

  it("应该通过比例方案分配全部潜力点并实时更新属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const allocationSummary = screen.getByRole("region", {
      name: "潜力点分配摘要",
    });
    expect(within(allocationSummary).getByText("10力")).toBeInTheDocument();
    expect(within(allocationSummary).getByText("力 +690")).toBeInTheDocument();
    await user.click(within(allocationSummary).getByText("10力"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const allocationDialog = await openBonusEditor(user, "潜力点分配");
    const defaultPreset = within(allocationDialog).getByRole("radio", {
      name: "10力",
    });
    expect(defaultPreset).toHaveAttribute("aria-checked", "true");

    const mixedPreset = within(allocationDialog).getByRole("radio", {
      name: "6敏2体2耐",
    });
    await user.click(mixedPreset);

    expect(mixedPreset).toHaveAttribute("aria-checked", "true");
    expect(
      within(allocationSummary).getByText("体 +138 · 耐 +138 · 敏 +414")
    ).toBeInTheDocument();
    expect(screen.getByText("1804")).toBeInTheDocument();
  });

  it("应该自由叠加多条技能属性并支持清空", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    expect(
      screen.getByRole("heading", { name: "技能" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: "技能：气血" })
    ).not.toBeInTheDocument();

    const skillDialog = await openBonusEditor(user, "技能");
    expect(
      SKILL_INPUT_LABELS.map((label) =>
        within(skillDialog).getByRole("spinbutton", { name: label })
      )
    ).toHaveLength(8);

    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能：气血",
      }),
      "100"
    );
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能：物攻",
      }),
      "25"
    );

    expect(screen.getByText("1490")).toBeInTheDocument();
    expect(screen.getByText("531")).toBeInTheDocument();
    expect(screen.getByText("+技能 100")).toBeInTheDocument();

    const skillCard = within(skillDialog)
      .getByRole("heading", { name: "技能" })
      .closest("section");
    expect(skillCard).not.toBeNull();
    await user.click(within(skillCard!).getByRole("button", { name: "清空" }));

    expect(screen.queryByText("1490")).not.toBeInTheDocument();
    expect(screen.queryByText("531")).not.toBeInTheDocument();
    expect(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能：气血",
      })
    ).toHaveValue(null);
  });

  it("应该允许技能减少速度并正确更新最终速度", () => {
    render(<CharacterAttributeCalculator />);

    fireEvent.click(
      screen.getByRole("button", { name: "编辑技能" })
    );
    const skillDialog = screen.getByRole("dialog", {
      name: "编辑技能",
    });

    const speedInput = within(skillDialog).getByRole("spinbutton", {
      name: "技能：速度",
    });
    fireEvent.change(speedInput, { target: { value: "-30" } });

    expect(speedInput).toHaveValue(-30);
    expect(screen.getByText("172")).toBeInTheDocument();
    expect(screen.getByText("-30")).toHaveClass("text-rose-600");
    const skillCard = within(skillDialog)
      .getByRole("heading", { name: "技能" })
      .closest("section");
    expect(skillCard).not.toBeNull();
    expect(
      within(skillCard!).getByRole("button", { name: "清空" })
    ).toBeEnabled();
  });

  it("应该把技能抗封映射到进阶属性封印抵抗", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const skillDialog = await openBonusEditor(user, "技能");

    await user.type(
      within(skillDialog).getByRole("spinbutton", { name: "技能：抗封" }),
      "3"
    );

    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "技能" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("抗封 +3")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    const resultPanel = within(screen.getByTestId("attribute-result-panel"));
    const sealResistanceRow = resultPanel
      .getByText("封印抵抗")
      .closest("div");
    expect(sealResistanceRow).not.toBeNull();
    expect(
      within(sealResistanceRow!).getByText("技能 +3")
    ).toBeInTheDocument();
    expect(within(sealResistanceRow!).getByText("7")).toBeInTheDocument();
  });

  it("应该叠加总和为零的魂器五维和直接属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "魂器");

    await user.type(
      screen.getByRole("spinbutton", { name: "魂器：力" }),
      "10"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器：灵" }),
      "-8"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器：体" }),
      "-2"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器：物攻" }),
      "20"
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(potentialColumn).getByText("858")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("150")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("156")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("531")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("魂器 +20")).toBeInTheDocument();
  });

  it("应该阻止五维增减总和不为零的魂器参与计算", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "魂器");

    await user.type(
      screen.getByRole("spinbutton", { name: "魂器：力" }),
      "10"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器：灵" }),
      "-7"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器：体" }),
      "-2"
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "增减合计必须为 0，当前合计为 +1；本组属性暂未计入结果"
    );
    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    expect(within(potentialColumn).getByText("848")).toBeInTheDocument();
    expect(within(potentialColumn).queryByText("魂器 +10")).not.toBeInTheDocument();
  });

  it("应该为神魂五项属性应用同一个加成值", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const divineSoulDialog = await openBonusEditor(user, "神魂");

    expect(within(divineSoulDialog).getAllByRole("spinbutton")).toHaveLength(1);
    const valueInput = within(divineSoulDialog).getByRole("spinbutton", {
      name: "神魂：五项统一加成",
    });
    await user.type(valueInput, "30");

    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "神魂" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    for (const label of ["物攻", "法攻", "物防", "法防", "气血"]) {
      expect(within(summaryCard!).getByText(`${label} +30`)).toBeInTheDocument();
    }

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(derivedColumn).getAllByText("神魂 +30")).toHaveLength(4);
    expect(screen.getByText("+神魂 30")).toBeInTheDocument();
  });

  it("应该重复选择天书固定加成并支持速度百分比和亲和", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const tianshuDialog = await openBonusEditor(user, "天书");

    expect(
      within(tianshuDialog).getAllByRole("button", { name: /^增加天书：/ })
    ).toHaveLength(22);

    for (const optionTitle of [
      "20体",
      "20体",
      "等级 × 1 气血",
      "等级 × 0.2 法攻",
      "等级 × 0.2 法攻",
      "等级 × 0.3 法攻",
      "2封印抵抗",
      "3封印抗性",
      "2%速度",
      "2%法术暴击率",
      "2%物理暴击率",
      "2点火系亲和",
      "2点火系亲和",
    ]) {
      await user.click(
        within(tianshuDialog).getByRole("button", {
          name: `增加天书：${optionTitle}`,
        })
      );
    }

    expect(
      within(tianshuDialog).getByLabelText("20体已选次数")
    ).toHaveTextContent("×2");
    expect(
      within(tianshuDialog).getByLabelText("天书已选择 13 次")
    ).toBeInTheDocument();

    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "天书" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    for (const summary of [
      "体 +40",
      "气血 +69",
      "法攻 +48.3",
      "封印抵抗 +5",
      "物理暴击率 +2%",
      "法术暴击率 +2%",
      "速度 +2%",
      "火系亲和 +4",
    ]) {
      expect(within(summaryCard!).getByText(summary)).toBeInTheDocument();
    }

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    expect(within(derivedColumn).getByText("天书 +48.3")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("天书 +2%")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("天书 +40")).toBeInTheDocument();
    expect(screen.getByText("+天书 69")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    const sealResistanceRow = screen.getByText("封印抵抗").closest("div");
    const fireAffinityCard = screen.getByText("火系亲和").closest("div");
    expect(sealResistanceRow).not.toBeNull();
    expect(fireAffinityCard).not.toBeNull();
    expect(within(sealResistanceRow!).getByText("天书 +5")).toBeInTheDocument();
    expect(within(sealResistanceRow!).getByText("9")).toBeInTheDocument();
    expect(screen.getAllByText("天书 +2%")).toHaveLength(2);
    expect(within(screen.getByText("物理暴击").closest("div")!).getByText("4%"))
      .toBeInTheDocument();
    expect(within(screen.getByText("法术暴击").closest("div")!).getByText("3%"))
      .toBeInTheDocument();
    expect(within(fireAffinityCard!).getByText("天书 +4")).toBeInTheDocument();
    expect(within(fireAffinityCard!).getByText("4")).toBeInTheDocument();
  });

  it("应该让天书星魂每项最多选择一次并按等级叠加属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const dialog = await openBonusEditor(user, "天书星魂");
    const optionLabels = [
      "气血 +2%",
      "气血 +1%",
      "等级 × 0.2 法防",
      "等级 × 0.1 法防",
      "等级 × 0.2 物防",
      "等级 × 0.1 物防",
      "等级 × 0.1 速度",
      "等级 × 0.05 速度",
    ];

    expect(within(dialog).getAllByRole("checkbox")).toHaveLength(8);
    for (const effectLabel of [
      "+13.8 法防",
      "+6.9 法防",
      "+13.8 物防",
      "+6.9 物防",
      "+6.9 速度",
      "+3.45 速度",
    ]) {
      expect(within(dialog).getByText(effectLabel)).toBeInTheDocument();
    }
    for (const label of optionLabels) {
      await user.click(
        within(dialog).getByRole("checkbox", { name: label })
      );
    }
    expect(dialog).toHaveTextContent("已选 8 / 8 项");
    await user.click(within(dialog).getByRole("button", { name: "完成" }));

    const summaryCard = screen.getByRole("heading", {
      name: "天书星魂",
    }).closest("article");
    expect(summaryCard).not.toBeNull();
    for (const summary of [
      "气血 +3%",
      "法防 +20.7",
      "物防 +20.7",
      "速度 +10.35",
    ]) {
      expect(within(summaryCard!).getByText(summary)).toBeInTheDocument();
    }
    expect(within(summaryCard!).getByText("已选 8 / 8"))
      .toBeInTheDocument();
    expect(screen.getByText("天书星魂 +3%"))
      .toBeInTheDocument();
    expect(screen.getByText("1431")).toBeInTheDocument();

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(derivedColumn).getAllByText("天书星魂 +20.7"))
      .toHaveLength(2);
    expect(within(derivedColumn).getByText("天书星魂 +10.35"))
      .toBeInTheDocument();
  });

  it("应该单选赛季神器属性并填写本次实际潜能点", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "赛季神器");

    const artifactGroup = screen.getByRole("radiogroup", {
      name: "赛季神器潜能属性",
    });
    const strengthOption = within(artifactGroup).getByRole("radio", {
      name: "力量",
    });
    const spiritOption = within(artifactGroup).getByRole("radio", {
      name: "灵力",
    });
    expect(within(artifactGroup).getAllByRole("radio")).toHaveLength(5);

    await user.click(strengthOption);
    await user.type(
      screen.getByRole("spinbutton", { name: "赛季神器：潜能点" }),
      "12"
    );

    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(potentialColumn).getByText("860")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("神器 +12")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("512")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.click(spiritOption);
    expect(strengthOption).toHaveAttribute("aria-checked", "false");
    expect(spiritOption).toHaveAttribute("aria-checked", "true");
    expect(within(potentialColumn).queryByText("860")).not.toBeInTheDocument();
    expect(within(potentialColumn).getByText("170")).toBeInTheDocument();
    expect(within(potentialColumn).getAllByText("神器 +12")).toHaveLength(1);
  });

  it("应该单选魅灵属性并限制实际潜能点最高为 120", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "魅灵");

    const charmGroup = screen.getByRole("radiogroup", {
      name: "魅灵潜能属性",
    });
    const constitutionOption = within(charmGroup).getByRole("radio", {
      name: "体力",
    });
    const spiritOption = within(charmGroup).getByRole("radio", {
      name: "灵力",
    });
    expect(within(charmGroup).getAllByRole("radio")).toHaveLength(5);

    await user.click(constitutionOption);
    const charmInput = screen.getByRole("spinbutton", {
      name: "魅灵：潜能点",
    });
    expect(charmInput).toHaveAttribute("max", "120");
    await user.type(charmInput, "80");

    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    expect(within(potentialColumn).getByText("238")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("魅灵 +80")).toBeInTheDocument();

    fireEvent.change(charmInput, { target: { value: "121" } });
    expect(charmInput).toHaveValue(80);
    fireEvent.change(charmInput, { target: { value: "120" } });
    expect(charmInput).toHaveValue(120);
    expect(within(potentialColumn).getByText("278")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("魅灵 +120")).toBeInTheDocument();

    await user.click(spiritOption);
    expect(constitutionOption).toHaveAttribute("aria-checked", "false");
    expect(spiritOption).toHaveAttribute("aria-checked", "true");
    expect(within(potentialColumn).getAllByText("魅灵 +120")).toHaveLength(1);
  });

  it("应该选择一至两项缎纹并阻止选择第三项", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "缎纹");

    const satinGroup = screen.getByRole("group", { name: "缎纹选择" });
    const physicalAttackOption = within(satinGroup).getByRole("button", {
      name: "物攻",
    });
    const magicAttackOption = within(satinGroup).getByRole("button", {
      name: "法攻",
    });
    const speedOption = within(satinGroup).getByRole("button", {
      name: "速度",
    });

    await user.click(physicalAttackOption);
    await user.click(speedOption);

    expect(physicalAttackOption).toHaveAttribute("aria-pressed", "true");
    expect(speedOption).toHaveAttribute("aria-pressed", "true");
    expect(magicAttackOption).toBeDisabled();
    expect(screen.getByText("已选 2 / 2 项")).toBeInTheDocument();

    await user.type(
      screen.getByRole("spinbutton", { name: "缎纹：物攻" }),
      "30"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "缎纹：速度" }),
      "15"
    );

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(derivedColumn).getByText("536")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("217")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("缎纹 +30")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("缎纹 +15")).toBeInTheDocument();

    await user.click(physicalAttackOption);
    expect(
      screen.queryByRole("spinbutton", { name: "缎纹：物攻" })
    ).not.toBeInTheDocument();
    expect(magicAttackOption).toBeEnabled();
    expect(within(derivedColumn).getByText("506")).toBeInTheDocument();
  });

  it("应该选择一至两项幻形符属性并叠加基础与暴击属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const dialog = await openBonusEditor(user, "幻形符");

    const attributeGroup = within(dialog).getByRole("group", {
      name: "幻形符属性选择",
    });
    expect(within(attributeGroup).getAllByRole("button")).toHaveLength(10);

    const healthOption = within(attributeGroup).getByRole("button", {
      name: "气血",
    });
    const physicalCriticalOption = within(attributeGroup).getByRole("button", {
      name: "物理暴击率",
    });
    const magicAttackOption = within(attributeGroup).getByRole("button", {
      name: "法攻",
    });

    await user.click(healthOption);
    await user.click(physicalCriticalOption);

    expect(healthOption).toHaveAttribute("aria-pressed", "true");
    expect(physicalCriticalOption).toHaveAttribute("aria-pressed", "true");
    expect(magicAttackOption).toBeDisabled();

    await user.type(
      within(dialog).getByRole("spinbutton", { name: "幻形符：气血" }),
      "100"
    );
    await user.type(
      within(dialog).getByRole("spinbutton", {
        name: "幻形符：物理暴击率",
      }),
      "3.5"
    );
    await user.click(within(dialog).getByRole("button", { name: "完成" }));

    expect(screen.getByText("+幻形符 100")).toBeInTheDocument();
    const summaryCard = screen
      .getByRole("heading", { name: "幻形符" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("气血 +100")).toBeInTheDocument();
    expect(
      within(summaryCard!).getByText("物理暴击率 +3.5%")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    expect(screen.getByText("幻形符 +3.5%")).toBeInTheDocument();
    const physicalCriticalRow = screen.getByText("物理暴击").closest("div");
    expect(physicalCriticalRow).not.toBeNull();
    expect(within(physicalCriticalRow!).getByText("5%")).toBeInTheDocument();
  });

  it("应该整组启用固定的帮派祝福属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const guildDialog = await openBonusEditor(user, "帮派祝福");

    const enableButton = within(guildDialog).getByRole("button", {
      name: "启用",
    });
    expect(enableButton).toHaveAttribute("aria-pressed", "false");
    expect(within(guildDialog).getAllByText("+20")).toHaveLength(2);
    expect(within(guildDialog).getAllByText("+16")).toHaveLength(2);

    await user.click(enableButton);

    expect(
      within(guildDialog).getByRole("button", { name: "已启用" })
    ).toHaveAttribute("aria-pressed", "true");
    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "帮派祝福" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("物攻 +20")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("物防 +20")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("法攻 +16")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("法防 +16")).toBeInTheDocument();

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(derivedColumn).getByText("526")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("209")).toBeInTheDocument();
    expect(within(derivedColumn).getAllByText("帮派 +20")).toHaveLength(2);
    expect(within(derivedColumn).getAllByText("帮派 +16")).toHaveLength(2);

    const physicalAttackRow = within(derivedColumn)
      .getByText("物攻")
      .closest("div");
    expect(physicalAttackRow).not.toBeNull();
    const physicalAttackBonus = within(physicalAttackRow!).getByText("帮派 +20");
    const physicalAttackValue = within(physicalAttackRow!).getByText("526");
    expect(
      physicalAttackBonus.compareDocumentPosition(physicalAttackValue) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(physicalAttackValue).toHaveClass("shrink-0");
  });

  it("应该独立选择每项帮派天赋且组合属性同时生效", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const talentDialog = await openBonusEditor(user, "帮派天赋");

    const optionLabels = [
      "物攻 +8 / 法攻 +6",
      "物理暴击 +3% / 法术暴击 +3%",
      "物防 +8 / 法防 +6",
      "速度 +4",
      "速度 +2%",
      "命中率 +2% / 封印命中 +1%",
    ];
    expect(within(talentDialog).getAllByRole("checkbox")).toHaveLength(6);

    const attackOption = within(talentDialog).getByRole("checkbox", {
      name: optionLabels[0],
    });
    await user.click(attackOption);
    expect(attackOption).toBeChecked();

    let summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "帮派天赋" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("物攻 +8")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("法攻 +6")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("已选 1 / 6")).toBeInTheDocument();
    expect(within(summaryCard!).queryByText("速度 +4")).not.toBeInTheDocument();

    await user.click(attackOption);
    expect(attackOption).not.toBeChecked();
    expect(within(summaryCard!).queryByText("物攻 +8")).not.toBeInTheDocument();

    for (const label of optionLabels) {
      await user.click(
        within(talentDialog).getByRole("checkbox", { name: label })
      );
    }
    expect(talentDialog).toHaveTextContent("已选 6 / 6 项");

    summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "帮派天赋" })
      .closest("article");
    expect(within(summaryCard!).getByText("速度 +4")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("速度 +2%")).toBeInTheDocument();
    expect(
      within(summaryCard!).getByText("物理暴击 +3%")
    ).toBeInTheDocument();
    expect(within(summaryCard!).getByText("命中率 +2%")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("封印命中 +1%")).toBeInTheDocument();

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    const speedRow = within(derivedColumn).getByText("速度").closest("div");
    expect(speedRow).not.toBeNull();
    expect(within(speedRow!).getByText("天赋 +4")).toBeInTheDocument();
    expect(within(speedRow!).getByText("天赋 +2%")).toBeInTheDocument();
    expect(within(speedRow!).getByText("210")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    const resultPanel = within(screen.getByTestId("attribute-result-panel"));
    expect(resultPanel.getAllByText("天赋 +3%")).toHaveLength(2);
    const physicalCriticalRow = resultPanel
      .getByText("物理暴击")
      .closest("div");
    const magicalCriticalRow = resultPanel.getByText("法术暴击").closest("div");
    expect(physicalCriticalRow).not.toBeNull();
    expect(magicalCriticalRow).not.toBeNull();
    expect(within(physicalCriticalRow!).getByText("5%")).toBeInTheDocument();
    expect(within(magicalCriticalRow!).getByText("4%")).toBeInTheDocument();
    const hitRateRow = resultPanel.getByText("命中率").closest("div");
    expect(hitRateRow).not.toBeNull();
    expect(within(hitRateRow!).getByText("天赋 +2%")).toBeInTheDocument();
    expect(within(hitRateRow!).getByText("102%")).toBeInTheDocument();
    expect(resultPanel.getByText("天赋 +1%")).toBeInTheDocument();
    expect(resultPanel.getByText("151")).toBeInTheDocument();
  });

  it("应该按人物修炼等级和突破状态计算固定属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const trainingDialog = await openBonusEditor(user, "人物修炼");

    for (const label of ["攻击修炼", "物防修炼", "法防修炼"]) {
      const levelSelect = within(trainingDialog).getByRole("combobox", {
        name: `${label}等级`,
      });
      const breakthrough = within(trainingDialog).getByRole("checkbox", {
        name: `${label}突破`,
      });
      expect(levelSelect).toHaveValue("1");
      expect(breakthrough).toBeDisabled();

      await user.selectOptions(levelSelect, "12");
      expect(breakthrough).toBeEnabled();
      await user.click(breakthrough);
      expect(
        within(trainingDialog).getByLabelText(`${label}当前等级`)
      ).toHaveTextContent("12+1 / 12");
    }

    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "人物修炼" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    const trainingHeading = within(summaryCard!).getByRole("heading", {
      name: "人物修炼",
    });
    expect(trainingHeading).not.toHaveClass("truncate");
    expect(trainingHeading).toHaveClass("whitespace-nowrap");
    const trainingDetails =
      "攻击修炼 12+1 · 物防修炼 12+1 · 法防修炼 12+1";
    const detailsButton = within(summaryCard!).getByRole("button", {
      name: "查看人物修炼详情",
    });
    expect(detailsButton).toHaveAttribute("title", trainingDetails);
    expect(
      within(summaryCard!).getByRole("tooltip", { hidden: true })
    ).toHaveTextContent(trainingDetails);
    expect(within(summaryCard!).getByText("治疗强度 +65")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("封印命中 +26%")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("封印抵抗 +26%")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    const resultPanel = within(screen.getByTestId("attribute-result-panel"));
    const healingRow = resultPanel.getByText("治疗强度").closest("div");
    const sealHitRow = resultPanel.getByText("封印命中").closest("div");
    const sealResistanceRow = resultPanel
      .getByText("封印抵抗")
      .closest("div");
    expect(healingRow).not.toBeNull();
    expect(sealHitRow).not.toBeNull();
    expect(sealResistanceRow).not.toBeNull();
    expect(within(healingRow!).getByText("修炼 +65")).toBeInTheDocument();
    expect(within(healingRow!).getByText("65")).toBeInTheDocument();
    expect(within(sealHitRow!).getByText("修炼 +26%")).toBeInTheDocument();
    expect(within(sealHitRow!).getByText("174")).toBeInTheDocument();
    expect(
      within(sealResistanceRow!).getByText("修炼 +26%")
    ).toBeInTheDocument();
    expect(within(sealResistanceRow!).getByText("28")).toBeInTheDocument();
  });

  it("应该为星运祈福选择三项五维并切换 18 或 25 档", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const starDialog = await openBonusEditor(user, "星运祈福");
    const attributeGroup = within(starDialog).getByRole("group", {
      name: "星运祈福属性选择",
    });
    const constitutionOption = within(attributeGroup).getByRole("button", {
      name: "体力",
    });
    const spiritOption = within(attributeGroup).getByRole("button", {
      name: "灵力",
    });
    const strengthOption = within(attributeGroup).getByRole("button", {
      name: "力量",
    });
    const enduranceOption = within(attributeGroup).getByRole("button", {
      name: "耐力",
    });

    await user.click(constitutionOption);
    expect(screen.getByText("数值待调整")).toBeInTheDocument();
    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    expect(within(potentialColumn).getAllByText("158")).toHaveLength(4);

    await user.click(spiritOption);
    await user.click(strengthOption);

    expect(screen.getByText("已选 3 / 3 项")).toBeInTheDocument();
    expect(enduranceOption).toBeDisabled();
    expect(screen.queryByText("数值待调整")).not.toBeInTheDocument();

    const valueGroup = within(starDialog).getByRole("radiogroup", {
      name: "星运祈福加成档位",
    });
    await user.click(within(valueGroup).getByRole("radio", { name: "+25" }));

    expect(within(potentialColumn).getAllByText("183")).toHaveLength(2);
    expect(within(potentialColumn).getByText("873")).toBeInTheDocument();
    expect(within(potentialColumn).getAllByText("祈福 +25")).toHaveLength(3);

    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "星运祈福" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("体 +25")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("灵 +25")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("力 +25")).toBeInTheDocument();
  });

  it("应该按照游戏布局左侧显示派生属性、右侧显示潜力属性", () => {
    render(<CharacterAttributeCalculator />);

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });

    expect(within(derivedColumn).getByText("法攻")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("速度")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("体")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("敏")).toBeInTheDocument();
  });

  it("应该在同一卡片中切换基础属性和进阶属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const advancedTab = screen.getByRole("tab", { name: "进阶属性" });
    await user.click(advancedTab);

    expect(advancedTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "数值条" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "进阶属性 · 9 项" })
    ).toBeInTheDocument();
    expect(screen.getByText("物理暴击")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("等级 +138")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "亲和" })).toBeInTheDocument();
    expect(screen.queryByText("进战怒气")).not.toBeInTheDocument();
    expect(
      screen.getAllByText(/系亲和$/).map((element) => element.textContent)
    ).toEqual([
      "火系亲和",
      "冰系亲和",
      "电系亲和",
      "毒系亲和",
      "水系亲和",
      "风系亲和",
    ]);
    for (const [label, backgroundClass] of [
      ["火系亲和", "bg-[#f6e0e0]"],
      ["冰系亲和", "bg-[#e0f1f6]"],
      ["电系亲和", "bg-[#f5ede0]"],
      ["毒系亲和", "bg-[#f1e5f6]"],
      ["水系亲和", "bg-[#e0e9f6]"],
      ["风系亲和", "bg-[#e0f5f4]"],
    ] as const) {
      expect(screen.getByText(label).closest("div")).toHaveClass(
        backgroundClass
      );
    }
    expect(
      screen.queryByRole("heading", { name: "基础属性 · 10 项" })
    ).not.toBeInTheDocument();
  });

  it("应该选择 6 星灵符并勾选固定满属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const talismanDialog = await openBonusEditor(user, "灵符");

    expect(within(talismanDialog).queryAllByRole("spinbutton")).toHaveLength(0);
    const sixStarOption = within(talismanDialog).getByRole("radio", {
      name: /6 星灵符/,
    });
    const attributeOptions = within(talismanDialog).getAllByRole("checkbox");
    expect(attributeOptions).toHaveLength(13);
    expect(attributeOptions.every((option) => option.hasAttribute("disabled"))).toBe(
      true
    );

    await user.click(sixStarOption);
    expect(sixStarOption).toHaveAttribute("aria-checked", "true");

    for (const optionName of [
      "力 +17",
      "物攻 +62",
      "气血 +309",
      "法力 +309",
      "治疗强度 +31",
      "进战怒气 +17",
    ]) {
      await user.click(
        within(talismanDialog).getByRole("checkbox", { name: optionName })
      );
    }

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    expect(within(derivedColumn).getByText("576")).toBeInTheDocument();
    expect(within(potentialColumn).getByText("865")).toBeInTheDocument();
    expect(screen.getByText("1699")).toBeInTheDocument();
    expect(screen.getByText("874")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "进阶属性" }));
    const resultPanel = within(screen.getByTestId("attribute-result-panel"));
    const healingRow = resultPanel.getByText("治疗强度").closest("div");
    expect(healingRow).not.toBeNull();
    expect(within(healingRow!).getByText("灵符 +31")).toBeInTheDocument();
    expect(within(healingRow!).getByText("36")).toBeInTheDocument();
    expect(resultPanel.queryByText("进战怒气")).not.toBeInTheDocument();

    const summaryCard = within(screen.getByTestId("attribute-bonus-rail"))
      .getByRole("heading", { name: "灵符" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("6星灵符")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("力 +17")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("物攻 +62")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("进战怒气 +17")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("治疗强度 +31")).toBeInTheDocument();
  });

  it("应该按 10、8、6 点主属性顺序提供常见方案和自由加点入口", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const allocationDialog = await openBonusEditor(user, "潜力点分配");

    const allocationModeGroup = within(allocationDialog).getByRole(
      "radiogroup",
      { name: "潜力点分配方式" }
    );
    expect(
      within(allocationModeGroup)
        .getAllByRole("radio")
        .map((option) => option.textContent)
    ).toEqual(["常见方案", "自由加点"]);

    expect(
      within(
        within(allocationDialog).getByRole("radiogroup", {
          name: "潜力点加点方案",
        })
      )
        .getAllByRole("radio")
        .map((option) => option.textContent)
    ).toEqual([
      "10力",
      "10灵",
      "10敏",
      "8力2敏",
      "8灵2敏",
      "8灵2耐",
      "8敏2体",
      "8敏2耐",
      "6力4敏",
      "6灵4敏",
      "6灵4耐",
      "6敏4耐",
      "6敏2体2耐",
    ]);
    await user.click(
      within(allocationModeGroup).getByRole("radio", { name: "自由加点" })
    );
    expect(
      within(allocationDialog).getByRole("radiogroup", {
        name: "自由加点规则",
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "重置加点" })
    ).not.toBeInTheDocument();
  });

  it("应该按力灵互斥规则自由分配并在合法后应用结果", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const allocationDialog = await openBonusEditor(user, "潜力点分配");

    await user.click(
      within(allocationDialog).getByRole("radio", { name: "自由加点" })
    );
    const strengthInput = within(allocationDialog).getByRole("spinbutton", {
      name: "自由加点：力量",
    });
    const spiritInput = within(allocationDialog).getByRole("spinbutton", {
      name: "自由加点：灵力",
    });
    const agilityInput = within(allocationDialog).getByRole("spinbutton", {
      name: "自由加点：敏捷",
    });
    expect(strengthInput).toHaveValue(10);
    expect(spiritInput).toBeDisabled();

    fireEvent.change(strengthInput, { target: { value: "8" } });
    expect(within(allocationDialog).getByRole("alert")).toHaveTextContent(
      "当前还需分配 2 点"
    );
    expect(
      within(allocationDialog).getByRole("button", { name: "完成" })
    ).toBeDisabled();

    fireEvent.change(agilityInput, { target: { value: "2" } });
    expect(within(allocationDialog).queryByRole("alert")).not.toBeInTheDocument();
    const completeButton = within(allocationDialog).getByRole("button", {
      name: "完成",
    });
    expect(completeButton).toBeEnabled();
    await user.click(completeButton);

    const allocationSummary = screen.getByRole("region", {
      name: "潜力点分配摘要",
    });
    expect(allocationSummary).toHaveClass("sm:w-64");
    expect(within(allocationSummary).getByText("8力2敏")).toBeInTheDocument();
    expect(
      within(allocationSummary).getByText("力 +552 · 敏 +138")
    ).toBeInTheDocument();

    const reopenedDialog = await openBonusEditor(user, "潜力点分配");
    await user.click(
      within(reopenedDialog).getByRole("radio", { name: "灵力" })
    );
    expect(
      within(reopenedDialog).getByRole("spinbutton", {
        name: "自由加点：力量",
      })
    ).toBeDisabled();
    expect(
      within(reopenedDialog).getByRole("spinbutton", {
        name: "自由加点：灵力",
      })
    ).toHaveValue(8);
  });

  it("应该保存并恢复 5敏3体2耐 的敏主属性自由方案", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CharacterAttributeCalculator />);
    const allocationDialog = await openBonusEditor(user, "潜力点分配");

    await user.click(
      within(allocationDialog).getByRole("radio", { name: "自由加点" })
    );
    await user.click(
      within(allocationDialog).getByRole("radio", { name: "敏主属性" })
    );
    const agilityInput = within(allocationDialog).getByRole("spinbutton", {
      name: "自由加点：敏捷",
    });
    const constitutionInput = within(allocationDialog).getByRole("spinbutton", {
      name: "自由加点：体力",
    });
    const enduranceInput = within(allocationDialog).getByRole("spinbutton", {
      name: "自由加点：耐力",
    });
    expect(
      within(allocationDialog).getByRole("spinbutton", {
        name: "自由加点：力量",
      })
    ).toBeDisabled();
    expect(
      within(allocationDialog).getByRole("spinbutton", {
        name: "自由加点：灵力",
      })
    ).toBeDisabled();

    fireEvent.change(agilityInput, { target: { value: "5" } });
    fireEvent.change(constitutionInput, { target: { value: "3" } });
    expect(within(allocationDialog).getByRole("alert")).toHaveTextContent(
      "当前还需分配 2 点"
    );
    fireEvent.change(enduranceInput, { target: { value: "2" } });
    expect(within(allocationDialog).queryByRole("alert")).not.toBeInTheDocument();
    await user.click(
      within(allocationDialog).getByRole("button", { name: "完成" })
    );

    const allocationSummary = screen.getByRole("region", {
      name: "潜力点分配摘要",
    });
    expect(
      within(allocationSummary).getByText("5敏3体2耐")
    ).toBeInTheDocument();
    expect(
      within(allocationSummary).getByText("敏 +345 · 体 +207 · 耐 +138")
    ).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(CHARACTER_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(stored.allocationMode).toBe("custom");
      expect(stored.customAllocationScheme).toBe("agility");
      expect(stored.customAllocation).toEqual({
        constitution: 3,
        spirit: 0,
        strength: 0,
        endurance: 2,
        agility: 5,
      });
    });

    unmount();
    render(<CharacterAttributeCalculator />);
    const restoredSummary = screen.getByRole("region", {
      name: "潜力点分配摘要",
    });
    expect(within(restoredSummary).getByText("5敏3体2耐")).toBeInTheDocument();
    expect(
      within(restoredSummary).getByText("敏 +345 · 体 +207 · 耐 +138")
    ).toBeInTheDocument();
  });

  it("应该把缓存中的非法自由方案回退为对应规则的默认方案", () => {
    window.localStorage.setItem(
      CHARACTER_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify({
        allocationMode: "custom",
        customAllocationScheme: "agility",
        customAllocation: {
          constitution: 10,
          spirit: 0,
          strength: 0,
          endurance: 0,
          agility: 0,
        },
      })
    );

    render(<CharacterAttributeCalculator />);

    const allocationSummary = screen.getByRole("region", {
      name: "潜力点分配摘要",
    });
    expect(within(allocationSummary).getByText("10敏")).toBeInTheDocument();
    expect(within(allocationSummary).getByText("敏 +690")).toBeInTheDocument();
  });

  it("应该在完成编辑后通过摘要卡展示属性增减", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const skillDialog = await openBonusEditor(user, "技能");
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能：气血",
      }),
      "100"
    );
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能：速度",
      }),
      "-30"
    );
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能：物攻",
      }),
      "122"
    );
    await user.click(within(skillDialog).getByRole("button", { name: "完成" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const summaryCard = screen
      .getByRole("heading", { name: "技能" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("气血 +100")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("速度 -30")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("物攻 +122")).toBeInTheDocument();
    expect(within(summaryCard!).queryByText("3 项变更")).not.toBeInTheDocument();
    expect(within(summaryCard!).queryByText("另 1 项")).not.toBeInTheDocument();
    expect(screen.getByText("已配置 2 / 16")).toBeInTheDocument();
  });

  it("应该在二次确认后重置全部属性加成并保留潜力点方案", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const allocationDialog = await openBonusEditor(user, "潜力点分配");
    await user.click(
      within(allocationDialog).getByRole("radio", { name: "8力2敏" })
    );
    await user.click(
      within(allocationDialog).getByRole("button", { name: "完成" })
    );

    const skillDialog = await openBonusEditor(user, "技能");
    await user.type(
      within(skillDialog).getByRole("spinbutton", { name: "技能：气血" }),
      "100"
    );
    await user.click(
      within(skillDialog).getByRole("button", { name: "完成" })
    );

    const trainingDialog = await openBonusEditor(user, "人物修炼");
    await user.selectOptions(
      within(trainingDialog).getByRole("combobox", { name: "攻击修炼等级" }),
      "12"
    );
    await user.click(
      within(trainingDialog).getByRole("checkbox", { name: "攻击修炼突破" })
    );
    await user.click(
      within(trainingDialog).getByRole("button", { name: "完成" })
    );

    const skillCard = screen.getByRole("heading", { name: "技能" })
      .closest("article");
    expect(skillCard).not.toBeNull();
    expect(skillCard).toHaveTextContent("气血 +100");

    await user.click(screen.getByRole("button", { name: "重置" }));
    const firstConfirmation = screen.getByRole("alertdialog", {
      name: "确认重置属性加成？",
    });
    await user.click(
      within(firstConfirmation).getByRole("button", { name: "取消" })
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(skillCard).toHaveTextContent("气血 +100");

    await user.click(screen.getByRole("button", { name: "重置" }));
    await user.click(
      within(
        screen.getByRole("alertdialog", { name: "确认重置属性加成？" })
      ).getByRole("button", { name: "确认重置" })
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(skillCard).not.toHaveTextContent("气血 +100");
    expect(screen.getByText("已配置 1 / 16")).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("region", { name: "潜力点分配摘要" })
      ).getByText("8力2敏")
    ).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(CHARACTER_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(stored.skillBonuses.health).toBe(0);
      expect(stored.characterTrainingLevels).toEqual({
        attack: { level: 1, breakthrough: false },
        physicalDefense: { level: 1, breakthrough: false },
        magicDefense: { level: 1, breakthrough: false },
      });
      expect(stored.selectedPresetId).toBe("8-strength-2-agility");
    });
  });

  it("应该保存全部角色面板配置并在重新挂载后恢复", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<CharacterAttributeCalculator />);

    const skillDialog = await openBonusEditor(user, "技能");
    await user.type(
      within(skillDialog).getByRole("spinbutton", { name: "技能：气血" }),
      "100"
    );
    await user.click(within(skillDialog).getByRole("button", { name: "完成" }));

    const talismanDialog = await openBonusEditor(user, "灵符");
    await user.click(
      within(talismanDialog).getByRole("radio", { name: /6 星灵符/ })
    );
    await user.click(
      within(talismanDialog).getByRole("checkbox", { name: "气血 +309" })
    );
    await user.click(
      within(talismanDialog).getByRole("button", { name: "完成" })
    );

    const guildTalentDialog = await openBonusEditor(user, "帮派天赋");
    await user.click(
      within(guildTalentDialog).getByRole("checkbox", {
        name: "物攻 +8 / 法攻 +6",
      })
    );
    await user.click(
      within(guildTalentDialog).getByRole("checkbox", {
        name: "物理暴击 +3% / 法术暴击 +3%",
      })
    );
    await user.click(
      within(guildTalentDialog).getByRole("button", { name: "完成" })
    );

    const starSoulDialog = await openBonusEditor(user, "天书星魂");
    await user.click(
      within(starSoulDialog).getByRole("checkbox", { name: "气血 +2%" })
    );
    await user.click(
      within(starSoulDialog).getByRole("button", { name: "完成" })
    );

    const amberTalismanDialog = await openBonusEditor(user, "法宝");
    await user.click(
      within(amberTalismanDialog).getByRole("checkbox", {
        name: "法宝：琥珀朱绫",
      })
    );
    await user.click(
      within(amberTalismanDialog).getByRole("button", { name: "完成" })
    );

    const trainingDialog = await openBonusEditor(user, "人物修炼");
    await user.selectOptions(
      within(trainingDialog).getByRole("combobox", { name: "攻击修炼等级" }),
      "12"
    );
    await user.click(
      within(trainingDialog).getByRole("checkbox", { name: "攻击修炼突破" })
    );
    await user.click(
      within(trainingDialog).getByRole("button", { name: "完成" })
    );

    const sanshengPillDialog = await openBonusEditor(user, "三生造化丹");
    await user.click(
      within(sanshengPillDialog).getByRole("button", {
        name: "增加三生造化丹：力量",
      })
    );
    await user.click(
      within(sanshengPillDialog).getByRole("button", {
        name: "增加三生造化丹：力量",
      })
    );
    await user.click(
      within(sanshengPillDialog).getByRole("button", { name: "完成" })
    );

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(CHARACTER_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(stored.skillBonuses.health).toBe(100);
      expect(stored.temporaryTalismanStar).toBe(6);
      expect(stored.temporaryTalismanAttributes).toEqual(["health"]);
      expect(stored.guildTalentOptionIds).toEqual(["attack", "critical"]);
      expect(stored.tianshuStarSoulOptionIds).toEqual(["health-percent-2"]);
      expect(stored.isAmberTalismanEnabled).toBe(true);
      expect(stored.characterTrainingLevels).toEqual({
        attack: { level: 12, breakthrough: true },
        physicalDefense: { level: 1, breakthrough: false },
        magicDefense: { level: 1, breakthrough: false },
      });
      expect(stored.sanshengPillCounts).toEqual({
        constitution: 0,
        spirit: 0,
        strength: 2,
        endurance: 0,
        agility: 0,
      });
      expect(stored.allocationMode).toBe("preset");
      expect(stored.customAllocationScheme).toBe("strength-or-spirit");
      expect(stored.customAllocation).toEqual({
        constitution: 0,
        spirit: 0,
        strength: 10,
        endurance: 0,
        agility: 0,
      });
      expect(Object.keys(stored).sort()).toEqual(
        [
          "allocationMode",
          "characterTrainingLevels",
          "charmAttribute",
          "charmValue",
          "customAllocation",
          "customAllocationScheme",
          "divineSoulValue",
          "guildTalentOptionIds",
          "isAmberTalismanEnabled",
          "isEquipmentIncluded",
          "isGuildBlessingEnabled",
          "sanshengPillCounts",
          "satinSelections",
          "seasonArtifactAttribute",
          "seasonArtifactValue",
          "selectedPresetId",
          "skillBonuses",
          "soulArtifactBonuses",
          "starBlessingAttributes",
          "starBlessingValue",
          "talismanOptionId",
          "temporaryTalismanAttributes",
          "temporaryTalismanStar",
          "tianshuBonusCounts",
          "tianshuStarSoulOptionIds",
          "transformationTalismanSelections",
        ].sort()
      );
    });

    unmount();
    render(<CharacterAttributeCalculator />);

    expect(screen.getByText("+技能 100")).toBeInTheDocument();
    expect(screen.getByText("+灵符 309")).toBeInTheDocument();
    expect(screen.getByText("天书星魂 +2%"))
      .toBeInTheDocument();
    expect(screen.getByText("三生造化丹 +4")).toBeInTheDocument();
    const restoredTalismanDialog = await openBonusEditor(user, "法宝");
    expect(
      within(restoredTalismanDialog).getByRole("checkbox", {
        name: "法宝：琥珀朱绫",
      })
    ).toBeChecked();
    await user.click(
      within(restoredTalismanDialog).getByRole("button", { name: "完成" })
    );
    const restoredTalentCard = screen
      .getByRole("heading", { name: "帮派天赋" })
      .closest("article");
    expect(restoredTalentCard).not.toBeNull();
    expect(within(restoredTalentCard!).getByText("物攻 +8")).toBeInTheDocument();
    const restoredTrainingCard = screen
      .getByRole("heading", { name: "人物修炼" })
      .closest("article");
    expect(restoredTrainingCard).not.toBeNull();
    expect(
      within(restoredTrainingCard!).getByText("治疗强度 +65")
    ).toBeInTheDocument();
    const restoredDialog = await openBonusEditor(user, "技能");
    expect(
      within(restoredDialog).getByRole("spinbutton", { name: "技能：气血" })
    ).toHaveValue(100);
  });

  it("应该把旧版整组帮派天赋状态迁移为六项全选", async () => {
    window.localStorage.setItem(
      CHARACTER_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify({ isGuildTalentEnabled: true })
    );
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const guildTalentDialog = await openBonusEditor(user, "帮派天赋");
    const migratedOptions = within(guildTalentDialog).getAllByRole("checkbox");
    expect(migratedOptions).toHaveLength(6);
    migratedOptions.forEach((option) => expect(option).toBeChecked());

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(CHARACTER_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(stored.guildTalentOptionIds).toEqual([
        "attack",
        "critical",
        "defense",
        "speed",
        "speed-percent",
        "seal-hit",
      ]);
      expect(stored.isGuildTalentEnabled).toBeUndefined();
    });
  });

  it("应该迁移旧版角色配置并安全清空自由灵符数值", async () => {
    window.localStorage.setItem(
      LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify({
        skillBonuses: { health: 100 },
        temporaryTalismanBonuses: { health: 200 },
      })
    );
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    expect(screen.getByText("+技能 100")).toBeInTheDocument();
    const talismanSummaryCard = screen
      .getByRole("heading", { name: "灵符" })
      .closest("article");
    expect(talismanSummaryCard).not.toBeNull();
    expect(
      within(talismanSummaryCard!).queryByText("气血 +200")
    ).not.toBeInTheDocument();

    const talismanDialog = await openBonusEditor(user, "灵符");
    expect(
      within(talismanDialog).getByRole("radio", { name: /6 星灵符/ })
    ).toHaveAttribute("aria-checked", "false");
    expect(
      within(talismanDialog)
        .getAllByRole("checkbox")
        .every((option) => option.hasAttribute("disabled"))
    ).toBe(true);
  });
});

const openBonusEditor = async (
  user: ReturnType<typeof userEvent.setup>,
  title: string
) => {
  await user.click(screen.getByRole("button", { name: `编辑${title}` }));

  const dialog = screen.getByRole("dialog", { name: `编辑${title}` });
  expect(dialog).toBeInTheDocument();
  return dialog;
};

const SKILL_INPUT_LABELS = [
  "技能：气血",
  "技能：法力",
  "技能：物攻",
  "技能：法攻",
  "技能：物防",
  "技能：法防",
  "技能：速度",
  "技能：抗封",
];
