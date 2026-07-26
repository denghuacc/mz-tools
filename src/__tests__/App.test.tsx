import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import {
  loadPreferences,
  updatePreferences,
} from "../utils/preferences";
import {
  CHARACTER_ATTRIBUTES_STORAGE_KEY,
  CHARACTER_PROFILES_STORAGE_KEY,
  EQUIPMENT_ATTRIBUTES_STORAGE_KEY,
  LEGACY_EQUIPMENT_ATTRIBUTES_STORAGE_KEY,
} from "../utils/calculatorStorage";
import {
  EQUIPMENT_SLOTS,
  createInitialEquipmentCalculatorState,
  createInitialEquipmentSet,
} from "../utils/equipmentAttributes";

describe("App 组件", () => {
  it("应该渲染主应用", () => {
    render(<App />);

    // 验证应用容器
    const appContainer = document.querySelector(".min-h-screen");
    expect(appContainer).toBeInTheDocument();
    expect(appContainer).toHaveClass(
      "bg-gray-100",
      "py-0",
      "flex",
      "justify-center"
    );
  });

  it("应该包含 WeaponConverter 组件", () => {
    render(<App />);

    // 验证 WeaponConverter 组件的存在
    expect(
      screen.getByRole("heading", { name: "武器属性转换器" })
    ).toBeInTheDocument();
  });

  it("应该有正确的布局结构", () => {
    render(<App />);

    // 验证布局容器
    const container = document.querySelector(".min-h-screen.bg-gray-100");
    expect(container).toBeInTheDocument();

    // 验证内容居中
    expect(container).toHaveClass("flex", "justify-center");
  });

  it("应该渲染工具箱导航并默认打开计算器", () => {
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    expect(navigation).toBeInTheDocument();
    expect(within(navigation).getByRole("button", { name: "计算器" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByText("游戏数值计算")).toBeInTheDocument();
  });

  it("应该支持在导航页面之间切换", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(within(navigation).getByRole("button", { name: "首页" }));

    expect(screen.getByRole("heading", { name: "梦幻新诛仙实用工具" })).toBeInTheDocument();
    expect(screen.queryByText("游戏数值计算")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "进入计算器" }));

    expect(screen.getByText("游戏数值计算")).toBeInTheDocument();
  });

  it("首页入口应该打开资料和攻略模块", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(within(navigation).getByRole("button", { name: "首页" }));
    await user.click(screen.getByRole("button", { name: "查询资料" }));
    expect(
      screen.getByRole("heading", { name: "游戏资料查询" })
    ).toBeInTheDocument();

    await user.click(within(navigation).getByRole("button", { name: "首页" }));
    await user.click(screen.getByRole("button", { name: "浏览攻略" }));
    expect(
      screen.getByRole("heading", { name: "官方攻略索引" })
    ).toBeInTheDocument();
  });

  it("应该支持切换到戒指转换器", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "戒指转换" }));

    expect(screen.getByText("戒指属性转换器")).toBeInTheDocument();
    expect(screen.queryByText("武器属性转换器")).not.toBeInTheDocument();
    expect(loadPreferences().activeTool).toBe("ring");
  });

  it("应该支持切换到角色面板计算器", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole("tab", { name: "角色面板 (测试版)" })
    );

    expect(
      screen.getByRole("heading", { name: "基础属性 · 10 项" })
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("region", { name: "潜力点分配摘要" })
      ).getByText("10力")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "编辑潜力点分配" })
    );
    const allocationDialog = screen.getByRole("dialog", {
      name: "编辑潜力点分配",
    });
    expect(
      within(allocationDialog).getByRole("radiogroup", {
        name: "潜力点加点方案",
      })
    ).toBeInTheDocument();
    expect(
      within(allocationDialog).getByRole("radio", { name: "10力" })
    ).toHaveAttribute("aria-checked", "true");
    expect(loadPreferences().activeTool).toBe("character");
  });

  it("应该在角色面板后提供角色装备并把装备加成接入角色面板", async () => {
    const user = userEvent.setup();
    render(<App />);

    const calculatorTabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(calculatorTabs).toEqual([
      "武器转换",
      "戒指转换",
      "角色面板 (测试版)",
      "角色装备 (测试版)",
    ]);

    await user.click(
      screen.getByRole("tab", { name: "角色装备 (测试版)" })
    );
    expect(screen.getByRole("heading", { name: "装备总属性" })).toBeInTheDocument();
    expect(screen.getByText("8 / 8 件")).toBeInTheDocument();
    expect(loadPreferences().activeTool).toBe("equipment");

    await user.click(
      screen.getByRole("tab", { name: "角色面板 (测试版)" })
    );
    expect(
      screen.queryByRole("region", { name: "装备属性接入状态" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "计入装备值" })
    ).toBeChecked();
    expect(screen.getByText("装备 +138")).toBeInTheDocument();
  });

  it("应该保存三个角色存档并一键恢复角色面板和装备配置", async () => {
    const storedEquipmentState = createInitialEquipmentCalculatorState();
    storedEquipmentState.equipment.weapon = {
      ...storedEquipmentState.equipment.weapon,
      baseAttributes: {
        ...storedEquipmentState.equipment.weapon.baseAttributes,
        physicalAttack: 700,
      },
    };
    window.localStorage.setItem(
      CHARACTER_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify({ skillBonuses: { health: 100 } })
    );
    window.localStorage.setItem(
      EQUIPMENT_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify(storedEquipmentState)
    );
    updatePreferences({ activeTool: "character" });
    const user = userEvent.setup();
    render(<App />);

    const profileRegion = screen.getByRole("region", { name: "角色存档" });
    expect(
      within(profileRegion).getAllByRole("button", { name: /恢复存档/ })
    ).toHaveLength(3);
    expect(
      within(profileRegion).getByRole("button", { name: "恢复存档1" })
    ).toBeDisabled();

    const profileNameInput = within(profileRegion).getByRole("textbox", {
      name: "存档1名称",
    });
    await user.clear(profileNameInput);
    await user.type(profileNameInput, "鬼王69");
    await user.click(
      within(profileRegion).getByRole("button", {
        name: "保存当前到存档1",
      })
    );

    await waitFor(() => {
      const storedProfiles = JSON.parse(
        window.localStorage.getItem(CHARACTER_PROFILES_STORAGE_KEY) ?? "[]"
      );
      expect(storedProfiles[0].name).toBe("鬼王69");
      expect(storedProfiles[0].isActive).toBe(true);
      expect(storedProfiles[0].characterState.skillBonuses.health).toBe(100);
      expect(
        storedProfiles[0].equipmentState.equipment.weapon.baseAttributes
          .physicalAttack
      ).toBe(700);
      expect(storedProfiles.slice(1)).toEqual([null, null]);
    });
    expect(profileNameInput.closest("article")).toHaveAttribute(
      "aria-current",
      "true"
    );
    const profileNotice = within(profileRegion).getByRole("status");
    expect(profileNotice).toHaveTextContent(
      "已保存“鬼王69”的完整角色配置"
    );
    expect(profileNotice).toHaveClass("text-green-700");
    expect(profileNotice).not.toHaveClass("sr-only");

    await user.click(
      within(profileRegion).getByRole("button", { name: "覆盖保存存档1" })
    );
    expect(profileNotice).toHaveTextContent(
      "已覆盖“鬼王69”的完整角色配置"
    );

    const skillEditButton = screen.getByRole("button", { name: "编辑技能" });
    await user.click(skillEditButton);
    const skillDialog = screen.getByRole("dialog", { name: "编辑技能" });
    const healthInput = within(skillDialog).getByRole("spinbutton", {
      name: "技能：气血",
    });
    await user.clear(healthInput);
    await user.type(healthInput, "200");
    await user.click(within(skillDialog).getByRole("button", { name: "完成" }));
    await user.selectOptions(
      screen.getByRole("combobox", { name: "角色等级" }),
      "110"
    );

    await user.click(
      within(profileRegion).getByRole("button", { name: "恢复存档1" })
    );

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "已恢复“鬼王69”的完整角色配置"
      );
      expect(
        screen.getByRole("combobox", { name: "角色等级" })
      ).toHaveValue("69");
      expect(screen.getByText("+技能 100")).toBeInTheDocument();

      const restoredEquipmentState = JSON.parse(
        window.localStorage.getItem(EQUIPMENT_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(restoredEquipmentState.characterLevel).toBe(69);
      expect(
        restoredEquipmentState.equipment.weapon.baseAttributes.physicalAttack
      ).toBe(700);
    });
  });

  it("应该从本地偏好恢复上次使用的工具", () => {
    updatePreferences({ activeTool: "ring" });

    render(<App />);

    expect(screen.getByRole("tab", { name: "戒指转换" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("戒指属性转换器")).toBeInTheDocument();
  });

  it("应该支持桌面和移动导航打开资料栏目", async () => {
    const user = userEvent.setup();
    render(<App />);

    const desktopNavigation = screen.getByRole("navigation", {
      name: "主导航",
    });
    await user.click(
      within(desktopNavigation).getByRole("button", { name: "数据查询" })
    );
    expect(
      screen.getByRole("heading", { name: "游戏资料查询" })
    ).toBeInTheDocument();
    expect(screen.getByText("找到 13 个门派")).toBeInTheDocument();

    const mobileNavigation = screen.getByRole("navigation", {
      name: "移动端主导航",
    });
    await user.click(
      within(mobileNavigation).getByRole("button", { name: "攻略" })
    );
    expect(
      screen.getByRole("heading", { name: "官方攻略索引" })
    ).toBeInTheDocument();
    expect(screen.getByText("五周年新门派与年度战斗调整")).toBeInTheDocument();
  });

  it("应该支持搜索和筛选门派资料", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(
      within(navigation).getByRole("button", { name: "数据查询" })
    );
    await user.type(screen.getByLabelText("搜索门派或定位"), "持续治疗");

    expect(screen.getByText("找到 1 个门派")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "南疆古巫" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("搜索门派或定位"));
    await user.click(screen.getByRole("button", { name: "封印" }));
    expect(screen.getByText("找到 2 个门派")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "合欢门" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "长生堂" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("搜索门派或定位"));
    await user.type(screen.getByLabelText("搜索门派或定位"), "不存在的资料");
    expect(screen.getByText("没有匹配的资料")).toBeInTheDocument();
  });

  it("资料分类应该支持键盘焦点与回车切换", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(
      within(navigation).getByRole("button", { name: "数据查询" })
    );

    const sectTab = screen.getByRole("tab", { name: "门派" });
    const equipmentTab = screen.getByRole("tab", { name: "装备" });
    sectTab.focus();
    await user.tab();

    expect(equipmentTab).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(equipmentTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("搜索装备资料")).toBeInTheDocument();
  });

  it("应该查询、筛选并收藏装备和灵兽坐骑资料", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(
      within(navigation).getByRole("button", { name: "数据查询" })
    );

    await user.click(screen.getByRole("tab", { name: "装备" }));
    expect(screen.getByText("找到 5 条装备资料")).toBeInTheDocument();
    await user.type(screen.getByLabelText("搜索装备资料"), "赛年神装");
    expect(screen.getByText("找到 1 条装备资料")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "赛年神装" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "收藏赛年神装" }));

    await user.click(screen.getByRole("tab", { name: "灵兽与坐骑" }));
    expect(screen.getByText("找到 6 条灵兽与坐骑资料")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "坐骑" }));
    expect(screen.getByText("找到 3 条灵兽与坐骑资料")).toBeInTheDocument();
    await user.type(screen.getByLabelText("搜索灵兽或坐骑"), "速度支援");
    expect(screen.getByText("找到 1 条灵兽与坐骑资料")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "幻月仙" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "收藏幻月仙" }));

    await user.click(within(navigation).getByRole("button", { name: "收藏" }));
    expect(screen.getByRole("heading", { name: "装备资料" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "灵兽与坐骑资料" })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "赛年神装" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "幻月仙" })).toBeInTheDocument();
  });

  it("应该筛选并收藏官方攻略", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(within(navigation).getByRole("button", { name: "攻略" }));
    await user.click(screen.getByRole("button", { name: "坐骑" }));

    const title = "朱雀坐骑·涅离火技能介绍";
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "五周年新门派与年度战斗调整" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: `收藏${title}` }));
    await user.click(within(navigation).getByRole("button", { name: "收藏" }));
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: `取消收藏${title}` }));
    expect(screen.getByText("还没有收藏内容")).toBeInTheDocument();
  });

  it("应该收藏门派并在收藏页中管理", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(
      within(navigation).getByRole("button", { name: "数据查询" })
    );
    await user.click(screen.getByRole("button", { name: "收藏鬼王宗" }));
    expect(
      screen.getByRole("button", { name: "取消收藏鬼王宗" })
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(
      within(navigation).getByRole("button", { name: "收藏" })
    );
    expect(screen.getByRole("heading", { name: "我的收藏" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "鬼王宗" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "取消收藏鬼王宗" }));
    expect(screen.getByText("还没有收藏内容")).toBeInTheDocument();
  });

  it("应该在设置页管理本地收藏和计算器偏好", async () => {
    const user = userEvent.setup();
    updatePreferences({ activeTool: "ring" });
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(
      within(navigation).getByRole("button", { name: "设置" })
    );
    expect(screen.getByRole("heading", { name: "设置" })).toBeInTheDocument();
    expect(screen.getByText("FR69服明天")).toBeInTheDocument();
    expect(screen.getByText(/当前收藏 0 项/)).toBeInTheDocument();
    expect(screen.getByText(/角色面板和八件装备输入会保存在当前浏览器/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "清空收藏" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "重置计算器偏好" }));
    expect(screen.getByRole("status")).toHaveTextContent("计算器偏好已恢复默认值");
    expect(loadPreferences().activeTool).toBe("weapon");
  });

  it("应该从空收藏页浏览资料并在设置中清空收藏", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(within(navigation).getByRole("button", { name: "收藏" }));
    await user.click(screen.getByRole("button", { name: "浏览游戏资料" }));
    await user.click(screen.getByRole("button", { name: "收藏鬼王宗" }));

    await user.click(within(navigation).getByRole("button", { name: "设置" }));
    expect(screen.getByText(/当前收藏 1 项/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "清空收藏" }));
    expect(screen.getByRole("status")).toHaveTextContent("收藏已清空");
    expect(screen.getByRole("button", { name: "清空收藏" })).toBeDisabled();
  });

  it("应该保存装备、角色等级、宝石和独立词条并在重新加载后恢复", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(
      screen.getByRole("tab", { name: "角色面板 (测试版)" })
    );
    const characterLevelSelect = screen.getByRole("combobox", {
      name: "角色等级",
    });
    expect(
      within(characterLevelSelect)
        .getAllByRole("option")
        .map((option) => option.getAttribute("value"))
    ).toEqual(["69", "89", "110"]);
    await user.selectOptions(characterLevelSelect, "110");
    expect(screen.getByText("力 +1100")).toBeInTheDocument();
    expect(screen.getByText(/可分配潜力点 1100/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("tab", { name: "角色装备 (测试版)" })
    );
    expect(screen.getByText("当前角色 110 级")).toBeInTheDocument();
    expect(screen.getByText("宝石上限 14 级")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "编辑武器" }));
    const weaponDialog = screen.getByRole("dialog", { name: "编辑武器" });
    await user.selectOptions(
      within(weaponDialog).getByRole("combobox", { name: "武器：宝石类型" }),
      "diamond"
    );
    await user.selectOptions(
      within(weaponDialog).getByRole("combobox", { name: "武器：宝石等级" }),
      "14"
    );
    await user.click(
      within(weaponDialog).getByRole("checkbox", {
        name: /突破 · 额外提升 1 级/,
      })
    );
    await user.selectOptions(
      within(weaponDialog).getByRole("combobox", {
        name: "武器：独立词条",
      }),
      "龙吟"
    );
    await user.selectOptions(
      within(weaponDialog).getByRole("combobox", {
        name: "武器：独立词条等级",
      }),
      "6"
    );
    const physicalAttackInput = within(weaponDialog).getByRole("spinbutton", {
      name: "武器：物攻",
    });
    await user.clear(physicalAttackInput);
    await user.type(physicalAttackInput, "700");

    await waitFor(() => {
      const storedState = JSON.parse(
        window.localStorage.getItem(EQUIPMENT_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(storedState.characterLevel).toBe(110);
      expect(storedState.equipment.weapon.baseAttributes.physicalAttack).toBe(700);
      expect(storedState.equipment.weapon.gem).toEqual({
        type: "diamond",
        level: 14,
        breakthrough: true,
      });
      expect(storedState.equipment.weapon.independentAffix).toEqual({
        name: "龙吟",
        level: 6,
      });
      expect(Object.keys(storedState.equipment).sort()).toEqual(
        [
          "weapon",
          "armor",
          "headgear",
          "lowerGarment",
          "accessory",
          "shoes",
          "ring",
          "necklace",
        ].sort()
      );
    });

    unmount();
    render(<App />);

    expect(
      screen.getByRole("tab", { name: "角色装备 (测试版)" })
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("当前角色 110 级")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "编辑武器" }));
    const restoredDialog = screen.getByRole("dialog", { name: "编辑武器" });
    expect(
      within(restoredDialog).getByRole("spinbutton", { name: "武器：物攻" })
    ).toHaveValue(700);
    expect(
      within(restoredDialog).getByRole("combobox", { name: "武器：宝石类型" })
    ).toHaveValue("diamond");
    expect(
      within(restoredDialog).getByRole("combobox", { name: "武器：宝石等级" })
    ).toHaveValue("14");
    expect(
      within(restoredDialog).getByRole("checkbox", {
        name: /突破 · 额外提升 1 级/,
      })
    ).toBeChecked();
    expect(
      within(restoredDialog).getByRole("combobox", {
        name: "武器：独立词条",
      })
    ).toHaveValue("龙吟");
    expect(
      within(restoredDialog).getByRole("combobox", {
        name: "武器：独立词条等级",
      })
    ).toHaveValue("6");
  });

  it("应该把 v1 装备缓存迁移到包含角色等级的 v2 状态", async () => {
    const legacyEquipment = createInitialEquipmentSet();
    legacyEquipment.weapon = {
      ...legacyEquipment.weapon,
      baseAttributes: {
        ...legacyEquipment.weapon.baseAttributes,
        physicalAttack: 701,
      },
    };
    const legacyStoredEquipment = Object.fromEntries(
      EQUIPMENT_SLOTS.map((slot) => [
        slot,
        { ...legacyEquipment[slot], gem: undefined },
      ])
    );
    window.localStorage.setItem(
      LEGACY_EQUIPMENT_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify(legacyStoredEquipment)
    );
    updatePreferences({ activeTool: "equipment" });

    render(<App />);

    expect(screen.getByText("当前角色 69 级")).toBeInTheDocument();
    await userEvent.setup().click(
      screen.getByRole("button", { name: "编辑武器" })
    );
    expect(
      within(screen.getByRole("dialog", { name: "编辑武器" })).getByRole(
        "spinbutton",
        { name: "武器：物攻" }
      )
    ).toHaveValue(701);

    await waitFor(() => {
      const migratedState = JSON.parse(
        window.localStorage.getItem(EQUIPMENT_ATTRIBUTES_STORAGE_KEY) ?? "{}"
      );
      expect(migratedState.characterLevel).toBe(69);
      expect(migratedState.equipment.weapon.baseAttributes.physicalAttack).toBe(701);
    });
  });
});
