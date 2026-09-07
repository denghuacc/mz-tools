import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  createEmptySpiritBeastEquipmentSet,
  type SpiritBeastEquipmentSet,
} from "../../utils/spiritBeastEquipment";
import SpiritBeastEquipmentControl from "../SpiritBeastEquipmentControl";

const EquipmentHarness = () => {
  const [equipment, setEquipment] = useState<SpiritBeastEquipmentSet>(() => {
    const initialEquipment = createEmptySpiritBeastEquipmentSet();
    initialEquipment.crown.baseAttributes[0].value = 12;
    return initialEquipment;
  });

  return (
    <SpiritBeastEquipmentControl
      equipment={equipment}
      onChange={setEquipment}
    />
  );
};

describe("SpiritBeastEquipmentControl", () => {
  it("编辑宝冠、增删启灵词条并重置全部装备", async () => {
    const user = userEvent.setup();
    render(<EquipmentHarness />);

    await user.click(screen.getByRole("checkbox", { name: "宝冠：计入装备" }));
    expect(
      screen.getByRole("checkbox", { name: "宝冠：计入装备" }),
    ).not.toBeChecked();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "宝冠：装备属性 1" }),
      "physicalAttack",
    );
    expect(
      screen.getByRole("combobox", { name: "宝冠：装备属性 1" }),
    ).toHaveValue("physicalAttack");

    const crownValue = screen.getByRole("spinbutton", {
      name: "宝冠：装备属性 1 数值",
    });
    fireEvent.change(crownValue, { target: { value: "" } });
    expect(crownValue).toHaveValue(null);
    fireEvent.change(crownValue, { target: { value: "-1" } });
    expect(crownValue).toHaveValue(null);

    await user.click(
      screen.getByRole("button", { name: "添加宝衣第 2 条启灵属性" }),
    );
    await user.click(
      screen.getByRole("button", { name: "删除宝衣启灵属性 2" }),
    );
    expect(
      screen.queryByRole("button", { name: "删除宝衣启灵属性 2" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重置" }));
    const dialog = screen.getByRole("alertdialog", {
      name: "确认重置三件灵兽装备？",
    });
    await user.click(within(dialog).getByRole("button", { name: "确认重置" }));
    expect(
      screen.getByRole("checkbox", { name: "宝冠：计入装备" }),
    ).toBeChecked();
  });
});
