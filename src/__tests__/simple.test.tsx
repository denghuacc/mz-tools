import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("简单测试", () => {
  beforeEach(() => {
    render(<App />);
  });

  it("应该渲染转换器标题", () => {
    expect(
      screen.getByRole("heading", { name: "武器属性转换器" })
    ).toBeInTheDocument();
  });

  it("应该渲染基本UI元素", () => {
    // 验证基本元素存在
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(3);

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs.length).toBeGreaterThanOrEqual(3);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("应该渲染武器等级选择器", () => {
    const levelSelect = screen.getAllByRole("combobox")[0];
    expect(levelSelect).toBeInTheDocument();
    expect(levelSelect).toHaveValue("60");
  });

  it("应该渲染门派选择器", () => {
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(3);

    // 验证门派选择器存在
    selects.forEach((select) => {
      expect(select).toBeInTheDocument();
    });
  });

  it("应该渲染属性输入框", () => {
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs.length).toBeGreaterThanOrEqual(3);

    // 验证输入框存在
    inputs.forEach((input) => {
      expect(input).toBeInTheDocument();
    });
  });

  it("应该渲染转换和重置按钮", () => {
    expect(screen.getByRole("button", { name: "转换" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重置" })).toBeInTheDocument();
  });

  it("应该允许用户输入属性值", async () => {
    const user = userEvent.setup();
    const inputs = screen.getAllByRole("spinbutton");

    await user.type(inputs[0], "500");
    expect(inputs[0]).toHaveValue(500);
  });

  it("应该允许用户选择武器等级", async () => {
    const user = userEvent.setup();
    const levelSelect = screen.getAllByRole("combobox")[0];

    await user.selectOptions(levelSelect, "110");
    expect(levelSelect).toHaveValue("110");
  });

  it("应该在点击转换按钮时触发转换", async () => {
    const user = userEvent.setup();
    const convertButton = screen.getByRole("button", { name: "转换" });

    // 输入一些属性值
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "500");
    await user.type(inputs[2], "150");
    await user.type(inputs[4], "100");

    await user.click(convertButton);

    // 验证转换结果或错误信息出现
    await waitFor(() => {
      const hasResult = screen.queryByText("转换结果");
      const hasError = screen.queryByText(/请完整输入|不能超过最大值/);
      expect(hasResult || hasError).toBeTruthy();
    });
  });
});
