import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vite-plus/test";

import { createDefaultSpiritBeastState } from "../../utils/spiritBeastAttributes";
import { SpiritBeastAffinityControl } from "../SpiritBeastBaseConfigControl";

describe("SpiritBeastAffinityControl", () => {
  it("支持录入、清空正负亲和初值", () => {
    const state = createDefaultSpiritBeastState();
    state.affinities.fireAffinity = 10;
    const onChange = vi.fn();
    render(<SpiritBeastAffinityControl state={state} onChange={onChange} />);

    const fireInput = screen.getByRole("spinbutton", { name: "火亲和初值" });
    fireEvent.change(fireInput, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        affinities: expect.objectContaining({ fireAffinity: 0 }),
      }),
    );

    fireEvent.change(fireInput, { target: { value: "-12.5" } });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        affinities: expect.objectContaining({ fireAffinity: -12.5 }),
      }),
    );
  });
});
