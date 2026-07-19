import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EquipmentCalculator from "../EquipmentCalculator";
import { createInitialEquipmentCalculatorState } from "../../utils/equipmentAttributes";

const EquipmentCalculatorHarness = () => {
  const [state, setState] = useState(createInitialEquipmentCalculatorState);

  return <EquipmentCalculator state={state} onChange={setState} />;
};

describe("EquipmentCalculator", () => {
  it("应该按固定顺序展示八件装备和截图示例总属性", () => {
    render(<EquipmentCalculatorHarness />);

    expect(screen.getByRole("heading", { name: "装备总属性" })).toBeInTheDocument();
    expect(screen.getByText("8 / 8 件")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^编辑/ })).toHaveLength(8);

    const cards = screen.getByRole("heading", { name: "八件装备" })
      .closest("section");
    expect(cards).not.toBeNull();
    expect(
      within(cards!).getAllByRole("heading", { level: 3 }).map((heading) =>
        heading.textContent
      )
    ).toEqual(["武器", "上衣", "发冠", "下装", "饰品", "鞋子", "戒指", "项链"]);

    const weaponCard = within(cards!).getByRole("heading", { name: "武器" })
      .closest("article");
    expect(weaponCard).not.toBeNull();
    expect(weaponCard).toHaveTextContent("力 +33");
    expect(weaponCard).toHaveTextContent("敏 +32");
  });

  it("应该按装备部位选择一种宝石并把等级属性计入汇总", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    expect(screen.getByRole("spinbutton", { name: "角色等级" })).toHaveValue(69);
    expect(screen.getByText("宝石上限 8 级")).toBeInTheDocument();

    const weaponCard = screen.getByRole("heading", { name: "武器" })
      .closest("article");
    expect(weaponCard).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "编辑武器" }));
    const dialog = screen.getByRole("dialog", { name: "编辑武器" });
    const gemType = within(dialog).getByRole("combobox", {
      name: "武器：宝石类型",
    });
    const gemLevel = within(dialog).getByRole("combobox", {
      name: "武器：宝石等级",
    });
    const breakthrough = within(dialog).getByRole("checkbox", {
      name: /突破 · 额外提升 1 级/,
    });

    expect(
      within(gemType).getAllByRole("option").map((option) => option.getAttribute("value"))
    ).toEqual(["", "diamond", "aquamarine", "jade", "amethyst"]);
    expect(gemLevel).toBeDisabled();
    expect(breakthrough).toBeDisabled();

    await user.selectOptions(gemType, "diamond");
    await user.selectOptions(gemLevel, "8");

    expect(gemLevel).toBeEnabled();
    expect(breakthrough).toBeEnabled();
    expect(within(gemLevel).getAllByRole("option")).toHaveLength(8);
    expect(dialog).toHaveTextContent("金刚石（8 级）提供物攻 +96");
    expect(weaponCard).toHaveTextContent("物攻 +810");
    expect(weaponCard).toHaveTextContent("金刚石 · 8级");
    const equipmentSummary = screen.getByRole("heading", {
      name: "装备总属性",
    }).closest("section");
    expect(equipmentSummary).not.toBeNull();
    const gemSummary = within(equipmentSummary!).getByText("宝石 +96");
    const physicalAttackTotal = within(equipmentSummary!).getByText("+852");
    expect(gemSummary).toBeInTheDocument();
    expect(gemSummary.nextElementSibling).toBe(physicalAttackTotal);
    expect(physicalAttackTotal).toHaveClass("text-slate-900", "font-semibold");

    await user.click(breakthrough);

    expect(dialog).toHaveTextContent("金刚石（8+1 级）提供物攻 +108");
    expect(weaponCard).toHaveTextContent("物攻 +822");
    expect(weaponCard).toHaveTextContent("金刚石 · 8+1级");
    expect(within(equipmentSummary!).getByText("宝石 +108")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("checkbox", { name: /成长/ }));

    expect(dialog).toHaveTextContent("金刚石（8+1 级）提供物攻 +129.6");
    expect(weaponCard).toHaveTextContent("物攻 +843.6");
    expect(
      within(equipmentSummary!).getByText("宝石 +129.6")
    ).toBeInTheDocument();
  });

  it("应该在 105 级切换宝石上限并在降低角色等级时收紧已选等级", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    const characterLevel = screen.getByRole("spinbutton", { name: "角色等级" });
    await user.clear(characterLevel);
    await user.type(characterLevel, "105");
    await user.tab();

    expect(characterLevel).toHaveValue(105);
    expect(screen.getByText("宝石上限 13 级")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "编辑鞋子" }));
    const dialog = screen.getByRole("dialog", { name: "编辑鞋子" });
    const gemType = within(dialog).getByRole("combobox", {
      name: "鞋子：宝石类型",
    });
    const gemLevel = within(dialog).getByRole("combobox", {
      name: "鞋子：宝石等级",
    });
    await user.selectOptions(gemType, "amethyst");
    await user.selectOptions(gemLevel, "13");

    expect(gemLevel).toHaveValue("13");

    await user.clear(characterLevel);
    await user.type(characterLevel, "104");
    await user.tab();

    expect(characterLevel).toHaveValue(104);
    expect(screen.getByText("宝石上限 12 级")).toBeInTheDocument();
    expect(gemLevel).toHaveValue("12");
  });

  it("应该将一至两条附加五维与百炼分开编辑和汇总", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    await user.click(screen.getByRole("button", { name: "编辑武器" }));
    const dialog = screen.getByRole("dialog", { name: "编辑武器" });

    expect(
      within(dialog)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual([
      "武器状态",
      "装备属性",
      "附加五维与百炼",
      "独立词条",
      "宝石",
      "铸灵属性",
      "加持",
      "特效与特技",
    ]);
    expect(within(dialog).queryByText("其它词条")).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "添加词条" })
    ).not.toBeInTheDocument();
    expect(
      within(
        within(dialog).getByRole("combobox", { name: "武器：独立词条" })
      )
        .getAllByRole("option")
        .map((option) => option.textContent)
    ).toEqual([
      "未出现独立词条",
      "岐黄 · 治疗强度 +6/级",
      "龙吟 · 法攻 +6/级",
      "罗刹 · 物攻 +6/级",
      "囚牢 · 封印命中 +1/级",
    ]);

    expect(
      within(dialog).getByRole("combobox", { name: "武器：附加五维 1" })
    ).toHaveValue("strength");
    expect(
      within(dialog).getByRole("spinbutton", { name: "附加五维 1 数值" })
    ).toHaveValue(33);
    expect(
      within(dialog).getByRole("combobox", { name: "武器：附加五维 2" })
    ).toHaveValue("agility");
    expect(
      within(dialog).getByRole("spinbutton", { name: "附加五维 2 数值" })
    ).toHaveValue(32);
    expect(
      within(dialog).getByRole("spinbutton", { name: "武器：百炼数值" })
    ).toHaveValue(25);

    const firstPrimaryAttribute = within(dialog).getByRole("combobox", {
      name: "武器：附加五维 1",
    });
    const secondPrimaryAttribute = within(dialog).getByRole("combobox", {
      name: "武器：附加五维 2",
    });
    expect(
      within(firstPrimaryAttribute).getByRole("option", { name: "敏" })
    ).toBeDisabled();
    expect(
      within(secondPrimaryAttribute).getByRole("option", { name: "力" })
    ).toBeDisabled();

    const temperingAttribute = within(dialog).getByRole("combobox", {
      name: "武器：百炼属性",
    });
    expect(
      within(temperingAttribute).getByRole("option", { name: "力" })
    ).toBeEnabled();
  });

  it("应该编辑 1～6 级独立词条并把已收录属性计入面板", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    const shoesCard = screen.getByRole("heading", { name: "鞋子" })
      .closest("article");
    expect(shoesCard).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "编辑鞋子" }));
    const dialog = screen.getByRole("dialog", { name: "编辑鞋子" });
    const affixName = within(dialog).getByRole("combobox", {
      name: "鞋子：独立词条",
    });
    const affixLevel = within(dialog).getByRole("combobox", {
      name: "鞋子：独立词条等级",
    });

    expect(affixLevel).toBeDisabled();
    expect(
      within(affixName)
        .getAllByRole("option")
        .map((option) => option.textContent)
    ).toEqual(["未出现独立词条", "扶摇 · 抗封 +1/级"]);
    expect(
      within(affixLevel)
        .getAllByRole("option")
        .map((option) => option.textContent)
    ).toEqual(["1 级", "2 级", "3 级", "4 级", "5 级", "6 级"]);

    await user.selectOptions(affixName, "扶摇");
    await user.selectOptions(affixLevel, "3");

    expect(dialog).toHaveTextContent("当前提供抗封 +3");
    expect(shoesCard).toHaveTextContent("扶摇 · 3级");
    expect(shoesCard).toHaveTextContent("抗封 +3");
    expect(screen.getByText("词条 +3")).toBeInTheDocument();
  });

  it("应该限制加持五维不能与普通附加五维重复", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    await user.click(screen.getByRole("button", { name: "编辑上衣" }));
    const dialog = screen.getByRole("dialog", { name: "编辑上衣" });
    expect(
      within(dialog).queryByRole("heading", { name: "独立词条" })
    ).not.toBeInTheDocument();
    const supportAttribute = within(dialog).getByRole("combobox", {
      name: "上衣：加持属性",
    });

    expect(supportAttribute).toHaveValue("endurance");
    expect(
      within(supportAttribute).getByRole("option", { name: "体" })
    ).toBeDisabled();
    expect(
      within(supportAttribute).queryByRole("option", { name: "物攻" })
    ).not.toBeInTheDocument();
  });

  it("应该编辑装备面板值并实时更新总属性", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    await user.click(screen.getByRole("button", { name: "编辑武器" }));
    const dialog = screen.getByRole("dialog", { name: "编辑武器" });
    const physicalAttackInput = within(dialog).getByRole("spinbutton", {
      name: "武器：物攻",
    });

    await user.clear(physicalAttackInput);
    await user.type(physicalAttackInput, "700");

    expect(screen.getByText("+799")).toBeInTheDocument();
  });

  it("应该将鞋子疾风作为速度百分比汇总", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    await user.click(screen.getByRole("button", { name: "编辑鞋子" }));
    const dialog = screen.getByRole("dialog", { name: "编辑鞋子" });
    await user.click(
      within(dialog).getByRole("checkbox", { name: /疾风/ })
    );

    expect(screen.getAllByText("+3%")).toHaveLength(2);
  });

  it("应该按赛年神装规则编辑戒指并切换职业对应属性", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    const cards = screen.getByRole("heading", { name: "八件装备" })
      .closest("section");
    expect(cards).not.toBeNull();
    const ringCard = within(cards!).getByRole("heading", { name: "戒指" })
      .closest("article");
    expect(ringCard).not.toBeNull();
    expect(ringCard).toHaveTextContent("全等级 · 已计入");
    expect(ringCard).toHaveTextContent("赛年神装");

    await user.click(screen.getByRole("button", { name: "编辑戒指" }));
    const dialog = screen.getByRole("dialog", { name: "编辑戒指" });

    expect(
      within(dialog)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual(["戒指状态", "装备属性", "百炼与副属性", "神装特效"]);
    expect(within(dialog).getByText("全等级装备")).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("spinbutton", { name: "戒指：装备等级" })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("heading", { name: "宝石" })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("heading", { name: "铸灵属性" })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("heading", { name: "加持" })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("heading", { name: "特效与特技" })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("textbox", { name: "戒指：特技" })
    ).not.toBeInTheDocument();
    expect(
      within(dialog).getByRole("combobox", { name: "戒指：副属性 1" })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("combobox", { name: "戒指：神装特效" })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("combobox", { name: "戒指：神装特效等级" })
    ).toBeDisabled();

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "戒指：职业对应属性" }),
      "magicAttack"
    );
    expect(
      within(dialog).getByRole("spinbutton", { name: "戒指：法攻" })
    ).toHaveValue(18);
    expect(ringCard).toHaveTextContent("法攻 +43");
    expect(ringCard).not.toHaveTextContent("物攻 +42");
  });

  it("应该按等级计算疾风神固并展示同名特效共鸣档位", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    const ringCard = screen.getByRole("heading", { name: "戒指" })
      .closest("article");
    expect(ringCard).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "编辑戒指" }));
    const ringDialog = screen.getByRole("dialog", { name: "编辑戒指" });
    const ringEffect = within(ringDialog).getByRole("combobox", {
      name: "戒指：神装特效",
    });
    const ringEffectLevel = within(ringDialog).getByRole("combobox", {
      name: "戒指：神装特效等级",
    });

    expect(
      within(ringEffect).getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["未配置", "疾风神固"]);
    expect(ringEffectLevel).toBeDisabled();
    expect(
      within(ringEffectLevel).getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["请选择特效", "1 级", "2 级", "3 级", "4 级", "5 级"]);

    await user.selectOptions(ringEffect, "疾风神固");

    expect(ringEffectLevel).toBeEnabled();
    expect(ringEffectLevel).toHaveValue("1");
    expect(ringDialog).toHaveTextContent("当前提供速度 +10");
    expect(ringCard).toHaveTextContent("速度 +10");
    expect(ringCard).toHaveTextContent("疾风神固 · 1级");

    await user.selectOptions(ringEffectLevel, "5");

    expect(ringDialog).toHaveTextContent("当前提供速度 +50");
    expect(ringCard).toHaveTextContent("速度 +50");
    await user.click(within(ringDialog).getByRole("button", { name: "完成" }));

    await user.click(screen.getByRole("button", { name: "编辑项链" }));
    const necklaceDialog = screen.getByRole("dialog", { name: "编辑项链" });
    await user.selectOptions(
      within(necklaceDialog).getByRole("combobox", {
        name: "项链：神装特效",
      }),
      "疾风神固"
    );
    await user.selectOptions(
      within(necklaceDialog).getByRole("combobox", {
        name: "项链：神装特效等级",
      }),
      "3"
    );

    const resonance = screen.getByRole("heading", { name: "神装共鸣" })
      .closest("section");
    expect(resonance).not.toBeNull();
    expect(resonance).toHaveTextContent(
      "疾风神固等级和 8：已达成 8 级共鸣，下一档 9 级。"
    );
    expect(resonance).toHaveTextContent("共鸣套装属性待复核");
  });

  it("应该允许赛年神装选择一至三条互不重复的副属性", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    await user.click(screen.getByRole("button", { name: "编辑戒指" }));
    const dialog = screen.getByRole("dialog", { name: "编辑戒指" });
    const firstAffix = within(dialog).getByRole("combobox", {
      name: "戒指：副属性 1",
    });
    const secondAffix = within(dialog).getByRole("combobox", {
      name: "戒指：副属性 2",
    });

    expect(
      within(dialog).queryByRole("combobox", { name: "戒指：副属性条数" })
    ).not.toBeInTheDocument();
    expect(
      within(firstAffix).getByRole("option", { name: "法攻" })
    ).toBeDisabled();
    expect(
      within(secondAffix).getByRole("option", { name: "物攻" })
    ).toBeDisabled();
    for (const label of [
      "法伤减免",
      "物伤减免",
      "封印命中",
      "抗封",
      "闪避",
    ]) {
      expect(
        within(firstAffix).getByRole("option", { name: label })
      ).toBeInTheDocument();
    }

    const thirdAffix = within(dialog).getByRole("combobox", {
      name: "戒指：副属性 3",
    });
    await user.selectOptions(firstAffix, "sealHit");
    await user.selectOptions(secondAffix, "sealResistance");
    await user.selectOptions(thirdAffix, "dodgeRate");

    for (const [name, value] of [
      ["副属性 1 数值", "12"],
      ["副属性 2 数值", "8"],
      ["副属性 3 数值", "3"],
    ] as const) {
      const input = within(dialog).getByRole("spinbutton", { name });
      await user.clear(input);
      await user.type(input, value);
    }

    const panelSummary = screen.getByRole("heading", {
      name: "面板属性",
    }).parentElement;
    const combatSummary = screen.getByRole("heading", {
      name: "战斗属性",
    }).parentElement;
    expect(panelSummary).not.toBeNull();
    expect(combatSummary).not.toBeNull();
    expect(within(panelSummary!).getByText("封印命中")).toBeInTheDocument();
    expect(within(panelSummary!).getByText("抗封")).toBeInTheDocument();
    expect(within(panelSummary!).getByText("闪避")).toBeInTheDocument();
    expect(within(panelSummary!).getByText("+3%")).toBeInTheDocument();
    expect(within(combatSummary!).queryByText("封印命中")).not.toBeInTheDocument();
    expect(within(combatSummary!).queryByText("抗封")).not.toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "删除戒指副属性 3" })
    );
    await user.click(
      within(dialog).getByRole("button", { name: "删除戒指副属性 2" })
    );

    expect(
      within(dialog).getAllByRole("combobox", {
        name: /^戒指：副属性 \d+$/,
      })
    ).toHaveLength(1);
    expect(
      within(dialog).getByRole("button", { name: "删除戒指副属性 1" })
    ).toBeDisabled();

    await user.click(
      within(dialog).getByRole("button", { name: "添加副属性" })
    );
    await user.click(
      within(dialog).getByRole("button", { name: "添加副属性" })
    );

    const selectedAttributes = within(dialog)
      .getAllByRole("combobox", { name: /^戒指：副属性 \d+$/ })
      .map((select) => (select as HTMLSelectElement).value);
    expect(new Set(selectedAttributes).size).toBe(3);
  });

  it("应该从气血、物防、法防中为项链选择两条不重复属性", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    const cards = screen.getByRole("heading", { name: "八件装备" })
      .closest("section");
    expect(cards).not.toBeNull();
    const necklaceCard = within(cards!).getByRole("heading", { name: "项链" })
      .closest("article");
    expect(necklaceCard).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "编辑项链" }));
    const dialog = screen.getByRole("dialog", { name: "编辑项链" });
    const firstAttribute = within(dialog).getByRole("combobox", {
      name: "项链：装备属性 1",
    });
    const secondAttribute = within(dialog).getByRole("combobox", {
      name: "项链：装备属性 2",
    });

    expect(firstAttribute).toHaveValue("health");
    expect(secondAttribute).toHaveValue("physicalDefense");
    expect(
      within(firstAttribute).getByRole("option", { name: "物防" })
    ).toBeDisabled();
    expect(
      within(secondAttribute).getByRole("option", { name: "气血" })
    ).toBeDisabled();

    await user.selectOptions(firstAttribute, "magicDefense");

    expect(
      within(dialog).getByRole("combobox", { name: "项链：装备属性 1" })
    ).toHaveValue("magicDefense");
    expect(
      within(dialog).getByRole("spinbutton", {
        name: "项链：装备属性 1 数值",
      })
    ).toHaveValue(99);
    expect(necklaceCard).toHaveTextContent("法防 +112");
    expect(necklaceCard).not.toHaveTextContent("气血 +99");
  });

  it("应该为上衣配置固定增加 3 点的系别亲和特效", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    const cards = screen.getByRole("heading", { name: "八件装备" })
      .closest("section");
    expect(cards).not.toBeNull();
    const armorCard = within(cards!).getByRole("heading", { name: "上衣" })
      .closest("article");
    expect(armorCard).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "编辑上衣" }));
    const dialog = screen.getByRole("dialog", { name: "编辑上衣" });
    await user.click(
      within(dialog).getByRole("checkbox", { name: /系别亲和/ })
    );
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "上衣：系别亲和" }),
      "electricAffinity"
    );

    expect(armorCard).toHaveTextContent("电系亲和 +3");
    const affinitySummary = screen.getByRole("heading", {
      name: "元素亲和",
    }).parentElement;
    expect(affinitySummary).not.toBeNull();
    expect(within(affinitySummary!).getByText("电系亲和")).toBeInTheDocument();
    expect(within(affinitySummary!).getByText("+3")).toBeInTheDocument();
  });

  it("应该将加持计入基础装备最多两个特效的限制", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    await user.click(screen.getByRole("button", { name: "编辑鞋子" }));
    const dialog = screen.getByRole("dialog", { name: "编辑鞋子" });
    const blessing = within(dialog).getByRole("checkbox", { name: /祝福/ });
    const growth = within(dialog).getByRole("checkbox", { name: /成长/ });
    const gale = within(dialog).getByRole("checkbox", { name: /疾风/ });
    const customEffect = within(dialog).getByRole("textbox", {
      name: "鞋子：其它特效",
    });
    const customEffectAttribute = within(dialog).getByRole("checkbox", {
      name: "其它特效提供属性",
    });
    const specialSkill = within(dialog).getByRole("textbox", {
      name: "鞋子：特技",
    });
    const support = within(dialog).getByRole("checkbox", {
      name: "这件装备拥有加持",
    });

    expect(support).toBeChecked();
    expect(within(dialog).getByText("1 / 2")).toBeInTheDocument();
    await user.click(blessing);

    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
    expect(growth).toBeDisabled();
    expect(gale).toBeDisabled();
    expect(customEffect).toBeDisabled();
    expect(customEffectAttribute).toBeDisabled();
    expect(specialSkill).toBeEnabled();
    expect(
      within(dialog).getAllByRole("textbox", { name: "鞋子：特技" })
    ).toHaveLength(1);

    await user.click(blessing);

    expect(growth).toBeEnabled();
    expect(gale).toBeEnabled();
    expect(customEffect).toBeEnabled();
    expect(customEffectAttribute).toBeEnabled();
  });

  it("应该为饰品配置增加 5% 气血的体魄特效", async () => {
    const user = userEvent.setup();
    render(<EquipmentCalculatorHarness />);

    const cards = screen.getByRole("heading", { name: "八件装备" })
      .closest("section");
    expect(cards).not.toBeNull();
    const accessoryCard = within(cards!).getByRole("heading", {
      name: "饰品",
    }).closest("article");
    expect(accessoryCard).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "编辑饰品" }));
    const dialog = screen.getByRole("dialog", { name: "编辑饰品" });
    await user.click(
      within(dialog).getByRole("checkbox", { name: /体魄/ })
    );

    expect(accessoryCard).toHaveTextContent("体魄 · 气血 +5%");
    expect(screen.getAllByText("+5%")).toHaveLength(2);
  });
});
