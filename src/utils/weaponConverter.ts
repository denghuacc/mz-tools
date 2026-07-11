import type {
  Sect,
  Attributes,
  AttributeValue,
  WeaponType,
} from "../types";
import { SECT_TO_PROFESSION, SECT_WEAPON_TYPES } from "../types/constants";
import { ProfessionEnum, SectEnum, AttributeTypeEnum } from "../types";

const SECT_BY_WEAPON_TYPE = new Map<WeaponType, Sect>(
  Object.values(SectEnum).map((sect) => [SECT_WEAPON_TYPES[sect], sect])
);

// 获取武器转换时参与等比例互换的属性；封系与其他系别互转时武器属性保持不变。
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
export const getSectByWeaponType = (weaponType: WeaponType): Sect => {
  const sect = SECT_BY_WEAPON_TYPE.get(weaponType);
  if (sect) return sect;

  // 正常 UI 只能传入配置内的武器类型；抛错可以尽早暴露配置不一致。
  throw new Error(`未知武器类型：${weaponType}`);
};
