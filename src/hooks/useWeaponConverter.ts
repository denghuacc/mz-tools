import { useState, useCallback } from "react";
import type {
  AttributeInputs,
  Attributes,
  Sect,
  WeaponLevel,
  WeaponType,
} from "../types";
import { ATTRIBUTE_FIELDS, WEAPON_LEVELS } from "../types/constants";
import {
  performAttributeConversion,
  getSectByWeaponType,
} from "../utils/weaponConverter";

const DEFAULT_WEAPON_LEVEL: WeaponLevel = 60;

const createEmptyAttributes = (level: WeaponLevel): AttributeInputs => {
  const maxValues = WEAPON_LEVELS[level];

  return {
    physical: { current: null, max: maxValues.physical },
    magic: { current: null, max: maxValues.magic },
    healing: { current: null, max: maxValues.healing },
  };
};

const toCompleteAttributes = (
  attributes: AttributeInputs
): Attributes | null => {
  const { physical, magic, healing } = attributes;

  if (
    physical.current === null ||
    magic.current === null ||
    healing.current === null
  ) {
    return null;
  }

  return {
    physical: { ...physical, current: physical.current },
    magic: { ...magic, current: magic.current },
    healing: { ...healing, current: healing.current },
  };
};

export const useWeaponConverter = () => {
  const [weaponLevel, setWeaponLevel] = useState<WeaponLevel>(
    DEFAULT_WEAPON_LEVEL
  );
  const [currentSect, setCurrentSect] = useState<Sect>("鬼王宗");
  const [targetSect, setTargetSect] = useState<Sect>("青云门");
  const [originalForm, setOriginalForm] = useState<WeaponType | null>(null);
  const [attributes, setAttributes] = useState<AttributeInputs>(() =>
    createEmptyAttributes(DEFAULT_WEAPON_LEVEL)
  );
  const [result, setResult] = useState<Attributes | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setWeaponLevelAndMaxValues = useCallback((level: WeaponLevel) => {
    setWeaponLevel(level);
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
  const setOriginalFormWithReset = useCallback((form: WeaponType | null) => {
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
    (
      newAttributes:
        | AttributeInputs
        | ((prev: AttributeInputs) => AttributeInputs)
    ) => {
      setAttributes(newAttributes);
      setResult(null);
      setError(null);
    },
    []
  );

  const convertAttributes = useCallback(() => {
    // 清除之前的错误
    setError(null);

    const missingAttributes = ATTRIBUTE_FIELDS.filter(
      ({ type }) => attributes[type].current === null
    ).map(({ label }) => label);

    if (missingAttributes.length > 0) {
      setError(`请完整输入${missingAttributes.join("、")}数值`);
      return;
    }

    const completeAttributes = toCompleteAttributes(attributes);
    if (!completeAttributes) return;

    const validationErrors = ATTRIBUTE_FIELDS.flatMap(({ type, label }) => {
      const attribute = completeAttributes[type];

      if (!Number.isFinite(attribute.current)) {
        return [`${label}值必须是有效数字`];
      }
      if (attribute.current < 0) {
        return [`${label}值不能小于0`];
      }
      if (attribute.current > attribute.max) {
        return [`${label}值不能超过最大值`];
      }
      return [];
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join("，"));
      return;
    }

    let finalAttributes = completeAttributes;

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

  const completeAttributes = toCompleteAttributes(attributes);
  const originalData =
    originalForm && completeAttributes
      ? performAttributeConversion(
          completeAttributes,
          currentSect,
          getSectByWeaponType(originalForm)
        )
      : null;

  const resetAttributes = useCallback(() => {
    setAttributes((prev) => ({
      physical: { current: null, max: prev.physical.max },
      magic: { current: null, max: prev.magic.max },
      healing: { current: null, max: prev.healing.max },
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
    originalData,
  };
};
