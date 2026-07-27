import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpiritBeastAttributeCalculator from "../SpiritBeastAttributeCalculator";
import { SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY } from "../../utils/calculatorStorage";

describe("SpiritBeastAttributeCalculator", () => {
  it("应该说明灵兽当前计算口径和待复核范围", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    expect(
      screen.getByText(/当前计算基于现有 1 级属性与升级预览样本/),
    ).toHaveTextContent("当前 1 级共有 10 点潜力");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "查看当前计算口径详情" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "当前计算口径说明",
    });
    expect(dialog).toHaveTextContent(
      "0 级体、灵、力、耐、敏总和暂按 200；实际分配存在随机差异",
    );
    expect(dialog).toHaveTextContent(
      "这些是当前计算器边界，不代表已核验的游戏极限",
    );
    expect(dialog).toHaveTextContent(
      /法力增量 =（等级 - 1）×（12 \+ 10 ×\s*成长）；1 级基础法力尚未计入/,
    );
    expect(dialog).toHaveTextContent(
      "五维加成先进入资质与成长公式，面板属性加成在公式结果后直接叠加",
    );
    const conversionFormulas =
      within(dialog).getByLabelText("灵兽五维转换公式");
    expect(conversionFormulas).toHaveTextContent(
      "物攻 = 100 + 物攻资质 × 等级 × 5 / 1000 + 力 × 0.5 × 成长",
    );
    expect(conversionFormulas).toHaveTextContent(
      "气血 = 50 + 气血资质 × 等级 × 10 / 1000 + 体 × 3 × 成长",
    );
    expect(conversionFormulas).toHaveTextContent(
      "法防 = 灵力资质 × 等级 × 0.62 / 1000 + [灵 × 0.5 + 力 × 0.3 + (体 + 耐) × 0.1] × 成长",
    );
    expect(within(conversionFormulas).getAllByRole("term")).toHaveLength(6);
    expect(dialog).not.toHaveTextContent("真气固定为 100");

    await user.click(within(dialog).getByRole("button", { name: "完成" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("应该照角色面板布局展示两条数值、10 项基础属性和上下两块右栏", () => {
    render(<SpiritBeastAttributeCalculator />);

    const result = screen.getByRole("region", { name: "灵兽面板结果" });
    expect(
      within(result).getByRole("heading", { name: "数值条" }),
    ).toBeInTheDocument();
    expect(
      within(result).getByRole("heading", { name: "基础属性 · 10 项" }),
    ).toBeInTheDocument();
    expect(within(result).getByText("六系亲和")).toBeInTheDocument();
    expect(within(result).queryByText("真气")).not.toBeInTheDocument();
    expect(
      within(result).queryByRole("tab", { name: "基础属性" }),
    ).not.toBeInTheDocument();
    expect(
      within(result).queryByRole("tab", { name: "进阶属性" }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "灵兽资质" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "属性加成" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("物攻资质滑杆")).toHaveAttribute("min", "900");
    expect(screen.getByLabelText("成长滑杆")).toHaveAttribute("max", "1.5");
    expect(
      screen.queryByRole("button", { name: "编辑灵兽基础设置" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/草妖|毒魔/)).not.toBeInTheDocument();
  });

  it("应该同时支持滑杆和数字输入调整资质与成长", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    const physicalAttackInput = screen.getByRole("spinbutton", {
      name: "物攻资质数值",
    });
    await user.clear(physicalAttackInput);
    await user.type(physicalAttackInput, "1800");

    const derivedColumn = screen.getByRole("group", { name: "派生属性列" });
    expect(within(derivedColumn).getByText("135")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("成长滑杆"), {
      target: { value: "1.5" },
    });
    expect(screen.getByRole("spinbutton", { name: "成长数值" })).toHaveValue(
      1.5,
    );
  });

  it("连续输入成长小数时不应该在编辑中途补零", () => {
    render(<SpiritBeastAttributeCalculator />);

    const growthInput = screen.getByRole("spinbutton", {
      name: "成长数值",
    });
    fireEvent.change(growthInput, { target: { value: "1.2" } });

    expect(growthInput).toHaveDisplayValue("1.2");

    fireEvent.change(growthInput, { target: { value: "1.21" } });
    expect(growthInput).toHaveDisplayValue("1.21");
  });

  it("灵兽资质的六个数字输入框按 Enter 后应该失焦并确认数值", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    const inputCases = [
      ["物攻资质数值", "1501"],
      ["物防资质数值", "1502"],
      ["气血资质数值", "1503"],
      ["灵力资质数值", "1504"],
      ["速度资质数值", "1505"],
      ["成长数值", "1.21"],
    ] as const;

    for (const [name, value] of inputCases) {
      const input = screen.getByRole("spinbutton", { name });
      fireEvent.change(input, { target: { value } });
      await user.click(input);
      expect(input).toHaveFocus();

      await user.keyboard("{Enter}");

      expect(input).not.toHaveFocus();
      expect(input).toHaveValue(Number(value));
    }
  });

  it("应该沿用人物面板方案并额外提供 5 体 5 耐", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    const allocationSummary = screen.getByRole("region", {
      name: "潜力点分配摘要",
    });
    expect(within(allocationSummary).getByText("10力")).toBeInTheDocument();
    expect(within(allocationSummary).getByText("力 +10")).toBeInTheDocument();

    await user.click(
      within(allocationSummary).getByRole("button", {
        name: "编辑潜力点分配",
      }),
    );
    const dialog = screen.getByRole("dialog", { name: "编辑潜力点分配" });
    await user.click(within(dialog).getByRole("radio", { name: "5体5耐" }));
    await user.click(within(dialog).getByRole("button", { name: "完成" }));

    expect(within(allocationSummary).getByText("5体5耐")).toBeInTheDocument();
    expect(
      within(allocationSummary).getByText("体 +5 · 耐 +5"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "五维属性列" })).getAllByText(
        "47",
      ),
    ).toHaveLength(2);
  });

  it("应该在潜力点编辑器顶部录入总和 200 的通用五维", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    await user.click(screen.getByRole("button", { name: "编辑潜力点分配" }));
    const dialog = screen.getByRole("dialog", { name: "编辑潜力点分配" });
    const levelZeroHeading = within(dialog).getByRole("heading", {
      name: "0 级五维初值",
    });
    const allocationHeading = within(dialog).getByRole("heading", {
      name: "潜力点分配",
    });

    expect(levelZeroHeading.compareDocumentPosition(allocationHeading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    fireEvent.change(
      within(dialog).getByRole("spinbutton", { name: "0级体初值" }),
      { target: { value: "39" } },
    );
    expect(within(dialog).getByRole("button", { name: "完成" })).toBeDisabled();

    await user.click(within(dialog).getByRole("button", { name: "随机分配" }));

    const total = ["体", "灵", "力", "耐", "敏"].reduce(
      (sum, label) =>
        sum +
        Number(
          (
            within(dialog).getByRole("spinbutton", {
              name: `0级${label}初值`,
            }) as HTMLInputElement
          ).value,
        ),
      0,
    );

    expect(total).toBe(200);
    expect(within(dialog).getByText("合计 200 / 200")).toBeInTheDocument();
    expect(within(dialog).queryByText(/草妖|毒魔/)).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "重置" }));
    ["体", "灵", "力", "耐", "敏"].forEach((label) => {
      expect(
        within(dialog).getByRole("spinbutton", {
          name: `0级${label}初值`,
        }),
      ).toHaveValue(40);
    });
  });

  it("亲和编辑器应该只保留六系亲和设置", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    await user.click(screen.getByRole("button", { name: "编辑亲和初值" }));
    const dialog = screen.getByRole("dialog", { name: "编辑亲和初值" });

    expect(
      within(dialog).getByRole("spinbutton", { name: "火亲和初值" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("heading", { name: "0 级五维初值" }),
    ).not.toBeInTheDocument();
    expect(within(dialog).queryByText("1 级法力基准")).not.toBeInTheDocument();
  });

  it("应该应用属性加成并在重新挂载后恢复全部输入", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SpiritBeastAttributeCalculator />);

    await user.click(screen.getByRole("button", { name: "编辑技能" }));
    const dialog = screen.getByRole("dialog", { name: "编辑技能" });
    const healthBonusInput = within(dialog).getByRole("spinbutton", {
      name: "技能：气血",
    });
    fireEvent.change(healthBonusInput, { target: { value: "28" } });
    await user.click(within(dialog).getByRole("button", { name: "完成" }));

    const physicalAttackInput = screen.getByRole("spinbutton", {
      name: "物攻资质数值",
    });
    await user.clear(physicalAttackInput);
    await user.type(physicalAttackInput, "1500");

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY) ??
          "{}",
      );
      expect(stored.qualifications.physicalAttack).toBe(1500);
      expect(stored.bonusSources.skill.health).toBe(28);
    });

    unmount();
    render(<SpiritBeastAttributeCalculator />);

    expect(
      screen.getByRole("spinbutton", { name: "物攻资质数值" }),
    ).toHaveValue(1500);
    expect(screen.getByText("气血 +28")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "灵兽面板结果" })).getByText(
        "218",
      ),
    ).toBeInTheDocument();
  });

  it("损坏缓存不应该阻断计算器", () => {
    window.localStorage.setItem(
      SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
      "not-json",
    );

    render(<SpiritBeastAttributeCalculator />);

    expect(screen.getByRole("heading", { name: "数值条" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "灵兽资质" }),
    ).toBeInTheDocument();
  });
});
