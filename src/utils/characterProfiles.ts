import {
  CHARACTER_ATTRIBUTES_STORAGE_KEY,
  CHARACTER_PROFILES_STORAGE_KEY,
  LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
  loadCalculatorState,
  saveCalculatorState,
} from "./calculatorStorage";
import {
  normalizeEquipmentCalculatorState,
  type EquipmentCalculatorState,
} from "./equipmentAttributes";

export const CHARACTER_PROFILE_SLOT_COUNT = 3;
export const CHARACTER_PROFILE_NAME_MAX_LENGTH = 20;

export type StoredCharacterCalculatorState = Record<string, unknown>;

export type CharacterProfile = {
  name: string;
  characterState: StoredCharacterCalculatorState;
  equipmentState: EquipmentCalculatorState;
  isActive: boolean;
};

export type CharacterProfileSlots = readonly [
  CharacterProfile | null,
  CharacterProfile | null,
  CharacterProfile | null,
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getDefaultCharacterProfileName = (slotIndex: number) =>
  `角色${slotIndex + 1}`;

export const normalizeCharacterProfileName = (
  value: unknown,
  slotIndex: number
) => {
  if (typeof value !== "string") {
    return getDefaultCharacterProfileName(slotIndex);
  }

  return (
    value.trim().slice(0, CHARACTER_PROFILE_NAME_MAX_LENGTH) ||
    getDefaultCharacterProfileName(slotIndex)
  );
};

export const createEmptyCharacterProfileSlots = (): CharacterProfileSlots => [
  null,
  null,
  null,
];

export const normalizeCharacterProfileSlots = (
  value: unknown
): CharacterProfileSlots | null => {
  if (!Array.isArray(value)) return null;

  const normalizeSlot = (slotIndex: number): CharacterProfile | null => {
    const candidate = value[slotIndex];
    if (!isRecord(candidate) || !isRecord(candidate.characterState)) {
      return null;
    }

    const equipmentState = normalizeEquipmentCalculatorState(
      candidate.equipmentState
    );
    if (!equipmentState) return null;

    return {
      name: normalizeCharacterProfileName(candidate.name, slotIndex),
      characterState: candidate.characterState,
      equipmentState,
      isActive: false,
    };
  };

  const slots = [normalizeSlot(0), normalizeSlot(1), normalizeSlot(2)] as const;
  const activeSlotIndex = slots.findIndex(
    (slot, slotIndex) =>
      slot !== null &&
      isRecord(value[slotIndex]) &&
      value[slotIndex].isActive === true
  );

  return [
    slots[0] ? { ...slots[0], isActive: activeSlotIndex === 0 } : null,
    slots[1] ? { ...slots[1], isActive: activeSlotIndex === 1 } : null,
    slots[2] ? { ...slots[2], isActive: activeSlotIndex === 2 } : null,
  ];
};

export const replaceCharacterProfileSlot = (
  slots: CharacterProfileSlots,
  slotIndex: number,
  profile: CharacterProfile
): CharacterProfileSlots => [
  slotIndex === 0 ? { ...profile, isActive: true } : deactivateProfile(slots[0]),
  slotIndex === 1 ? { ...profile, isActive: true } : deactivateProfile(slots[1]),
  slotIndex === 2 ? { ...profile, isActive: true } : deactivateProfile(slots[2]),
];

const deactivateProfile = (profile: CharacterProfile | null) =>
  profile ? { ...profile, isActive: false } : null;

export const activateCharacterProfileSlot = (
  slots: CharacterProfileSlots,
  slotIndex: number
): CharacterProfileSlots => [
  slots[0]
    ? { ...slots[0], isActive: slotIndex === 0 }
    : null,
  slots[1]
    ? { ...slots[1], isActive: slotIndex === 1 }
    : null,
  slots[2]
    ? { ...slots[2], isActive: slotIndex === 2 }
    : null,
];

/** 读取三个角色存档；单个损坏槽位会回退为空槽。 */
export const loadCharacterProfileSlots = (): CharacterProfileSlots =>
  loadCalculatorState(
    CHARACTER_PROFILES_STORAGE_KEY,
    createEmptyCharacterProfileSlots(),
    normalizeCharacterProfileSlots
  );

export const saveCharacterProfileSlots = (
  slots: CharacterProfileSlots
): void => {
  saveCalculatorState(CHARACTER_PROFILES_STORAGE_KEY, slots);
};

/** 获取角色面板自动保存的原始输入，供角色存档完整复制。 */
export const loadCurrentCharacterStateSnapshot =
  (): StoredCharacterCalculatorState => {
    const currentState = loadCalculatorState<StoredCharacterCalculatorState | null>(
      CHARACTER_ATTRIBUTES_STORAGE_KEY,
      null,
      (value) => (isRecord(value) ? value : null)
    );

    if (currentState) return currentState;

    return loadCalculatorState<StoredCharacterCalculatorState>(
      LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
      {},
      (value) => (isRecord(value) ? value : null)
    );
  };

export const restoreCharacterStateSnapshot = (
  state: StoredCharacterCalculatorState
): void => {
  saveCalculatorState(CHARACTER_ATTRIBUTES_STORAGE_KEY, state);
};
