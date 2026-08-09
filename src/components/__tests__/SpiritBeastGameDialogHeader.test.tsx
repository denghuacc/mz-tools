import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";
import SpiritBeastGameDialogHeader from "../SpiritBeastGameDialogHeader";

describe("SpiritBeastGameDialogHeader", () => {
  it.each(["compact", "wide"] as const)(
    "支持 %s 布局并触发关闭操作",
    async (layout) => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <SpiritBeastGameDialogHeader
          title="测试结果"
          titleId="test-result-title"
          closeAriaLabel="关闭测试结果"
          onClose={onClose}
          layout={layout}
        />,
      );

      expect(screen.getByRole("heading", { name: "测试结果" })).toHaveAttribute(
        "id",
        "test-result-title",
      );
      await user.click(screen.getByRole("button", { name: "关闭测试结果" }));

      expect(onClose).toHaveBeenCalledOnce();
    },
  );
});
