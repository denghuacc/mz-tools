import { vi } from "vite-plus/test";
import { fireEvent, render, screen } from "../../test/testUtils";
import {
  EquipmentAttributeValueInput,
  EquipmentEditorSection,
} from "../equipment/EquipmentEditorFields";

describe("EquipmentEditorFields", () => {
  it("没有说明文案时应该只渲染标题和内容", () => {
    render(
      <EquipmentEditorSection title="测试分区">
        <span>测试内容</span>
      </EquipmentEditorSection>,
    );

    expect(
      screen.getByRole("heading", { name: "测试分区" }),
    ).toBeInTheDocument();
    expect(screen.getByText("测试内容")).toBeInTheDocument();
  });

  it("应该把负数装备属性收紧为零", () => {
    const onChange = vi.fn();
    render(
      <EquipmentAttributeValueInput
        label="装备属性"
        value={0}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "装备属性" }), {
      target: { value: "-5" },
    });

    expect(onChange).toHaveBeenCalledWith(0);
  });
});
