import type {
  SpiritBeastAffinity,
  SpiritBeastDerivedAttribute,
  SpiritBeastPrimaryAttribute,
  SpiritBeastQualification,
} from "../utils/spiritBeastAttributes";

export const SPIRIT_BEAST_PRIMARY_LABELS: Record<
  SpiritBeastPrimaryAttribute,
  string
> = {
  constitution: "体",
  spirit: "灵",
  strength: "力",
  endurance: "耐",
  agility: "敏",
};

export const SPIRIT_BEAST_DERIVED_LABELS: Record<
  SpiritBeastDerivedAttribute,
  string
> = {
  health: "气血",
  mana: "法力",
  physicalAttack: "物攻",
  magicalAttack: "法攻",
  physicalDefense: "物防",
  magicalDefense: "法防",
  speed: "速度",
};

export const SPIRIT_BEAST_AFFINITY_LABELS: Record<SpiritBeastAffinity, string> =
  {
    fireAffinity: "火",
    waterAffinity: "水",
    electricAffinity: "电",
    poisonAffinity: "毒",
    iceAffinity: "冰",
    windAffinity: "风",
  };

export const SPIRIT_BEAST_QUALIFICATION_LABELS: Record<
  SpiritBeastQualification,
  string
> = {
  physicalAttack: "物攻资质",
  physicalDefense: "物防资质",
  health: "气血资质",
  spirit: "灵力资质",
  speed: "速度资质",
};

export const SPIRIT_BEAST_QUALIFICATION_SHORT_LABELS: Record<
  SpiritBeastQualification,
  string
> = {
  physicalAttack: "物攻",
  physicalDefense: "物防",
  health: "气血",
  spirit: "灵力",
  speed: "速度",
};
