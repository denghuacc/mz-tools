import type { Profession, RuleVerification, Sect } from "../types";
import { ProfessionEnum } from "../types";
import { SECT_TO_PROFESSION } from "../types/constants";

export const RING_RULE_VERIFICATION = {
  status: "needs-review",
  verifiedAt: null,
  sourceNote: "历史录入规则",
} as const satisfies RuleVerification;

export type RingSecondaryAttributeType = "physical" | "magic" | "speed";

export type RingSecondaryAttributeConfig = {
  type: RingSecondaryAttributeType;
  label: "物攻" | "法攻" | "速度";
  conversionBase: 27 | 10;
};

const RING_SECONDARY_ATTRIBUTE_BY_PROFESSION: Record<
  Profession,
  RingSecondaryAttributeConfig
> = {
  [ProfessionEnum.PHYSICAL]: {
    type: "physical",
    label: "物攻",
    conversionBase: 27,
  },
  [ProfessionEnum.MAGIC]: {
    type: "magic",
    label: "法攻",
    conversionBase: 27,
  },
  [ProfessionEnum.HEALING]: {
    type: "speed",
    label: "速度",
    conversionBase: 10,
  },
  [ProfessionEnum.SEAL]: {
    type: "speed",
    label: "速度",
    conversionBase: 10,
  },
};

export const getRingSecondaryAttributeConfig = (
  sect: Sect
): RingSecondaryAttributeConfig =>
  RING_SECONDARY_ATTRIBUTE_BY_PROFESSION[SECT_TO_PROFESSION[sect]];

export const convertRingSecondaryAttribute = (
  current: number,
  fromSect: Sect,
  toSect: Sect
): number => {
  const source = getRingSecondaryAttributeConfig(fromSect);
  const target = getRingSecondaryAttributeConfig(toSect);

  // 戒指属性会随角色等级成长，这里的基准值只用于换算职业属性比例。
  return Math.round(
    (current / source.conversionBase) * target.conversionBase
  );
};
