export type SpiritBeastFusionSkillCategory = "common" | "element" | "other";

export type SpiritBeastSkillCategoryFilter =
  | "all"
  | SpiritBeastFusionSkillCategory;

export type SpiritBeastFusionSkillOption = {
  id: string;
  name: string;
  category: SpiritBeastFusionSkillCategory;
  iconUrl: string;
  referencePrice: number;
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
  ["高级物暴", "common", 50006],
  ["高级物连", "common", 50006],
  ["高级乘胜", "common", 25008],
  ["高级噬血", "common", 30293],
  ["高级蛮劲", "common", 35282],
  ["高级助攻", "common", 10000],
  ["高级法暴", "common", 50000],
  ["高级法连", "common", 50000],
  ["高级修罗", "common", 33971],
  ["高级玄法", "common", 27162],
  ["高级威能", "common", 29164],
  ["高级共鸣", "common", 25000],
  ["高级震荡", "common", 17193],
  ["高级重生", "common", 50000],
  ["高级神罚", "common", 28354],
  ["高级轮回", "common", 29986],
  ["高级格挡", "common", 15565],
  ["高级物穿", "common", 35025],
  ["高级法穿", "common", 27822],
  ["高级护体", "common", 19473],
  ["高级护灵", "common", 21967],
  ["高级反扑", "common", 10000],
  ["高级震伤", "common", 10000],
  ["高级灵巧", "common", 25735],
  ["高级精魅", "common", 11720],
  ["高级镇魂", "common", 6386],
  ["高级隐身", "common", 21920],
  ["高级慧眼", "common", 30000],
  ["高级迅捷", "common", 25278],
  ["高级迟钝", "common", 5659],
  ["高级健壮", "common", 46626],
  ["高级鬼道", "common", 6291],
  ["高级吉星", "common", 15942],
  ["高级自愈", "common", 5000],
  ["高级魂佑", "common", 5000],
  ["高级击破", "common", 13642],
  ["高级驱鬼", "common", 14504],
  ["高级磐石", "common", 18094],
  ["高级玄盾", "common", 17579],
  ["高级火元素", "element", 5002],
  ["高级火系亲和", "element", 28891],
  ["高级冰系亲和", "element", 25000],
  ["高级电系亲和", "element", 25006],
  ["高级毒系亲和", "element", 25553],
  ["高级风系亲和", "element", 26766],
  ["高级水系亲和", "element", 25000],
  ["高级火系吸收", "element", 13703],
  ["高级冰系吸收", "element", 10000],
  ["高级电系吸收", "element", 12571],
  ["高级毒系吸收", "element", 12680],
  ["高级水系吸收", "element", 10000],
  ["高级风系吸收", "element", 10383],
  ["远古记忆", "other", 37500],
  ["烈焰冲天", "other", 10000],
  ["冰风暴", "other", 10000],
  ["雷霆万钧", "other", 10000],
  ["毒泽绝域", "other", 10000],
  ["惊涛骇浪", "other", 10000],
  ["狂风怒吼", "other", 10000],
  ["剑气纵横", "other", 25000],
] as const satisfies readonly (readonly [
  string,
  SpiritBeastFusionSkillCategory,
  number,
])[];

/** 用户截图中可供灵兽融合录入的技能书选项。 */
export const SPIRIT_BEAST_FUSION_SKILL_OPTIONS = skillDefinitions.map(
  ([name, category, referencePrice], index): SpiritBeastFusionSkillOption => {
    const fileName = `${String(index + 1).padStart(3, "0")}.png`;

    return {
      id: `fusion-skill-option-${index + 1}`,
      name,
      category,
      referencePrice,
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

export const isKnownSpiritBeastSkillName = (name: string) =>
  skillOptionByName.has(name);

/** 供融合多选和技能书单选共用的名称、分类过滤规则。 */
export const filterSpiritBeastSkillOptions = (
  query: string,
  category: SpiritBeastSkillCategoryFilter,
) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery && category === "all") {
    return SPIRIT_BEAST_FUSION_SKILL_OPTIONS;
  }

  return SPIRIT_BEAST_FUSION_SKILL_OPTIONS.filter(
    (option) =>
      (category === "all" || option.category === category) &&
      (!normalizedQuery ||
        option.name.toLocaleLowerCase().includes(normalizedQuery)),
  );
};
