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

  it("应该支持加点并实时更新派生属性", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    await user.click(screen.getByRole("button", { name: "体力增加 1 点" }));

    expect(screen.getByLabelText("体力加点")).toHaveValue(1);
    expect(screen.getByText("645")).toBeInTheDocument();
    expect(screen.getByText("679")).toBeInTheDocument();
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

  it("应该限制总加点并支持重置", async () => {
    const user = userEvent.setup();
    render(<CharacterAttributeCalculator />);

    fireEvent.change(screen.getByLabelText("体力加点"), {
      target: { value: "999" },
    });

    expect(screen.getByLabelText("体力加点")).toHaveValue(680);
    expect(screen.getByRole("button", { name: "灵力增加 1 点" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "重置加点" }));
    expect(screen.getByLabelText("体力加点")).toHaveValue(0);
    expect(screen.getAllByText("680")).toHaveLength(2);
  });
});
