import type { Profession, Sect } from "../types";
import { ProfessionEnum } from "../types";
import { SECT_TO_PROFESSION } from "../types/constants";

export type RingSecondaryAttributeType = "physical" | "magic" | "speed";

export type RingSecondaryAttributeConfig = {
  type: RingSecondaryAttributeType;
  label: "物攻" | "法攻" | "速度";
  max: 27 | 10;
};

const RING_SECONDARY_ATTRIBUTE_BY_PROFESSION: Record<
  Profession,
  RingSecondaryAttributeConfig
> = {
  [ProfessionEnum.PHYSICAL]: { type: "physical", label: "物攻", max: 27 },
  [ProfessionEnum.MAGIC]: { type: "magic", label: "法攻", max: 27 },
  [ProfessionEnum.HEALING]: { type: "speed", label: "速度", max: 10 },
  [ProfessionEnum.SEAL]: { type: "speed", label: "速度", max: 10 },
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

  return Math.round((current / source.max) * target.max);
};
