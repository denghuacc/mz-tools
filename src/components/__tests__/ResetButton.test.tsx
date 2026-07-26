import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../test/testUtils";
import ResetButton from "../ResetButton";

describe("ResetButton", () => {
  it("应该把焦点锁定在确认弹窗并在关闭后恢复", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ResetButton
          confirmationTitle="确认重置？"
          confirmationMessage="重置后无法恢复。"
          onConfirm={() => undefined}
        />
        <button type="button">背景操作</button>
      </>,
    );

    const resetButton = screen.getByRole("button", { name: "重置" });
    await user.click(resetButton);

    const cancelButton = screen.getByRole("button", { name: "取消" });
    const confirmButton = screen.getByRole("button", { name: "确认重置" });
    expect(cancelButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();
    await user.tab();
    expect(cancelButton).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(resetButton).toHaveFocus();
  });

  it("应该支持点击遮罩关闭确认弹窗", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ResetButton
        confirmationTitle="确认重置？"
        confirmationMessage="重置后无法恢复。"
        onConfirm={onConfirm}
      />,
    );

    const resetButton = screen.getByRole("button", { name: "重置" });
    await user.click(resetButton);
    fireEvent.mouseDown(screen.getByRole("alertdialog").parentElement!);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(resetButton).toHaveFocus();
  });
});
