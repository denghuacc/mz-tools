import type {
  Sect,
  Attributes,
  AttributeValue,
  WeaponType,
} from "../types";
import { SECT_TO_PROFESSION, SECT_WEAPON_TYPES } from "../types/constants";
import { ProfessionEnum, SectEnum, AttributeTypeEnum } from "../types";

export type ConversionStepStatus =
  | "converted"
  | "seal-rule"
  | "same-attribute-type";

export type ConversionOutcome =
  | "changed"
  | "seal-rule"
  | "same-attribute-type"
  | "calculated-same";

type ConversionStepResult = {
  attributes: Attributes;
  status: ConversionStepStatus;
};

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

/**
 * 执行单步属性转换，并返回本次转换是否因游戏规则跳过。
 */
export const performAttributeConversionStep = (
  attributes: Attributes,
  fromSect: Sect,
  toSect: Sect
): ConversionStepResult => {
  const newAttributes = { ...attributes };
  const fromEffectiveAttr = getEffectiveAttributeBySect(fromSect);
  const toEffectiveAttr = getEffectiveAttributeBySect(toSect);

  if (!fromEffectiveAttr || !toEffectiveAttr) {
    return { attributes: newAttributes, status: "seal-rule" };
  }

  if (fromEffectiveAttr === toEffectiveAttr) {
    return { attributes: newAttributes, status: "same-attribute-type" };
  }

  const fromAttr = attributes[fromEffectiveAttr];
  const toAttr = attributes[toEffectiveAttr];
  const [newFromAttr, newToAttr] = convertAttributeValues(fromAttr, toAttr);

  newAttributes[fromEffectiveAttr] = newFromAttr;
  newAttributes[toEffectiveAttr] = newToAttr;

  return { attributes: newAttributes, status: "converted" };
};

// 保留只返回属性的公共接口，避免调用方需要了解结果提示逻辑。
export const performAttributeConversion = (
  attributes: Attributes,
  fromSect: Sect,
  toSect: Sect
): Attributes =>
  performAttributeConversionStep(attributes, fromSect, toSect).attributes;

/**
 * 根据最终数值和每一步的执行状态，给 UI 提供准确的结果说明原因。
 */
export const getConversionOutcome = (
  before: Attributes,
  after: Attributes,
  stepStatuses: readonly ConversionStepStatus[]
): ConversionOutcome => {
  const hasChanges = (Object.keys(before) as (keyof Attributes)[]).some(
    (type) => before[type].current !== after[type].current
  );

  if (hasChanges) return "changed";
  if (stepStatuses.includes("converted")) return "calculated-same";
  if (stepStatuses.includes("seal-rule")) return "seal-rule";
  return "same-attribute-type";
};

// 根据武器类型获取门派（用于反向查找）
export const getSectByWeaponType = (weaponType: WeaponType): Sect => {
  const sect = SECT_BY_WEAPON_TYPE.get(weaponType);
  if (sect) return sect;

  // 正常 UI 只能传入配置内的武器类型；抛错可以尽早暴露配置不一致。
  throw new Error(`未知武器类型：${weaponType}`);
};
