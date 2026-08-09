import { describe, expect, it } from "vite-plus/test";
import {
  SPIRIT_BEAST_FUSION_SKILL_OPTIONS,
  filterSpiritBeastSkillOptions,
  getSpiritBeastFusionSkillOption,
  isKnownSpiritBeastSkillName,
} from "../spiritBeastFusionSkills";

describe("spiritBeastFusionSkills", () => {
  it("收录截图中的 60 个不重复技能及图标", () => {
    expect(SPIRIT_BEAST_FUSION_SKILL_OPTIONS).toHaveLength(60);
    expect(
      new Set(SPIRIT_BEAST_FUSION_SKILL_OPTIONS.map((option) => option.name))
        .size,
    ).toBe(60);
    expect(
      SPIRIT_BEAST_FUSION_SKILL_OPTIONS.every((option) => option.iconUrl),
    ).toBe(true);
    expect(getSpiritBeastFusionSkillOption("高级物暴")?.iconUrl).toContain(
      "001.png",
    );
    expect(getSpiritBeastFusionSkillOption("剑气纵横")?.iconUrl).toContain(
      "060.png",
    );
    expect(getSpiritBeastFusionSkillOption("高级物暴")?.referencePrice).toBe(
      50006,
    );
    expect(getSpiritBeastFusionSkillOption("高级火元素")?.referencePrice).toBe(
      5002,
    );
    expect(getSpiritBeastFusionSkillOption("剑气纵横")?.referencePrice).toBe(
      25000,
    );
    expect(isKnownSpiritBeastSkillName("高级物暴")).toBe(true);
    expect(isKnownSpiritBeastSkillName("未知技能")).toBe(false);
  });

  it("共用过滤规则支持名称搜索与分类组合", () => {
    expect(
      filterSpiritBeastSkillOptions(" 火元素 ", "element").map(
        (option) => option.name,
      ),
    ).toEqual(["高级火元素"]);
    expect(filterSpiritBeastSkillOptions("火元素", "common")).toHaveLength(0);
  });
});
