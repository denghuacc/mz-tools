import { describe, expect, it } from "vitest";
import {
  convertRingSecondaryAttribute,
  getRingSecondaryAttributeConfig,
} from "../ringConverter";

describe("戒指主属性转换", () => {
  it.each([
    ["鬼王宗", { type: "physical", label: "物攻", max: 27 }],
    ["青云门", { type: "magic", label: "法攻", max: 27 }],
    ["天音寺", { type: "speed", label: "速度", max: 10 }],
    ["合欢门", { type: "speed", label: "速度", max: 10 }],
  ] as const)("%s 应使用正确的第二主属性", (sect, expected) => {
    expect(getRingSecondaryAttributeConfig(sect)).toEqual(expected);
  });

  it.each([
    ["物理转法术", 14, "鬼王宗", "青云门", 14],
    ["物理转辅助", 14, "鬼王宗", "天音寺", 5],
    ["辅助转物理", 5, "天音寺", "鬼王宗", 14],
    ["法术转封系", 27, "青云门", "合欢门", 10],
    ["封系转辅助", 7, "合欢门", "天音寺", 7],
  ] as const)("%s 应按最高值等比例转换", (_name, value, from, to, expected) => {
    expect(convertRingSecondaryAttribute(value, from, to)).toBe(expected);
  });
});
