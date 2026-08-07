export type SpiritBeastFusionSkillCategory = "common" | "element" | "other";

export type SpiritBeastFusionSkillOption = {
  id: string;
  name: string;
  category: SpiritBeastFusionSkillCategory;
  iconUrl: string;
};

const skillIconModules = import.meta.glob<string>(
  "../assets/spirit-beast-skills/*.png",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const skillDefinitions = [
  ["高级物暴", "common"],
  ["高级物连", "common"],
  ["高级乘胜", "common"],
  ["高级噬血", "common"],
  ["高级蛮劲", "common"],
  ["高级助攻", "common"],
  ["高级法暴", "common"],
  ["高级法连", "common"],
  ["高级修罗", "common"],
  ["高级玄法", "common"],
  ["高级威能", "common"],
  ["高级共鸣", "common"],
  ["高级震荡", "common"],
  ["高级重生", "common"],
  ["高级神罚", "common"],
  ["高级轮回", "common"],
  ["高级格挡", "common"],
  ["高级物穿", "common"],
  ["高级法穿", "common"],
  ["高级护体", "common"],
  ["高级护灵", "common"],
  ["高级反扑", "common"],
  ["高级震伤", "common"],
  ["高级灵巧", "common"],
  ["高级精魅", "common"],
  ["高级镇魂", "common"],
  ["高级隐身", "common"],
  ["高级慧眼", "common"],
  ["高级迅捷", "common"],
  ["高级迟钝", "common"],
  ["高级健壮", "common"],
  ["高级鬼道", "common"],
  ["高级吉星", "common"],
  ["高级自愈", "common"],
  ["高级魂佑", "common"],
  ["高级击破", "common"],
  ["高级驱鬼", "common"],
  ["高级磐石", "common"],
  ["高级玄盾", "common"],
  ["高级火元素", "element"],
  ["高级火系亲和", "element"],
  ["高级冰系亲和", "element"],
  ["高级电系亲和", "element"],
  ["高级毒系亲和", "element"],
  ["高级风系亲和", "element"],
  ["高级水系亲和", "element"],
  ["高级火系吸收", "element"],
  ["高级冰系吸收", "element"],
  ["高级电系吸收", "element"],
  ["高级毒系吸收", "element"],
  ["高级水系吸收", "element"],
  ["高级风系吸收", "element"],
  ["远古记忆", "other"],
  ["烈焰冲天", "other"],
  ["冰风暴", "other"],
  ["雷霆万钧", "other"],
  ["毒泽绝域", "other"],
  ["惊涛骇浪", "other"],
  ["狂风怒吼", "other"],
  ["剑气纵横", "other"],
] as const satisfies readonly (readonly [
  string,
  SpiritBeastFusionSkillCategory,
])[];

/** 用户截图中可供灵兽融合录入的技能书选项。 */
export const SPIRIT_BEAST_FUSION_SKILL_OPTIONS = skillDefinitions.map(
  ([name, category], index): SpiritBeastFusionSkillOption => {
    const fileName = `${String(index + 1).padStart(3, "0")}.png`;

    return {
      id: `fusion-skill-option-${index + 1}`,
      name,
      category,
      iconUrl:
        skillIconModules[`../assets/spirit-beast-skills/${fileName}`] ?? "",
    };
  },
);

const skillOptionByName = new Map(
  SPIRIT_BEAST_FUSION_SKILL_OPTIONS.map((option) => [option.name, option]),
);

export const getSpiritBeastFusionSkillOption = (name: string) =>
  skillOptionByName.get(name);
