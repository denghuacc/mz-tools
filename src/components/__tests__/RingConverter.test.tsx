import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RingConverter from "../RingConverter";

describe("RingConverter 组件", () => {
  it("应该展示当前职业对应的第二主属性和最高值", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    expect(screen.getByLabelText("物攻最高值")).toHaveValue(27);

    await user.selectOptions(screen.getByLabelText("转换前门派"), "天音寺");

    expect(screen.getByLabelText("速度最高值")).toHaveValue(10);
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

  it("应该拒绝超过当前职业最高值的输入", async () => {
    const user = userEvent.setup();
    render(<RingConverter />);

    await user.type(screen.getByLabelText("气血当前值"), "1000");
    await user.type(screen.getByLabelText("物攻当前值"), "28");
    await user.click(screen.getByRole("button", { name: "转换" }));

    expect(screen.getByText("物攻值必须在0到27之间")).toBeInTheDocument();
    expect(screen.queryByText("转换结果")).not.toBeInTheDocument();
  });
});
