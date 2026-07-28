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
      "灵饰全资质先增加公式中的资质，面板属性加成在公式结果后直接叠加",
    );
    expect(dialog).toHaveTextContent(
      "同名低级与高级技能同时存在时只按高级技能计算",
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

    await user.click(screen.getByRole("button", { name: "编辑命格" }));
    const dialog = screen.getByRole("dialog", { name: "编辑命格" });
    const healthBonusInput = within(dialog).getByRole("spinbutton", {
      name: "命格：气血",
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
      expect(stored.bonusSources.destiny.health).toBe(28);
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

  it("应该选择低级和高级面板技能，并由高级技能覆盖同名低级技能", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SpiritBeastAttributeCalculator />);

    await user.click(screen.getByRole("button", { name: "编辑技能" }));
    let dialog = screen.getByRole("dialog", { name: "编辑技能" });

    expect(
      within(dialog).queryByRole("heading", { name: "其它技能修正" }),
    ).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("checkbox", { name: "迅捷" }));
    await user.click(
      within(dialog).getByRole("checkbox", { name: "高级迅捷" }),
    );
    await user.click(
      within(dialog).getByRole("checkbox", { name: "高级健壮" }),
    );
    await user.click(
      within(dialog).getByRole("checkbox", { name: "低级火亲和" }),
    );

    expect(
      within(within(dialog).getByRole("group", { name: "迅捷" })).getByText(
        "已被高级覆盖",
      ),
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "完成" }));

    const skillCard = screen
      .getByRole("heading", { name: "技能" })
      .closest("article");
    expect(skillCard).not.toBeNull();
    expect(within(skillCard!).getByText("4 项")).toBeInTheDocument();
    expect(within(skillCard!).getByText("速度 +7.96")).toBeInTheDocument();
    expect(within(skillCard!).getByText("气血 +47.5")).toBeInTheDocument();
    expect(within(skillCard!).getByText("火亲和 +15")).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "派生属性列" })).getByText("47"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "气血数值" })).getByText("237"),
    ).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY) ??
          "{}",
      );
      expect(stored.skills.swiftness).toEqual({
        normal: true,
        advanced: true,
      });
      expect(stored.skills.robustness.advanced).toBe(true);
      expect(stored.skills.affinities.fireAffinity.normal).toBe(true);
    });

    unmount();
    render(<SpiritBeastAttributeCalculator />);
    await user.click(screen.getByRole("button", { name: "编辑技能" }));
    dialog = screen.getByRole("dialog", { name: "编辑技能" });
    expect(
      within(dialog).getByRole("checkbox", { name: "迅捷" }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole("checkbox", { name: "高级迅捷" }),
    ).toBeChecked();
    expect(
      within(dialog).getByRole("checkbox", { name: "低级火亲和" }),
    ).toBeChecked();
  });

  it("应该分别录入两件灵饰并在重新挂载后恢复", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SpiritBeastAttributeCalculator />);

    const accessoryCard = screen
      .getByRole("heading", { name: "灵饰" })
      .closest("article");
    expect(accessoryCard).not.toBeNull();
    expect(within(accessoryCard!).getByText("0/2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "编辑灵饰" }));
    let dialog = screen.getByRole("dialog", { name: "编辑灵饰" });

    expect(dialog).toHaveTextContent("固定属性：全资质 +10");
    expect(dialog).toHaveTextContent("固定属性：全资质 +20");
    await user.click(
      within(dialog).getByRole("checkbox", { name: "1阶灵饰：计入灵饰" }),
    );
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "1阶灵饰：随机属性" }),
      "health",
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "1阶灵饰：随机属性数值",
      }),
      { target: { value: "17" } },
    );
    await user.click(
      within(dialog).getByRole("checkbox", { name: "2阶灵饰：计入灵饰" }),
    );
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "2阶灵饰：随机属性" }),
      "health",
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "2阶灵饰：随机属性数值",
      }),
      { target: { value: "31" } },
    );
    await user.click(within(dialog).getByRole("button", { name: "完成" }));

    expect(within(accessoryCard!).getByText("2/2")).toBeInTheDocument();
    expect(within(accessoryCard!).getByText("全资质 +30")).toBeInTheDocument();
    expect(within(accessoryCard!).getByText("气血 +48")).toBeInTheDocument();
    expect(
      screen.getByText("已启用灵饰额外提供全资质 +30，计算时自动叠加。"),
    ).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY) ??
          "{}",
      );
      expect(stored.accessories.tierOne).toEqual({
        enabled: true,
        attribute: "health",
        value: 17,
      });
      expect(stored.accessories.tierTwo).toEqual({
        enabled: true,
        attribute: "health",
        value: 31,
      });
    });

    unmount();
    render(<SpiritBeastAttributeCalculator />);

    expect(screen.getByText("全资质 +30")).toBeInTheDocument();
    expect(screen.getByText("气血 +48")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "编辑灵饰" }));
    dialog = screen.getByRole("dialog", { name: "编辑灵饰" });
    expect(
      within(dialog).getByRole("spinbutton", {
        name: "1阶灵饰：随机属性数值",
      }),
    ).toHaveValue(17);
    expect(
      within(dialog).getByRole("spinbutton", {
        name: "2阶灵饰：随机属性数值",
      }),
    ).toHaveValue(31);
  });

  it("应该详细录入三件装备并在重新挂载后恢复原始配置", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SpiritBeastAttributeCalculator />);

    await user.click(screen.getByRole("button", { name: "编辑装备" }));
    let dialog = screen.getByRole("dialog", { name: "编辑装备" });

    expect(
      within(dialog).getByRole("heading", { name: "宝衣" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: "宝链" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: "宝冠" }),
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent("宝链技能请统一在“技能”来源录入");
    const crownSecondaryAttributeOne = within(dialog).getByRole("combobox", {
      name: "宝冠：副属性 1",
    });
    expect(
      within(crownSecondaryAttributeOne)
        .getAllByRole("option")
        .map((option) => option.textContent),
    ).toEqual([
      "体",
      "灵",
      "力",
      "耐",
      "敏",
      "气血",
      "法力",
      "物攻",
      "法攻",
      "物防",
      "法防",
      "速度",
      "物伤结果",
      "法伤结果",
      "物伤减免",
      "法伤减免",
      "暴击伤害（%）",
    ]);
    const garmentBaseAttributeTwo = within(dialog).getByRole("combobox", {
      name: "宝衣：装备属性 2",
    });
    expect(
      within(garmentBaseAttributeTwo).getByRole("option", { name: "气血" }),
    ).toBeInTheDocument();
    expect(
      within(
        within(dialog).getByRole("combobox", { name: "宝冠：装备属性 1" }),
      ).getByRole("option", { name: "气血" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("spinbutton", { name: /装备等级/ }),
    ).not.toBeInTheDocument();

    const garmentBaseAttributeOneValue = within(dialog).getByRole(
      "spinbutton",
      {
        name: "宝衣：装备属性 1 数值",
      },
    );
    await user.click(garmentBaseAttributeOneValue);
    await user.keyboard("6");
    expect(garmentBaseAttributeOneValue).toHaveFocus();
    await user.keyboard("5");
    expect(garmentBaseAttributeOneValue).toHaveValue(65);
    await user.selectOptions(garmentBaseAttributeTwo, "health");
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝衣：装备属性 2 数值",
      }),
      { target: { value: "107" } },
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝衣：启灵属性 1 数值",
      }),
      { target: { value: "10" } },
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "添加宝衣第 2 条启灵属性",
      }),
    );
    await user.selectOptions(
      within(dialog).getByRole("combobox", {
        name: "宝衣：启灵属性 2",
      }),
      "strength",
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝衣：启灵属性 2 数值",
      }),
      { target: { value: "8" } },
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝链：启灵属性 1 数值",
      }),
      { target: { value: "13" } },
    );
    await user.selectOptions(crownSecondaryAttributeOne, "magicalAttack");
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝冠：副属性 1 数值",
      }),
      { target: { value: "49" } },
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "添加宝冠第 2 条副属性",
      }),
    );
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "宝冠：副属性 2" }),
      "criticalDamagePercent",
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝冠：副属性 2 数值",
      }),
      { target: { value: "8" } },
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "添加宝冠第 3 条副属性",
      }),
    );
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "宝冠：副属性 3" }),
      "physicalDamageReduction",
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝冠：副属性 3 数值",
      }),
      { target: { value: "12" } },
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝冠：百炼属性数值",
      }),
      { target: { value: "21" } },
    );
    fireEvent.change(
      within(dialog).getByRole("textbox", { name: "宝冠：特效名称" }),
      { target: { value: "五行之水" } },
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝冠：特效修正 1 数值",
      }),
      { target: { value: "40" } },
    );
    await user.click(
      within(dialog).getByRole("button", {
        name: "添加宝冠第 2 条特效修正",
      }),
    );
    await user.selectOptions(
      within(dialog).getByRole("combobox", {
        name: "宝冠：特效修正 2",
      }),
      "strength",
    );
    fireEvent.change(
      within(dialog).getByRole("spinbutton", {
        name: "宝冠：特效修正 2 数值",
      }),
      { target: { value: "-20" } },
    );
    await user.click(within(dialog).getByRole("button", { name: "完成" }));

    expect(screen.getByText("物攻 +65")).toBeInTheDocument();
    expect(screen.getByText("气血 +107")).toBeInTheDocument();
    expect(screen.getByText("法攻 +49")).toBeInTheDocument();
    expect(screen.getByText("暴击伤害 +8%")).toBeInTheDocument();
    expect(screen.getByText("物伤减免 +12")).toBeInTheDocument();
    expect(screen.getByText("体 +10")).toBeInTheDocument();
    expect(screen.getByText("灵 +40")).toBeInTheDocument();
    expect(screen.getByText("力 +1")).toBeInTheDocument();

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem(SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY) ??
          "{}",
      );
      expect(stored.equipment.garment.baseAttributes[0].value).toBe(65);
      expect(stored.equipment.garment.baseAttributes[1]).toEqual({
        attribute: "health",
        value: 107,
      });
      expect(stored.equipment.crown.specialEffectName).toBe("五行之水");
      expect(stored.equipment.crown.secondaryAttributes[2]).toEqual({
        attribute: "physicalDamageReduction",
        value: 12,
      });
      expect(stored.equipment.crown.specialEffectAdjustments[1]).toEqual({
        attribute: "strength",
        value: -20,
      });
    });

    unmount();
    render(<SpiritBeastAttributeCalculator />);

    expect(screen.getByText("法攻 +49")).toBeInTheDocument();
    expect(screen.getByText("气血 +107")).toBeInTheDocument();
    expect(screen.getByText("物伤减免 +12")).toBeInTheDocument();
    expect(screen.getByText("力 +1")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "编辑装备" }));
    dialog = screen.getByRole("dialog", { name: "编辑装备" });
    expect(
      within(dialog).getByRole("textbox", { name: "宝冠：特效名称" }),
    ).toHaveValue("五行之水");
    expect(
      within(dialog).getByRole("spinbutton", {
        name: "宝冠：特效修正 2 数值",
      }),
    ).toHaveValue(-20);
    expect(dialog).not.toHaveTextContent("旧版装备汇总修正");
  });

  it("应该按三件装备各自的计入状态更新卡片数量", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    const equipmentCard = screen
      .getByRole("heading", { name: "装备" })
      .closest("article");
    expect(equipmentCard).not.toBeNull();
    expect(within(equipmentCard!).getByText("3/3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "编辑装备" }));
    const dialog = screen.getByRole("dialog", { name: "编辑装备" });
    await user.click(
      within(dialog).getByRole("checkbox", { name: "宝衣：计入装备" }),
    );
    await user.click(
      within(dialog).getByRole("checkbox", { name: "宝链：计入装备" }),
    );

    expect(within(equipmentCard!).getByText("1/3")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "完成" }));
    expect(within(equipmentCard!).getByText("1/3")).toBeInTheDocument();
  });

  it("应该继续显示并允许清理旧版装备汇总", async () => {
    window.localStorage.setItem(
      SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify({
        bonusSources: {
          equipment: {
            strength: 10,
          },
        },
      }),
    );
    const user = userEvent.setup();
    render(<SpiritBeastAttributeCalculator />);

    const equipmentCard = screen
      .getByRole("heading", { name: "装备" })
      .closest("article");
    expect(equipmentCard).not.toBeNull();
    expect(within(equipmentCard!).getByText("力 +10")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "编辑装备" }));

    const dialog = screen.getByRole("dialog", { name: "编辑装备" });
    expect(dialog).toHaveTextContent("旧版装备汇总修正");
    await user.click(within(dialog).getByRole("button", { name: "清空" }));

    expect(dialog).not.toHaveTextContent("旧版装备汇总修正");
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
