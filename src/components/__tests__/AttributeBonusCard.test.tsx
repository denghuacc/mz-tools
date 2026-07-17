import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import AttributeBonusCard from "../AttributeBonusCard";
import { createEmptyCharacterAttributeBonuses } from "../../utils/characterAttributes";

describe("AttributeBonusCard", () => {
  it("应该支持只配置一条属性", () => {
    const onChange = vi.fn();

    render(
      <AttributeBonusCard
        title="单属性加成"
        description="只增加一条属性"
        fields={[{ attribute: "strength", label: "力量" }]}
        values={createEmptyCharacterAttributeBonuses()}
        onChange={onChange}
        onReset={vi.fn()}
      />
    );

    const input = screen.getByRole("spinbutton", {
      name: "单属性加成：力量",
    });
    fireEvent.change(input, { target: { value: "12" } });

    expect(onChange).toHaveBeenCalledWith("strength", 12);
    expect(input).toHaveAttribute("min", "0");
    expect(screen.getAllByRole("spinbutton")).toHaveLength(1);
  });

  it("应该按配置展示多条属性", () => {
    const onChange = vi.fn();

    render(
      <AttributeBonusCard
        title="多属性加成"
        description="同时增加多条属性"
        fields={[
          { attribute: "health", label: "气血" },
          { attribute: "speed", label: "速度", allowNegative: true },
          { attribute: "agility", label: "敏捷" },
        ]}
        values={createEmptyCharacterAttributeBonuses()}
        onChange={onChange}
        onReset={vi.fn()}
      />
    );

    expect(
      screen.getAllByRole("spinbutton").map((input) => input.getAttribute("aria-label"))
    ).toEqual(["多属性加成：气血", "多属性加成：速度", "多属性加成：敏捷"]);

    const speedInput = screen.getByRole("spinbutton", {
      name: "多属性加成：速度",
    });
    fireEvent.change(speedInput, { target: { value: "-30" } });

    expect(speedInput).not.toHaveAttribute("min");
    expect(screen.getByText("±")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("speed", -30);
  });
});
