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

export const useWeaponConverter = () => {
  const [weaponLevel, _setWeaponLevel] = useState<WeaponLevel>(60);
  const [currentSect, setCurrentSect] = useState<Sect>("鬼王宗");
  const [targetSect, setTargetSect] = useState<Sect>("青云门");
  const [originalForm, setOriginalForm] = useState<string | null>(null);
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
    // 清空转换结果和错误信息
    setResult(null);
    setError(null);
  }, []);

  // 修改原造型时清空结果
  const setOriginalFormWithReset = useCallback((form: string | null) => {
    setOriginalForm(form);
    setResult(null);
    setError(null);
  }, []);

  // 修改门派选择时清空结果
  const setCurrentSectWithReset = useCallback((sect: Sect) => {
    setCurrentSect(sect);
    setResult(null);
    setError(null);
  }, []);

  const setTargetSectWithReset = useCallback((sect: Sect) => {
    setTargetSect(sect);
    setResult(null);
    setError(null);
  }, []);

  // 修改属性时清空结果
  const setAttributesWithReset = useCallback(
    (newAttributes: Attributes | ((prev: Attributes) => Attributes)) => {
      setAttributes(newAttributes);
      setResult(null);
      setError(null);
    },
    []
  );

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

    let finalAttributes = { ...attributes };

    if (originalForm) {
      // 如果选择了原造型，需要两次转换
      // 第一次：当前造型 → 原造型
      const firstConversion = performAttributeConversion(
        finalAttributes,
        currentSect,
        getSectByWeaponType(originalForm)
      );
      finalAttributes = firstConversion;

      // 第二次：原造型 → 目标造型
      const secondConversion = performAttributeConversion(
        finalAttributes,
        getSectByWeaponType(originalForm),
        targetSect
      );
      finalAttributes = secondConversion;
    } else {
      // 直接转换
      finalAttributes = performAttributeConversion(
        finalAttributes,
        currentSect,
        targetSect
      );
    }

    setResult(finalAttributes);
  }, [attributes, currentSect, targetSect, originalForm]);

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
    setOriginalForm(null);
  }, []);

  return {
    weaponLevel,
    setWeaponLevelAndMaxValues,
    currentSect,
    setCurrentSect: setCurrentSectWithReset,
    targetSect,
    setTargetSect: setTargetSectWithReset,
    originalForm,
    setOriginalForm: setOriginalFormWithReset,
    attributes,
    setAttributes: setAttributesWithReset,
    result,
    error,
    convertAttributes,
    resetAttributes,
  };
};

// 根据武器类型获取门派（用于反向查找）
const getSectByWeaponType = (weaponType: string): Sect => {
  for (const [sect, type] of Object.entries(SECT_WEAPON_TYPES)) {
    if (type === weaponType) {
      return sect as Sect;
    }
  }
  return "鬼王宗"; // 默认值
};
