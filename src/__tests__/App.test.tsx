import { render, screen } from "@testing-library/react";
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
});
