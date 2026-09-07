import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";

import type { FusionSkill } from "../../utils/spiritBeastFusion";
import SpiritBeastFusionSkillEditor from "../SpiritBeastFusionSkillEditor";

const createSkill = (index: number, name = `技能${index}`): FusionSkill => ({
  id: `skill-${index}`,
  name,
  isSpecial: false,
  specialType: null,
});

describe("SpiritBeastFusionSkillEditor", () => {
  it("提示空名称，并支持通过 Enter 添加特殊技能", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SpiritBeastFusionSkillEditor
        title="测试技能"
        accent="secondary"
        skills={[]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByText("＋ 补充灵兽特殊技能"));
    await user.click(screen.getByRole("button", { name: "添加" }));
    expect(screen.getByRole("alert")).toHaveTextContent("请先填写特殊技能名称");

    const nameInput = screen.getByRole("textbox", {
      name: "测试技能特殊技能名称",
    });
    await user.type(nameInput, "月影奇袭");
    await user.keyboard("{Escape}");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({
        name: "月影奇袭",
        isSpecial: true,
        specialType: "active",
      }),
    ]);
  });

  it("阻止同名与超量技能，并可从选择器取消已有技能", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const existingSkill = createSkill(1, "高级迅捷");
    const { rerender } = render(
      <SpiritBeastFusionSkillEditor
        title="测试技能"
        accent="main"
        skills={[existingSkill]}
        onChange={onChange}
      />,
    );

    const picker = screen.getByRole("group", { name: "测试技能技能选择" });
    await user.click(within(picker).getByText("搜索并选择技能"));
    await user.click(screen.getByRole("checkbox", { name: "高级迅捷" }));
    expect(onChange).toHaveBeenCalledWith([]);

    await user.click(screen.getByText("＋ 补充灵兽特殊技能"));
    const nameInput = screen.getByRole("textbox", {
      name: "测试技能特殊技能名称",
    });
    await user.type(nameInput, " 高级迅捷 ");
    await user.click(screen.getByRole("button", { name: "添加" }));
    expect(screen.getByRole("alert")).toHaveTextContent("不能重复录入同名技能");

    rerender(
      <SpiritBeastFusionSkillEditor
        title="测试技能"
        accent="main"
        skills={Array.from({ length: 6 }, (_, index) => createSkill(index))}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "添加" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "最多录入 6 个自身技能",
    );
  });
});
