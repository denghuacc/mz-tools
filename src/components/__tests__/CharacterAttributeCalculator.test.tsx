import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterAttributeCalculator from "../CharacterAttributeCalculator";

describe("CharacterAttributeCalculator", () => {
  it("应该展示 69 级白版计算结构", () => {
    render(<CharacterAttributeCalculator />);

    expect(
      screen.getByRole("heading", { name: "69 级裸属性" })
    ).toBeInTheDocument();
    expect(screen.getByText("潜力点总计")).toBeInTheDocument();
    expect(screen.getByText("基础属性 · 10 项")).toBeInTheDocument();
    expect(screen.getByText("五项派生初值待验证")).toBeInTheDocument();
    expect(screen.queryByText("进阶属性与亲和")).not.toBeInTheDocument();
  });

  it("应该通过比例方案分配全部潜力点并实时更新属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const allocationSummary = screen.getByRole("button", {
      name: "编辑潜力点分配",
    });
    expect(within(allocationSummary).getByText("10力")).toBeInTheDocument();
    expect(within(allocationSummary).getByText("力 +680")).toBeInTheDocument();

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
      within(allocationSummary).getByText("体 +136 · 耐 +136 · 敏 +408")
    ).toBeInTheDocument();
    expect(screen.getByText("1050")).toBeInTheDocument();
  });

  it("应该自由叠加多条技能属性并支持清空", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    expect(
      screen.getByRole("heading", { name: "技能属性加成" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: "技能属性加成：气血" })
    ).not.toBeInTheDocument();

    const skillDialog = await openBonusEditor(user, "技能属性加成");
    expect(
      SKILL_INPUT_LABELS.map((label) =>
        within(skillDialog).getByRole("spinbutton", { name: label })
      )
    ).toHaveLength(7);

    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能属性加成：气血",
      }),
      "100"
    );
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能属性加成：物攻",
      }),
      "25"
    );

    expect(screen.getByText("742")).toBeInTheDocument();
    expect(screen.getByText("531")).toBeInTheDocument();
    expect(screen.getByText("+技能 100")).toBeInTheDocument();

    const skillCard = within(skillDialog)
      .getByRole("heading", { name: "技能属性加成" })
      .closest("section");
    expect(skillCard).not.toBeNull();
    await user.click(within(skillCard!).getByRole("button", { name: "清空" }));

    expect(screen.queryByText("742")).not.toBeInTheDocument();
    expect(screen.queryByText("531")).not.toBeInTheDocument();
    expect(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能属性加成：气血",
      })
    ).toHaveValue(null);
  });

  it("应该允许技能减少速度并正确更新最终速度", () => {
    render(<CharacterAttributeCalculator />);

    fireEvent.click(
      screen.getByRole("button", { name: "编辑技能属性加成" })
    );
    const skillDialog = screen.getByRole("dialog", {
      name: "编辑技能属性加成",
    });

    const speedInput = within(skillDialog).getByRole("spinbutton", {
      name: "技能属性加成：速度",
    });
    fireEvent.change(speedInput, { target: { value: "-30" } });

    expect(speedInput).toHaveValue(-30);
    expect(screen.getByText("172.6")).toBeInTheDocument();
    expect(screen.getByText("-30")).toHaveClass("text-rose-600");
    const skillCard = within(skillDialog)
      .getByRole("heading", { name: "技能属性加成" })
      .closest("section");
    expect(skillCard).not.toBeNull();
    expect(
      within(skillCard!).getByRole("button", { name: "清空" })
    ).toBeEnabled();
  });

  it("应该叠加总和为零的魂器五维和直接属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "魂器属性");

    await user.type(
      screen.getByRole("spinbutton", { name: "魂器属性：力" }),
      "10"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器属性：灵" }),
      "-8"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器属性：体" }),
      "-2"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器属性：物攻" }),
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

  it("应该阻止五维增减总和不为零的魂器属性参与计算", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "魂器属性");

    await user.type(
      screen.getByRole("spinbutton", { name: "魂器属性：力" }),
      "10"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器属性：灵" }),
      "-7"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "魂器属性：体" }),
      "-2"
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "增减合计必须为 0，当前合计为 +1；本组属性暂未计入结果"
    );
    const potentialColumn = screen.getByRole("group", { name: "潜力属性列" });
    expect(within(potentialColumn).getByText("848")).toBeInTheDocument();
    expect(within(potentialColumn).queryByText("魂器 +10")).not.toBeInTheDocument();
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

  it("应该选择一至两项缎纹属性并阻止选择第三项", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    await openBonusEditor(user, "缎纹属性");

    const satinGroup = screen.getByRole("group", { name: "缎纹属性选择" });
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
      screen.getByRole("spinbutton", { name: "缎纹属性：物攻" }),
      "30"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "缎纹属性：速度" }),
      "15"
    );

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(derivedColumn).getByText("536")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("217.6")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("缎纹 +30")).toBeInTheDocument();
    expect(within(derivedColumn).getByText("缎纹 +15")).toBeInTheDocument();

    await user.click(physicalAttackOption);
    expect(
      screen.queryByRole("spinbutton", { name: "缎纹属性：物攻" })
    ).not.toBeInTheDocument();
    expect(magicAttackOption).toBeEnabled();
    expect(within(derivedColumn).getByText("506")).toBeInTheDocument();
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
    expect(screen.getByRole("heading", { name: "状态条" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "进阶属性 · 8 项" })
    ).toBeInTheDocument();
    expect(screen.getByText("物理暴击")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("148")).toBeInTheDocument();
    expect(screen.getByText("+136")).toBeInTheDocument();
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
    expect(
      screen.queryByRole("heading", { name: "基础属性 · 10 项" })
    ).not.toBeInTheDocument();
  });

  it("应该只提供当前阶段允许的七种加点方案", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);
    const allocationDialog = await openBonusEditor(user, "潜力点分配");

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
      "6力4敏",
      "6灵4耐",
      "6敏4耐",
      "6敏2体2耐",
    ]);
    expect(
      screen.queryByRole("button", { name: "重置加点" })
    ).not.toBeInTheDocument();
  });

  it("应该在完成编辑后通过摘要卡展示属性增减", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    const skillDialog = await openBonusEditor(user, "技能属性加成");
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能属性加成：气血",
      }),
      "100"
    );
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能属性加成：速度",
      }),
      "-30"
    );
    await user.type(
      within(skillDialog).getByRole("spinbutton", {
        name: "技能属性加成：物攻",
      }),
      "122"
    );
    await user.click(within(skillDialog).getByRole("button", { name: "完成" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const summaryCard = screen
      .getByRole("heading", { name: "技能属性加成" })
      .closest("article");
    expect(summaryCard).not.toBeNull();
    expect(within(summaryCard!).getByText("气血 +100")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("速度 -30")).toBeInTheDocument();
    expect(within(summaryCard!).getByText("物攻 +122")).toBeInTheDocument();
    expect(within(summaryCard!).queryByText("3 项变更")).not.toBeInTheDocument();
    expect(within(summaryCard!).queryByText("另 1 项")).not.toBeInTheDocument();
    expect(screen.getByText("已配置 1 / 7")).toBeInTheDocument();
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
  "技能属性加成：气血",
  "技能属性加成：法力",
  "技能属性加成：物攻",
  "技能属性加成：法攻",
  "技能属性加成：物防",
  "技能属性加成：法防",
  "技能属性加成：速度",
];
