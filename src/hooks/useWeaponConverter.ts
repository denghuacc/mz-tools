import { useState, useCallback } from "react";

// 门派类型定义
export type Sect =
  // 物理职业门派
  | "鬼王宗"
  | "天道府"
  | "万毒门"
  // 法师职业门派
  | "青云门"
  | "焚香谷"
  | "鬼道"
  | "寒风龙族"
  // 治疗职业门派
  | "天音寺"
  | "南疆古巫"
  | "万灵宫"
  // 封印职业门派
  | "合欢门"
  | "长生堂";

// 职业类型定义
export type Profession = "物理" | "法师" | "治疗" | "封印";

// 门派与职业的映射关系
export const SECT_TO_PROFESSION: Record<Sect, Profession> = {
  // 物理职业门派
  鬼王宗: "物理",
  天道府: "物理",
  万毒门: "物理",
  // 法师职业门派
  青云门: "法师",
  焚香谷: "法师",
  鬼道: "法师",
  寒风龙族: "法师",
  // 治疗职业门派
  天音寺: "治疗",
  南疆古巫: "治疗",
  万灵宫: "治疗",
  // 封印职业门派
  合欢门: "封印",
  长生堂: "封印",
};

// 按职业分组的门派
export const SECTS_BY_PROFESSION: Record<Profession, Sect[]> = {
  物理: ["鬼王宗", "天道府", "万毒门"],
  法师: ["青云门", "焚香谷", "鬼道", "寒风龙族"],
  治疗: ["天音寺", "南疆古巫", "万灵宫"],
  封印: ["合欢门", "长生堂"],
};

// 门派武器类型映射
export const SECT_WEAPON_TYPES: Record<Sect, string> = {
  // 物理职业门派
  鬼王宗: "刀",
  天道府: "枪",
  万毒门: "镰刀",
  // 法师职业门派
  青云门: "剑",
  焚香谷: "扇子",
  鬼道: "灯",
  寒风龙族: "弓箭",
  // 治疗职业门派
  天音寺: "禅杖",
  南疆古巫: "法杖",
  万灵宫: "琴",
  // 封印职业门派
  合欢门: "短刃",
  长生堂: "笔",
};

export const WEAPON_LEVELS = {
  60: {
    physical: 665,
    magic: 210,
    healing: 192,
  },
  110: {
    physical: 976,
    magic: 302,
    healing: 286,
  },
} as const;

export type WeaponLevel = keyof typeof WEAPON_LEVELS;

export type AttributeValue = {
  current: number;
  max: number;
};

export type Attributes = {
  physical: AttributeValue;
  magic: AttributeValue;
  healing: AttributeValue;
};

// 获取门派的有效属性
export const getEffectiveAttributeBySect = (
  sect: Sect
): keyof Attributes | null => {
  const profession = SECT_TO_PROFESSION[sect];
  switch (profession) {
    case "物理":
      return "physical";
    case "法师":
      return "magic";
    case "治疗":
      return "healing";
    case "封印":
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

export const useWeaponConverter = () => {
  const [weaponLevel, _setWeaponLevel] = useState<WeaponLevel>(60);
  const [currentSect, setCurrentSect] = useState<Sect>("鬼王宗");
  const [targetSect, setTargetSect] = useState<Sect>("青云门");
  const [attributes, setAttributes] = useState<Attributes>({
    physical: {
      current: undefined as unknown as number,
      max: undefined as unknown as number,
    },
    magic: {
      current: undefined as unknown as number,
      max: undefined as unknown as number,
    },
    healing: {
      current: undefined as unknown as number,
      max: undefined as unknown as number,
    },
  });
  const [result, setResult] = useState<Attributes | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setWeaponLevelAndMaxValues = useCallback((level: WeaponLevel) => {
    _setWeaponLevel(level);
    const maxValues = WEAPON_LEVELS[level];
    setAttributes((prev) => ({
      physical: { ...prev.physical, max: maxValues.physical },
      magic: { ...prev.magic, max: maxValues.magic },
      healing: { ...prev.healing, max: maxValues.healing },
    }));
  }, []);

  const convertAttributes = useCallback(() => {
    // 清除之前的错误
    setError(null);

    // 验证是否输入了完整的3个属性值
    const missingAttributes: string[] = [];

    if (attributes.physical.current === undefined) {
      missingAttributes.push("物攻");
    }
    if (attributes.magic.current === undefined) {
      missingAttributes.push("法攻");
    }
    if (attributes.healing.current === undefined) {
      missingAttributes.push("治疗");
    }

    if (missingAttributes.length > 0) {
      setError(`请完整输入${missingAttributes.join("、")}数值`);
      return;
    }

    // 验证所有属性值是否超过最大值
    const validationErrors: string[] = [];

    if (
      attributes.physical.current !== undefined &&
      attributes.physical.current > attributes.physical.max
    ) {
      validationErrors.push("物攻值不能超过最大值");
    }
    if (
      attributes.magic.current !== undefined &&
      attributes.magic.current > attributes.magic.max
    ) {
      validationErrors.push("法攻值不能超过最大值");
    }
    if (
      attributes.healing.current !== undefined &&
      attributes.healing.current > attributes.healing.max
    ) {
      validationErrors.push("治疗值不能超过最大值");
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join("，"));
      return;
    }

    // 获取当前门派和目标门派的职业类型
    const currentProfession = SECT_TO_PROFESSION[currentSect];
    const targetProfession = SECT_TO_PROFESSION[targetSect];

    // 如果是封印职业相关的转换，直接返回原属性
    if (currentProfession === "封印" || targetProfession === "封印") {
      setResult({ ...attributes });
      return;
    }

    const newAttributes = { ...attributes };
    const currentEffectiveAttr = getEffectiveAttributeBySect(currentSect);
    const targetEffectiveAttr = getEffectiveAttributeBySect(targetSect);

    if (
      currentEffectiveAttr &&
      targetEffectiveAttr &&
      currentEffectiveAttr !== targetEffectiveAttr
    ) {
      // 获取当前和目标属性的值
      const currentAttr = attributes[currentEffectiveAttr];
      const targetAttr = attributes[targetEffectiveAttr];

      // 转换属性值
      const [newCurrentAttr, newTargetAttr] = convertAttributeValues(
        currentAttr,
        targetAttr
      );

      // 更新属性值
      newAttributes[currentEffectiveAttr] = newCurrentAttr;
      newAttributes[targetEffectiveAttr] = newTargetAttr;
    }

    setResult(newAttributes);
  }, [attributes, currentSect, targetSect]);

  const resetAttributes = useCallback(() => {
    setAttributes((prev) => ({
      physical: {
        current: undefined as unknown as number,
        max: prev.physical.max,
      },
      magic: { current: undefined as unknown as number, max: prev.magic.max },
      healing: {
        current: undefined as unknown as number,
        max: prev.healing.max,
      },
    }));
    setResult(null);
    setError(null);
  }, []);

  return {
    weaponLevel,
    setWeaponLevelAndMaxValues,
    currentSect,
    setCurrentSect,
    targetSect,
    setTargetSect,
    attributes,
    setAttributes,
    result,
    error,
    convertAttributes,
    resetAttributes,
  };
};
