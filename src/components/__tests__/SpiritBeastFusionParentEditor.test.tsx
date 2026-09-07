import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";

import { createDefaultSpiritBeastFusionState } from "../../utils/spiritBeastFusion";
import SpiritBeastFusionParentEditor from "../SpiritBeastFusionParentEditor";

describe("SpiritBeastFusionParentEditor", () => {
  it("提交主副宠名称、边界数值、滑杆和技能变更", async () => {
    const user = userEvent.setup();
    const parents = createDefaultSpiritBeastFusionState().parents;
    const onBeastChange = vi.fn();
    const onQualificationChange = vi.fn();
    render(
      <SpiritBeastFusionParentEditor
        parents={parents}
        onBeastChange={onBeastChange}
        onQualificationChange={onQualificationChange}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "主宠名称" }), {
      target: { value: "主宠甲" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "副宠名称" }), {
      target: { value: "副宠乙" },
    });
    expect(onBeastChange).toHaveBeenCalledWith(
      "main",
      expect.objectContaining({ name: "主宠甲" }),
    );
    expect(onBeastChange).toHaveBeenCalledWith(
      "secondary",
      expect.objectContaining({ name: "副宠乙" }),
    );

    fireEvent.change(screen.getByRole("slider", { name: "主宠物攻资质滑杆" }), {
      target: { value: "1300" },
    });
    expect(onQualificationChange).toHaveBeenCalledWith(
      "main",
      "physicalAttack",
      1300,
    );

    const mainQualification = screen.getByRole("spinbutton", {
      name: "主宠物攻资质",
    });
    fireEvent.change(mainQualification, { target: { value: "" } });
    fireEvent.blur(mainQualification);
    expect(mainQualification).toHaveValue(1500);
    fireEvent.change(mainQualification, { target: { value: "9999" } });
    fireEvent.keyDown(mainQualification, { key: "Escape" });
    fireEvent.blur(mainQualification);
    expect(onQualificationChange).toHaveBeenCalledWith(
      "main",
      "physicalAttack",
      1800,
    );

    const secondaryGrowth = screen.getByRole("spinbutton", {
      name: "副宠成长",
    });
    fireEvent.change(secondaryGrowth, { target: { value: "1.2345" } });
    fireEvent.keyDown(secondaryGrowth, { key: "Enter" });
    fireEvent.blur(secondaryGrowth);
    expect(onBeastChange).toHaveBeenCalledWith(
      "secondary",
      expect.objectContaining({ growth: 1.235 }),
    );

    const secondarySkillPicker = screen.getByRole("group", {
      name: "副宠技能技能选择",
    });
    await user.click(within(secondarySkillPicker).getByText("搜索并选择技能"));
    await user.click(screen.getByRole("checkbox", { name: "高级迅捷" }));
    expect(onBeastChange).toHaveBeenCalledWith(
      "secondary",
      expect.objectContaining({
        skills: expect.arrayContaining([
          expect.objectContaining({ name: "高级迅捷" }),
        ]),
      }),
    );
  });
});
