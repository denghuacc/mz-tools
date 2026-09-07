import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../test/testUtils";
import EditorDialog from "../EditorDialog";
import ResetButton from "../ResetButton";

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
      </>,
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
      </EditorDialog>,
    );

    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(
      <EditorDialog title="测试" onClose={onClose} isCloseDisabled>
        内容
      </EditorDialog>,
    );
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    await user.keyboard("{Escape}");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("嵌套确认框应该独占 Escape 并保留父级编辑弹窗", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <EditorDialog title="测试" onClose={onClose}>
        <ResetButton
          confirmationTitle="确认重置？"
          confirmationMessage="重置后无法恢复。"
          onConfirm={() => undefined}
        />
      </EditorDialog>,
    );

    await user.click(screen.getByRole("button", { name: "重置" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("button", { name: "取消" })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "确认重置" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "取消" })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "重置" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("同时卸载嵌套弹窗后应恢复原始滚动设置并移除键盘监听", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "scroll";
    const { unmount } = render(
      <EditorDialog title="测试" onClose={onClose}>
        <ResetButton
          confirmationTitle="确认重置？"
          confirmationMessage="重置后无法恢复。"
          onConfirm={() => undefined}
        />
      </EditorDialog>,
    );

    try {
      await user.click(screen.getByRole("button", { name: "重置" }));
      expect(document.body.style.overflow).toBe("hidden");

      unmount();
      expect(document.body.style.overflow).toBe("scroll");
      await user.keyboard("{Escape}");
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      unmount();
      document.body.style.overflow = previousOverflow;
    }
  });
});
