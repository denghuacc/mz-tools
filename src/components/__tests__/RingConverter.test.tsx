import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RingConverter from "../RingConverter";
import { updatePreferences } from "../../utils/preferences";

describe("RingConverter 组件", () => {
  it("应该展示当前职业对应的第二主属性且不限制固定上限", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    expect(
      screen.getByText("戒指为全等级装备，属性值会随角色等级自动成长。"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("物攻当前值")).not.toHaveAttribute("max");

    await user.selectOptions(screen.getByLabelText("当前门派"), "天音寺");

    expect(screen.getByLabelText("速度当前值")).not.toHaveAttribute("max");
  });

  it("应该允许清空数值输入", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    const healthInput = screen.getByLabelText("气血当前值");
    await user.type(healthInput, "100");
    await user.clear(healthInput);

    expect(healthInput).toHaveValue(null);
  });

  it("应该保留气血并等比例转换第二主属性", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    await user.selectOptions(screen.getByLabelText("目标门派"), "天音寺");
    await user.type(screen.getByLabelText("气血当前值"), "1000");
    await user.type(screen.getByLabelText("物攻当前值"), "14");
    await user.click(screen.getByRole("button", { name: "转换" }));

    const result = screen.getByText("转换结果").parentElement?.parentElement;
    expect(result).not.toBeNull();
    expect(within(result as HTMLElement).getAllByText("1000")).toHaveLength(2);
    expect(within(result as HTMLElement).getByText("速度")).toBeInTheDocument();
    expect(within(result as HTMLElement).getByText("5")).toBeInTheDocument();
  });

  it("应该允许输入随角色等级成长后的属性值", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    await user.selectOptions(screen.getByLabelText("目标门派"), "天音寺");
    await user.type(screen.getByLabelText("气血当前值"), "1000");
    await user.type(screen.getByLabelText("物攻当前值"), "44");
    await user.click(screen.getByRole("button", { name: "转换" }));

    const result = screen.getByText("转换结果").parentElement?.parentElement;
    expect(result).not.toBeNull();
    expect(within(result as HTMLElement).getByText("16")).toBeInTheDocument();
  });

  it("应该显示规则数据待复核摘要", () => {
    render(<RingConverter />);

    expect(
      screen.getByText(/数据依据：历史录入规则.*最近核验：待复核/),
    ).toBeInTheDocument();
  });

  it("应该校验缺失值、负数和非有限数值", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    await user.click(screen.getByRole("button", { name: "转换" }));
    expect(
      screen.getByText("请完整输入气血和第二主属性数值"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("气血当前值"), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByLabelText("物攻当前值"), {
      target: { value: "10" },
    });
    await user.click(screen.getByRole("button", { name: "转换" }));
    expect(
      screen.getByText("气血值必须是大于或等于0的有效数字"),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("气血当前值"), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText("物攻当前值"), {
      target: { value: "-1" },
    });
    await user.click(screen.getByRole("button", { name: "转换" }));
    expect(
      screen.getByText("物攻值必须是大于或等于0的有效数字"),
    ).toBeInTheDocument();
  });

  it("重置和门派变化应该清除反馈", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    await user.type(screen.getByLabelText("气血当前值"), "1000");
    await user.type(screen.getByLabelText("物攻当前值"), "14");
    await user.click(screen.getByRole("button", { name: "转换" }));
    await user.selectOptions(screen.getByLabelText("目标门派"), "天音寺");
    expect(screen.queryByText("转换结果")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "转换" }));
    expect(screen.getByText("转换结果")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "重置" }));

    expect(screen.getByLabelText("气血当前值")).toHaveValue(null);
    expect(screen.getByLabelText("物攻当前值")).toHaveValue(null);
    expect(screen.queryByText("转换结果")).not.toBeInTheDocument();
  });

  it("应该恢复保存的戒指门派选择", () => {
    updatePreferences({
      ringCurrentSect: "合欢门",
      ringTargetSect: "天音寺",
    });

    render(<RingConverter />);

    expect(screen.getByLabelText("当前门派")).toHaveValue("合欢门");
    expect(screen.getByLabelText("目标门派")).toHaveValue("天音寺");
    expect(screen.getByLabelText("速度当前值")).toBeInTheDocument();
  });

  it("应该显示第二主属性的正、负和零变化", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<RingConverter />);

    await user.selectOptions(screen.getByLabelText("目标门派"), "天音寺");
    await user.type(screen.getByLabelText("气血当前值"), "100");
    await user.type(screen.getByLabelText("物攻当前值"), "14");
    await user.click(screen.getByRole("button", { name: "转换" }));
    expect(screen.getByText("-9")).toHaveClass("text-red-600");

    unmount();
    window.localStorage.clear();
    render(<RingConverter />);
    await user.selectOptions(screen.getByLabelText("当前门派"), "天音寺");
    await user.type(screen.getByLabelText("气血当前值"), "100");
    await user.type(screen.getByLabelText("速度当前值"), "5");
    await user.click(screen.getByRole("button", { name: "转换" }));
    expect(screen.getByText("+9")).toHaveClass("text-green-600");

    await user.click(screen.getByRole("button", { name: "重置" }));
    await user.selectOptions(screen.getByLabelText("当前门派"), "鬼王宗");
    await user.type(screen.getByLabelText("气血当前值"), "100");
    await user.type(screen.getByLabelText("物攻当前值"), "14");
    await user.click(screen.getByRole("button", { name: "转换" }));
    const zeroChanges = screen.getAllByText("0");
    expect(zeroChanges.at(-1)).toHaveClass("text-slate-500");
  });
});
