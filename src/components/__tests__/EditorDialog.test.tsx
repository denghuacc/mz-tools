import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { fireEvent, render, screen } from "../../test/testUtils";
import EditorDialog from "../EditorDialog";

const DialogHarness = ({ onClose }: { onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        打开入口
      </button>
      {isOpen ? (
        <EditorDialog
          title="测试"
          onClose={() => {
            onClose();
            setIsOpen(false);
          }}
        >
          内容
        </EditorDialog>
      ) : null}
    </>
  );
};

describe("EditorDialog", () => {
  it("应该把正向和反向 Tab 焦点锁定在弹窗内", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">背景操作</button>
        <EditorDialog title="测试" onClose={() => undefined}>
          <button type="button">弹窗内容操作</button>
        </EditorDialog>
      </>
    );

    const closeButton = screen.getByRole("button", { name: "关闭弹窗" });
    const contentButton = screen.getByRole("button", { name: "弹窗内容操作" });
    const doneButton = screen.getByRole("button", { name: "完成" });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(contentButton).toHaveFocus();
    await user.tab();
    expect(doneButton).toHaveFocus();
    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(doneButton).toHaveFocus();
  });

  it("应该支持 Escape 关闭并把焦点恢复到打开前的元素", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);
    const opener = screen.getByRole("button", { name: "打开入口" });

    await user.click(opener);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("应该支持点击遮罩关闭，并在禁用关闭时忽略遮罩和 Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <EditorDialog title="测试" onClose={onClose}>
        内容
      </EditorDialog>
    );

    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(
      <EditorDialog title="测试" onClose={onClose} isCloseDisabled>
        内容
      </EditorDialog>
    );
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });
});
