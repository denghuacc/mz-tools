import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeaponConverter from "../components/WeaponConverter";

describe("转换结果UI增强功能", () => {
  beforeEach(() => {
    render(<WeaponConverter />);
  });

  it("应该显示属性变化量（正变化）", async () => {
    const user = userEvent.setup();

    // 输入属性值 - 创造明显的变化
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "300"); // 物攻：300/665 ≈ 0.45
    await user.type(inputs[2], "180"); // 法攻：180/210 ≈ 0.86
    await user.type(inputs[4], "100"); // 治疗：100/192 ≈ 0.52

    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 应该显示变化量指示器
    // 法攻应该增加（物攻比例0.45 -> 法攻最大值210 * 0.45 ≈ 95，所以法攻从180变为95是减少）
    // 物攻应该增加（法攻比例0.86 -> 物攻最大值665 * 0.86 ≈ 572，所以物攻从300变为572是增加）
    const changeIndicators = screen.getAllByText(/[+-]\d+/);
    expect(changeIndicators.length).toBeGreaterThan(0);
  });

  it("应该显示属性变化量（负变化）", async () => {
    const user = userEvent.setup();

    // 输入属性值 - 创造相反的变化
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "600"); // 物攻：600/665 ≈ 0.90
    await user.type(inputs[2], "50"); // 法攻：50/210 ≈ 0.24
    await user.type(inputs[4], "100"); // 治疗：100/192 ≈ 0.52

    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 应该显示变化量指示器
    const changeIndicators = screen.getAllByText(/[+-]\d+/);
    expect(changeIndicators.length).toBeGreaterThan(0);
  });

  it("执行换算后结果相同时应该说明换算结果一致", async () => {
    const user = userEvent.setup();

    // 输入完全相同比例的属性值（确保变化为0）
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "333"); // 物攻：333/665 = 0.5
    await user.type(inputs[2], "105"); // 法攻：105/210 = 0.5
    await user.type(inputs[4], "96"); // 治疗：96/192 = 0.5

    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    expect(screen.getByText(/换算结果一致/)).toBeInTheDocument();
    expect(screen.getByText(/换算过程已执行/)).toBeInTheDocument();
  });

  it("封印造型导致属性不变时应该说明转换规则", async () => {
    const user = userEvent.setup();
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "500");
    await user.type(inputs[2], "150");
    await user.type(inputs[4], "120");
    await user.selectOptions(screen.getByLabelText("原造型"), "短刃");

    await user.click(screen.getByRole("button", { name: "转换" }));

    expect(await screen.findByText(/属性保持不变/)).toBeInTheDocument();
    expect(screen.getByText(/涉及封印造型/)).toBeInTheDocument();
  });

  it("同属性类型转换时应该说明无需调整数值", async () => {
    const user = userEvent.setup();
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "500");
    await user.type(inputs[2], "150");
    await user.type(inputs[4], "120");
    await user.selectOptions(screen.getByLabelText("目标造型"), "魔神殿");

    await user.click(screen.getByRole("button", { name: "转换" }));

    expect(await screen.findByText(/属性保持不变/)).toBeInTheDocument();
    expect(screen.getByText(/同一属性类型/)).toBeInTheDocument();
  });

  it("当转换变化明显时应该显示正常提示", async () => {
    const user = userEvent.setup();

    // 输入差异较大的属性值
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "200"); // 物攻：200/665 ≈ 0.30
    await user.type(inputs[2], "180"); // 法攻：180/210 ≈ 0.86
    await user.type(inputs[4], "50"); // 治疗：50/192 ≈ 0.26

    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 结果误差提示应该始终显示
    expect(
      screen.getByText(/结果可能与游戏实际数值存在少量误差/)
    ).toBeInTheDocument();

    // 数值发生变化时不需要额外解释
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("变化量为0时应该显示无变化指示器", async () => {
    const user = userEvent.setup();

    // 输入完全相同比例的属性值（理论上不会有变化）
    const inputs = screen.getAllByRole("spinbutton");
    await user.type(inputs[0], "333"); // 物攻：333/665 = 0.5
    await user.type(inputs[2], "105"); // 法攻：105/210 = 0.5
    await user.type(inputs[4], "96"); // 治疗：96/192 = 0.5

    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 应该使用弱化的短横线显示无变化
    const zeroChangeIndicators = screen.getAllByLabelText("无变化");
    expect(zeroChangeIndicators.length).toBeGreaterThanOrEqual(1);
  });
});
