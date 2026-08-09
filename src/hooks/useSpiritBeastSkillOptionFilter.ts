import { useState } from "react";
import {
  filterSpiritBeastSkillOptions,
  type SpiritBeastSkillCategoryFilter,
} from "../data/spiritBeastFusionSkills";

/** 管理融合技能和学习技能书共用的名称搜索与分类过滤状态。 */
export const useSpiritBeastSkillOptionFilter = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<SpiritBeastSkillCategoryFilter>("all");
  const filteredOptions = filterSpiritBeastSkillOptions(query, category);

  return {
    query,
    setQuery,
    category,
    setCategory,
    filteredOptions,
  };
};
