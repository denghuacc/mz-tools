import { useState, useCallback } from "react";
import type { Sect, WeaponLevel, Attributes } from "../types";
import { WEAPON_LEVELS } from "../types/constants";
import {
  performAttributeConversion,
  getSectByWeaponType,
} from "../utils/weaponConverter";

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

  // 计算原造型数据
  const originalData = useCallback(() => {
    if (!originalForm) return null;

    // 计算当前造型转换到原造型后的数据
    return performAttributeConversion(
      attributes,
      currentSect,
      getSectByWeaponType(originalForm)
    );
  }, [attributes, currentSect, originalForm]);

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
    originalData: originalData(),
  };
};
