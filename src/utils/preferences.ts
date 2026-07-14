import type { Sect, WeaponLevel } from "../types";
import { SectEnum } from "../types";

export type CalculatorTool = "weapon" | "ring";

export type UserPreferences = {
  activeTool: CalculatorTool;
  weaponLevel: WeaponLevel;
  weaponCurrentSect: Sect;
  weaponTargetSect: Sect;
  ringCurrentSect: Sect;
  ringTargetSect: Sect;
};

export const PREFERENCES_STORAGE_KEY = "mz-tools.preferences.v1";

export const DEFAULT_PREFERENCES: UserPreferences = {
  activeTool: "weapon",
  weaponLevel: 60,
  weaponCurrentSect: SectEnum.GHOST_KING,
  weaponTargetSect: SectEnum.QINGYUN,
  ringCurrentSect: SectEnum.GHOST_KING,
  ringTargetSect: SectEnum.QINGYUN,
};

const SECT_VALUES = new Set<string>(Object.values(SectEnum));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isCalculatorTool = (value: unknown): value is CalculatorTool =>
  value === "weapon" || value === "ring";

const isWeaponLevel = (value: unknown): value is WeaponLevel =>
  value === 60 || value === "60-standard" || value === 80 || value === 110;

const isSect = (value: unknown): value is Sect =>
  typeof value === "string" && SECT_VALUES.has(value);

const normalizePreferences = (value: unknown): UserPreferences => {
  if (!isRecord(value)) return DEFAULT_PREFERENCES;

  return {
    activeTool: isCalculatorTool(value.activeTool)
      ? value.activeTool
      : DEFAULT_PREFERENCES.activeTool,
    weaponLevel: isWeaponLevel(value.weaponLevel)
      ? value.weaponLevel
      : DEFAULT_PREFERENCES.weaponLevel,
    weaponCurrentSect: isSect(value.weaponCurrentSect)
      ? value.weaponCurrentSect
      : DEFAULT_PREFERENCES.weaponCurrentSect,
    weaponTargetSect: isSect(value.weaponTargetSect)
      ? value.weaponTargetSect
      : DEFAULT_PREFERENCES.weaponTargetSect,
    ringCurrentSect: isSect(value.ringCurrentSect)
      ? value.ringCurrentSect
      : DEFAULT_PREFERENCES.ringCurrentSect,
    ringTargetSect: isSect(value.ringTargetSect)
      ? value.ringTargetSect
      : DEFAULT_PREFERENCES.ringTargetSect,
  };
};

/** 读取并校验可选偏好；存储不可用时安全回退默认值。 */
export const loadPreferences = (): UserPreferences => {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    return stored ? normalizePreferences(JSON.parse(stored)) : DEFAULT_PREFERENCES;
  } catch {
    // 隐私模式或禁用存储不应阻止计算器使用。
    return DEFAULT_PREFERENCES;
  }
};

/** 合并最小偏好字段，不保存属性输入、错误或计算结果。 */
export const updatePreferences = (
  changes: Partial<UserPreferences>
): UserPreferences => {
  const preferences = { ...loadPreferences(), ...changes };

  try {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    );
  } catch {
    // 偏好持久化失败不影响当前页面内的交互。
  }

  return preferences;
};
