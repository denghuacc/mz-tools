import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";

import type { CharacterAllocation } from "../../utils/characterAttributes";
import PotentialAllocationControl from "../PotentialAllocationControl";

const strengthAllocation: CharacterAllocation = {
  constitution: 2,
  spirit: 0,
  strength: 8,
  endurance: 0,
  agility: 0,
};

describe("PotentialAllocationControl", () => {
  it("校验自由加点输入并切换力灵主属性", async () => {
    const user = userEvent.setup();
    const onCustomAllocationChange = vi.fn();
    const props = {
      title: "潜力点分配",
      presets: [{ id: "strength", label: "10力", ratio: strengthAllocation }],
      allocationMode: "custom" as const,
      selectedPresetId: "strength",
      customScheme: "strength-or-spirit" as const,
      customAllocation: strengthAllocation,
      customValidationError: null,
      summary: "力 +8 · 体 +2",
      onAllocationModeChange: vi.fn(),
      onSelectPreset: vi.fn(),
      onCustomSchemeChange: vi.fn(),
      onCustomAllocationChange,
    };
    const { rerender } = render(<PotentialAllocationControl {...props} />);

    const constitutionInput = screen.getByRole("spinbutton", {
      name: "自由加点：体力",
    });
    fireEvent.change(constitutionInput, { target: { value: "" } });
    expect(onCustomAllocationChange).toHaveBeenLastCalledWith({
      ...strengthAllocation,
      constitution: 0,
    });
    fireEvent.change(constitutionInput, { target: { value: "11" } });
    expect(onCustomAllocationChange).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("radio", { name: "力量" }));
    expect(onCustomAllocationChange).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("radio", { name: "灵力" }));
    expect(onCustomAllocationChange).toHaveBeenLastCalledWith({
      ...strengthAllocation,
      strength: 0,
      spirit: 8,
    });

    const spiritAllocation = {
      ...strengthAllocation,
      strength: 0,
      spirit: 8,
    };
    rerender(
      <PotentialAllocationControl
        {...props}
        customAllocation={spiritAllocation}
      />,
    );
    await user.click(screen.getByRole("radio", { name: "力量" }));
    expect(onCustomAllocationChange).toHaveBeenLastCalledWith({
      ...spiritAllocation,
      strength: 8,
      spirit: 0,
    });
  });
});
