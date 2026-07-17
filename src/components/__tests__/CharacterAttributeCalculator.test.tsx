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

    const defaultPreset = screen.getByRole("radio", { name: "10力" });
    expect(defaultPreset).toHaveAttribute("aria-checked", "true");

    const mixedPreset = screen.getByRole("radio", { name: "6敏2体2耐" });
    await user.click(mixedPreset);

    expect(mixedPreset).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("体 +136 · 耐 +136 · 敏 +408")).toBeInTheDocument();
    expect(screen.getByText("1050")).toBeInTheDocument();
  });

  it("应该自由叠加多条技能属性并支持清空", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    expect(
      screen.getByRole("heading", { name: "技能属性加成" })
    ).toBeInTheDocument();
    expect(
      SKILL_INPUT_LABELS.map((label) =>
        screen.getByRole("spinbutton", { name: label })
      )
    ).toHaveLength(7);

    await user.type(
      screen.getByRole("spinbutton", { name: "技能属性加成：气血" }),
      "100"
    );
    await user.type(
      screen.getByRole("spinbutton", { name: "技能属性加成：物攻" }),
      "25"
    );

    expect(screen.getByText("742")).toBeInTheDocument();
    expect(screen.getByText("531")).toBeInTheDocument();
    expect(screen.getByText("+技能 100")).toBeInTheDocument();

    const skillCard = screen
      .getByRole("heading", { name: "技能属性加成" })
      .closest("section");
    expect(skillCard).not.toBeNull();
    await user.click(within(skillCard!).getByRole("button", { name: "清空" }));

    expect(screen.queryByText("742")).not.toBeInTheDocument();
    expect(screen.queryByText("531")).not.toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: "技能属性加成：气血" })
    ).toHaveValue(null);
  });

  it("应该允许技能减少速度并正确更新最终速度", () => {
    render(<CharacterAttributeCalculator />);

    const speedInput = screen.getByRole("spinbutton", {
      name: "技能属性加成：速度",
    });
    fireEvent.change(speedInput, { target: { value: "-30" } });

    expect(speedInput).toHaveValue(-30);
    expect(screen.getByText("172.6")).toBeInTheDocument();
    expect(screen.getByText("-30")).toHaveClass("text-rose-600");
    const skillCard = screen
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

  it("应该只提供当前阶段允许的七种加点方案", () => {
    render(<CharacterAttributeCalculator />);

    expect(
      within(screen.getByRole("radiogroup", { name: "潜力点加点方案" }))
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
});

const SKILL_INPUT_LABELS = [
  "技能属性加成：气血",
  "技能属性加成：法力",
  "技能属性加成：物攻",
  "技能属性加成：法攻",
  "技能属性加成：物防",
  "技能属性加成：法防",
  "技能属性加成：速度",
];
