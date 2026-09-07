import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";
import type { FusionSkill } from "../../utils/spiritBeastFusion";
import SpiritBeastFusionSkillIcons from "../SpiritBeastFusionSkillIcons";

const skills: readonly FusionSkill[] = [
  {
    id: "known-skill",
    name: "高级迅捷",
    isSpecial: false,
    specialType: null,
  },
  {
    id: "custom-special-skill",
    name: "月影奇袭",
    isSpecial: true,
    specialType: "passive",
  },
];

describe("SpiritBeastFusionSkillIcons", () => {
  it("使用圆形图标或特字代替技能文字，并在点击后显示名称", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastFusionSkillIcons skills={skills} />);

    const skillButton = screen.getByRole("button", {
      name: "查看高级迅捷技能名称",
    });
    const specialSkillButton = screen.getByRole("button", {
      name: "查看被动特 · 月影奇袭技能名称",
    });
    const skillImage = skillButton.querySelector("img");

    expect(skillButton).toHaveClass("rounded-full");
    expect(skillImage).toHaveClass("rounded-full");
    expect(specialSkillButton).toHaveClass("rounded-full");
    expect(specialSkillButton).toHaveTextContent("特");
    expect(screen.queryByText("高级迅捷")).not.toBeInTheDocument();
    expect(screen.queryByText("被动特 · 月影奇袭")).not.toBeInTheDocument();

    await user.click(skillButton);

    expect(screen.getByText("高级迅捷")).toBeInTheDocument();
    expect(skillButton).toHaveAttribute("aria-expanded", "true");

    await user.click(skillButton);
    expect(screen.queryByText("高级迅捷")).not.toBeInTheDocument();

    await user.click(specialSkillButton);
    expect(screen.getByText("被动特 · 月影奇袭")).toBeInTheDocument();
  });

  it("支持从图标列表删除技能", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();
    render(
      <SpiritBeastFusionSkillIcons
        skills={skills}
        onRemove={handleRemove}
        removeAriaLabel={(skill) => `删除测试技能${skill.name}`}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "删除测试技能高级迅捷" }),
    );

    expect(handleRemove).toHaveBeenCalledWith("known-skill");
  });

  it("支持深色居中样式、已知特殊技能和默认删除标签", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();
    const specialSkills: readonly FusionSkill[] = [
      {
        id: "known-active-special",
        name: "高级迅捷",
        isSpecial: true,
        specialType: "active",
      },
      {
        id: "known-passive-special",
        name: "高级健壮",
        isSpecial: true,
        specialType: "passive",
      },
    ];
    render(
      <SpiritBeastFusionSkillIcons
        skills={specialSkills}
        size="large"
        tone="dark"
        justify="center"
        onRemove={handleRemove}
      />,
    );

    const activeButton = screen.getByRole("button", {
      name: "查看主动特 · 高级迅捷技能名称",
    });
    await user.click(activeButton);
    expect(activeButton).toHaveAttribute("aria-expanded", "true");
    expect(activeButton.parentElement?.parentElement).toHaveClass(
      "justify-center",
    );

    await user.click(screen.getByRole("button", { name: "删除技能高级健壮" }));
    expect(handleRemove).toHaveBeenCalledWith("known-passive-special");
  });

  it("未知普通技能可显示文字并使用深色删除按钮", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();
    render(
      <SpiritBeastFusionSkillIcons
        skills={[
          {
            id: "unknown-normal",
            name: "未收录技能",
            isSpecial: false,
            specialType: null,
          },
        ]}
        tone="dark"
        onRemove={handleRemove}
      />,
    );

    expect(screen.getByText("未收录技能")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "删除技能未收录技能" }),
    );
    expect(handleRemove).toHaveBeenCalledWith("unknown-normal");
  });
});
