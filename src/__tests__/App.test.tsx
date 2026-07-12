import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

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
    expect(screen.getByText("梦幻新诛仙")).toBeInTheDocument();
    expect(screen.getByText("武器属性转换器")).toBeInTheDocument();
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

  it("应该支持切换到戒指转换器", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("tab", { name: "戒指转换" }));

    expect(screen.getByText("戒指属性转换器")).toBeInTheDocument();
    expect(screen.queryByText("武器属性转换器")).not.toBeInTheDocument();
  });
});
