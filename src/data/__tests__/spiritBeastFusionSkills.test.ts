import { describe, expect, it } from "vite-plus/test";
import {
  SPIRIT_BEAST_FUSION_SKILL_OPTIONS,
  getSpiritBeastFusionSkillOption,
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
  });
});
