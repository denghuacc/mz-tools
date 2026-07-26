import { render, screen } from "../../test/testUtils";
import { EquipmentEditorSection } from "../equipment/EquipmentEditorFields";

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
});
