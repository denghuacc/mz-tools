import type { Sect, Attributes, AttributeValue } from "../types";
import { SECT_TO_PROFESSION, SECT_WEAPON_TYPES } from "../types/constants";
import { ProfessionEnum, SectEnum, AttributeTypeEnum } from "../types";

// 获取门派的有效属性
export const getEffectiveAttributeBySect = (
  sect: Sect
): keyof Attributes | null => {
  const profession = SECT_TO_PROFESSION[sect];
  switch (profession) {
    case ProfessionEnum.PHYSICAL:
      return AttributeTypeEnum.PHYSICAL;
    case ProfessionEnum.MAGIC:
      return AttributeTypeEnum.MAGIC;
    case ProfessionEnum.HEALING:
      return AttributeTypeEnum.HEALING;
    case ProfessionEnum.SEAL:
      return null;
    default:
      return null;
  }
};

// 属性转换工具函数
export const convertAttributeValues = (
  sourceAttr: AttributeValue,
  targetAttr: AttributeValue
): [AttributeValue, AttributeValue] => {
  const sourceRatio = sourceAttr.current / sourceAttr.max;
  const targetRatio = targetAttr.current / targetAttr.max;

  return [
    { ...sourceAttr, current: Math.round(sourceAttr.max * targetRatio) },
    { ...targetAttr, current: Math.round(targetAttr.max * sourceRatio) },
  ];
};

// 公共转换逻辑
export const performAttributeConversion = (
  attributes: Attributes,
  fromSect: Sect,
  toSect: Sect
): Attributes => {
  const newAttributes = { ...attributes };
  const fromEffectiveAttr = getEffectiveAttributeBySect(fromSect);
  const toEffectiveAttr = getEffectiveAttributeBySect(toSect);

  if (
    fromEffectiveAttr &&
    toEffectiveAttr &&
    fromEffectiveAttr !== toEffectiveAttr
  ) {
    // 获取源和目标属性的值
    const fromAttr = attributes[fromEffectiveAttr];
    const toAttr = attributes[toEffectiveAttr];

    // 转换属性值
    const [newFromAttr, newToAttr] = convertAttributeValues(fromAttr, toAttr);

    // 更新属性值
    newAttributes[fromEffectiveAttr] = newFromAttr;
    newAttributes[toEffectiveAttr] = newToAttr;
  }

  return newAttributes;
};

// 根据武器类型获取门派（用于反向查找）
export const getSectByWeaponType = (weaponType: string): Sect => {
  for (const [sect, type] of Object.entries(SECT_WEAPON_TYPES)) {
    if (type === weaponType) {
      return sect as Sect;
    }
  }
  return SectEnum.GHOST_KING; // 默认值
};
