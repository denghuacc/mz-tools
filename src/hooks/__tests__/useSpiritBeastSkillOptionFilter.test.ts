import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import { useSpiritBeastSkillOptionFilter } from "../useSpiritBeastSkillOptionFilter";

describe("useSpiritBeastSkillOptionFilter", () => {
  it("按分类过滤技能库", () => {
    const { result } = renderHook(() => useSpiritBeastSkillOptionFilter());

    expect(result.current.filteredOptions).toHaveLength(60);

    act(() => result.current.setCategory("element"));

    expect(result.current.filteredOptions).not.toHaveLength(0);
    expect(
      result.current.filteredOptions.every(
        (option) => option.category === "element",
      ),
    ).toBe(true);
  });

  it("搜索时忽略首尾空格", () => {
    const { result } = renderHook(() => useSpiritBeastSkillOptionFilter());

    act(() => result.current.setQuery("  火元素  "));

    expect(result.current.filteredOptions.map((option) => option.name)).toEqual(
      ["高级火元素"],
    );
  });
});
