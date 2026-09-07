import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  createEmptySpiritBeastEnlightenment,
  type SpiritBeastEnlightenment,
} from "../../utils/spiritBeastEnlightenment";
import SpiritBeastEnlightenmentControl from "../SpiritBeastEnlightenmentControl";

const EnlightenmentHarness = () => {
  const [enlightenment, setEnlightenment] = useState<SpiritBeastEnlightenment>(
    createEmptySpiritBeastEnlightenment,
  );

  return (
    <SpiritBeastEnlightenmentControl
      enlightenment={enlightenment}
      onChange={setEnlightenment}
    />
  );
};

describe("SpiritBeastEnlightenmentControl", () => {
  it("限制资质和五维选择数量，并校验录入范围", async () => {
    const user = userEvent.setup();
    render(<EnlightenmentHarness />);

    expect(screen.getByRole("button", { name: "物攻资质" })).toBeDisabled();
    await user.selectOptions(
      screen.getByRole("combobox", { name: "点化属性星级" }),
      "3",
    );

    await user.click(screen.getByRole("button", { name: "物攻资质" }));
    await user.click(screen.getByRole("button", { name: "气血资质" }));
    expect(screen.getByRole("button", { name: "速度资质" })).toBeDisabled();

    const qualificationInput = screen.getByRole("spinbutton", {
      name: "仙府点化：物攻资质数值",
    });
    fireEvent.change(qualificationInput, { target: { value: "12.8" } });
    expect(qualificationInput).toHaveValue(12);
    fireEvent.change(qualificationInput, { target: { value: "10000" } });
    expect(qualificationInput).toHaveValue(12);
    fireEvent.change(qualificationInput, { target: { value: "" } });
    expect(qualificationInput).toHaveValue(null);

    await user.click(screen.getByRole("button", { name: "物攻资质" }));
    expect(
      screen.queryByRole("spinbutton", {
        name: "仙府点化：物攻资质数值",
      }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "体" }));
    await user.click(screen.getByRole("button", { name: "力" }));
    expect(screen.getByRole("button", { name: "敏" })).toBeDisabled();

    const primaryInput = screen.getByRole("spinbutton", {
      name: "仙府点化：体属性数值",
    });
    fireEvent.change(primaryInput, { target: { value: "8.9" } });
    expect(primaryInput).toHaveValue(8);
    fireEvent.change(primaryInput, { target: { value: "999" } });
    expect(primaryInput).toHaveValue(8);
    fireEvent.change(primaryInput, { target: { value: "" } });
    expect(primaryInput).toHaveValue(null);

    await user.click(screen.getByRole("button", { name: "体" }));
    expect(
      screen.queryByRole("spinbutton", { name: "仙府点化：体属性数值" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重置" }));
    const dialog = screen.getByRole("alertdialog", {
      name: "确认重置仙府点化？",
    });
    await user.click(within(dialog).getByRole("button", { name: "确认重置" }));
    expect(screen.getByRole("combobox", { name: "点化属性星级" })).toHaveValue(
      "0",
    );
  });
});
