import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import {
  loadPreferences,
  updatePreferences,
} from "../utils/preferences";

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
    expect(screen.getByText("装备数值计算")).toBeInTheDocument();
  });

  it("应该支持在导航页面之间切换", async () => {
    const user = userEvent.setup();
    render(<App />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    await user.click(within(navigation).getByRole("button", { name: "首页" }));

    expect(screen.getByRole("heading", { name: "梦幻新诛仙实用工具" })).toBeInTheDocument();
    expect(screen.queryByText("装备数值计算")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "进入计算器" }));

    expect(screen.getByText("装备数值计算")).toBeInTheDocument();
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
    expect(screen.getByText(/当前收藏 0 项/)).toBeInTheDocument();
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
});
