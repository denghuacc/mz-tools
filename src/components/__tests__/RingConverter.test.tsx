import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RingConverter from "../RingConverter";

describe("RingConverter 组件", () => {
  it("应该展示当前职业对应的第二主属性且不限制固定上限", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    expect(
      screen.getByText("戒指为全等级装备，属性值会随角色等级自动成长。")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("物攻当前值")).not.toHaveAttribute("max");

    await user.selectOptions(screen.getByLabelText("转换前门派"), "天音寺");

    expect(screen.getByLabelText("速度当前值")).not.toHaveAttribute("max");
  });

  it("应该保留气血并等比例转换第二主属性", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    await user.selectOptions(screen.getByLabelText("转换后门派"), "天音寺");
    await user.type(screen.getByLabelText("气血当前值"), "1000");
    await user.type(screen.getByLabelText("物攻当前值"), "14");
    await user.click(screen.getByRole("button", { name: "转换" }));

    const result = screen.getByText("转换结果").parentElement?.parentElement;
    expect(result).not.toBeNull();
    expect(within(result as HTMLElement).getByText("1000")).toBeInTheDocument();
    expect(within(result as HTMLElement).getByText("速度")).toBeInTheDocument();
    expect(within(result as HTMLElement).getByText("5")).toBeInTheDocument();
  });

  it("应该允许输入随角色等级成长后的属性值", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    await user.selectOptions(screen.getByLabelText("转换后门派"), "天音寺");
    await user.type(screen.getByLabelText("气血当前值"), "1000");
    await user.type(screen.getByLabelText("物攻当前值"), "44");
    await user.click(screen.getByRole("button", { name: "转换" }));

    const result = screen.getByText("转换结果").parentElement?.parentElement;
    expect(result).not.toBeNull();
    expect(within(result as HTMLElement).getByText("16")).toBeInTheDocument();
  });
});
