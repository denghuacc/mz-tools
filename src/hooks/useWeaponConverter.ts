import { useState, useCallback } from "react";

export type Profession = "物理" | "法师" | "治疗" | "封印";

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

// 获取职业的有效属性
export const getEffectiveAttribute = (
  profession: Profession
): keyof Attributes | null => {
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
  const [currentProfession, setCurrentProfession] =
    useState<Profession>("物理");
  const [targetProfession, setTargetProfession] = useState<Profession>("法师");
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

    // 如果是封印职业相关的转换，直接返回原属性
    if (currentProfession === "封印" || targetProfession === "封印") {
      setResult({ ...attributes });
      return;
    }

    const newAttributes = { ...attributes };
    const currentEffectiveAttr = getEffectiveAttribute(currentProfession);
    const targetEffectiveAttr = getEffectiveAttribute(targetProfession);

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
  }, [attributes, currentProfession, targetProfession]);

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
    currentProfession,
    setCurrentProfession,
    targetProfession,
    setTargetProfession,
    attributes,
    setAttributes,
    result,
    error,
    convertAttributes,
    resetAttributes,
  };
};
