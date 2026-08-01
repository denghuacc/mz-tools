export const LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY =
  "mz-tools.character-attributes.v1";
export const CHARACTER_ATTRIBUTES_STORAGE_KEY =
  "mz-tools.character-attributes.v2";
export const LEGACY_EQUIPMENT_ATTRIBUTES_STORAGE_KEY =
  "mz-tools.equipment-attributes.v1";
export const EQUIPMENT_ATTRIBUTES_STORAGE_KEY =
  "mz-tools.equipment-attributes.v2";
export const CHARACTER_PROFILES_STORAGE_KEY = "mz-tools.character-profiles.v1";
export const SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY =
  "mz-tools.spirit-beast-attributes.v2";
export const SPIRIT_BEAST_PROFILES_STORAGE_KEY =
  "mz-tools.spirit-beast-profiles.v1";
export const SPIRIT_BEAST_FUSION_STORAGE_KEY =
  "mz-tools.spirit-beast-fusion.v1";

/** 读取并校验计算器状态；缓存损坏或存储不可用时回退默认值。 */
export const loadCalculatorState = <T>(
  storageKey: string,
  fallback: T,
  normalize: (value: unknown) => T | null,
): T => {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return fallback;

    return normalize(JSON.parse(stored)) ?? fallback;
  } catch {
    return fallback;
  }
};

/** 保存计算器输入状态；隐私模式或存储额度不足不阻断当前计算。 */
export const saveCalculatorState = <T>(storageKey: string, value: T): void => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // 当前页面中的 React 状态仍然可用，持久化失败无需中断交互。
  }
};
