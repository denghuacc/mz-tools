import {
  SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
  SPIRIT_BEAST_PROFILES_STORAGE_KEY,
  loadCalculatorState,
  saveCalculatorState,
} from "./calculatorStorage";
import {
  createDefaultSpiritBeastState,
  normalizeSpiritBeastCalculatorState,
  type SpiritBeastCalculatorState,
} from "./spiritBeastAttributes";

export const SPIRIT_BEAST_PROFILE_SLOT_COUNT = 3;
export const SPIRIT_BEAST_PROFILE_NAME_MAX_LENGTH = 20;

export type SpiritBeastProfile = {
  name: string;
  state: SpiritBeastCalculatorState;
  isActive: boolean;
};

export type SpiritBeastProfileSlots = readonly [
  SpiritBeastProfile | null,
  SpiritBeastProfile | null,
  SpiritBeastProfile | null,
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getDefaultSpiritBeastProfileName = (slotIndex: number) =>
  `灵兽${slotIndex + 1}`;

export const normalizeSpiritBeastProfileName = (
  value: unknown,
  slotIndex: number,
) => {
  if (typeof value !== "string") {
    return getDefaultSpiritBeastProfileName(slotIndex);
  }

  return (
    value.trim().slice(0, SPIRIT_BEAST_PROFILE_NAME_MAX_LENGTH) ||
    getDefaultSpiritBeastProfileName(slotIndex)
  );
};

export const createEmptySpiritBeastProfileSlots =
  (): SpiritBeastProfileSlots => [null, null, null];

export const normalizeSpiritBeastProfileSlots = (
  value: unknown,
): SpiritBeastProfileSlots | null => {
  if (!Array.isArray(value)) return null;

  const normalizeSlot = (slotIndex: number): SpiritBeastProfile | null => {
    const candidate = value[slotIndex];
    if (!isRecord(candidate)) return null;

    const state = normalizeSpiritBeastCalculatorState(candidate.state);
    if (!state) return null;

    return {
      name: normalizeSpiritBeastProfileName(candidate.name, slotIndex),
      state,
      isActive: false,
    };
  };

  const slots = [normalizeSlot(0), normalizeSlot(1), normalizeSlot(2)] as const;
  const activeSlotIndex = slots.findIndex(
    (slot, slotIndex) =>
      slot !== null &&
      isRecord(value[slotIndex]) &&
      value[slotIndex].isActive === true,
  );

  return [
    slots[0] ? { ...slots[0], isActive: activeSlotIndex === 0 } : null,
    slots[1] ? { ...slots[1], isActive: activeSlotIndex === 1 } : null,
    slots[2] ? { ...slots[2], isActive: activeSlotIndex === 2 } : null,
  ];
};

const deactivateProfile = (profile: SpiritBeastProfile | null) =>
  profile ? { ...profile, isActive: false } : null;

export const replaceSpiritBeastProfileSlot = (
  slots: SpiritBeastProfileSlots,
  slotIndex: number,
  profile: SpiritBeastProfile,
): SpiritBeastProfileSlots => [
  slotIndex === 0
    ? { ...profile, isActive: true }
    : deactivateProfile(slots[0]),
  slotIndex === 1
    ? { ...profile, isActive: true }
    : deactivateProfile(slots[1]),
  slotIndex === 2
    ? { ...profile, isActive: true }
    : deactivateProfile(slots[2]),
];

export const activateSpiritBeastProfileSlot = (
  slots: SpiritBeastProfileSlots,
  slotIndex: number,
): SpiritBeastProfileSlots => [
  slots[0] ? { ...slots[0], isActive: slotIndex === 0 } : null,
  slots[1] ? { ...slots[1], isActive: slotIndex === 1 } : null,
  slots[2] ? { ...slots[2], isActive: slotIndex === 2 } : null,
];

/** 读取三个灵兽存档；单个损坏槽位会回退为空槽。 */
export const loadSpiritBeastProfileSlots = (): SpiritBeastProfileSlots =>
  loadCalculatorState(
    SPIRIT_BEAST_PROFILES_STORAGE_KEY,
    createEmptySpiritBeastProfileSlots(),
    normalizeSpiritBeastProfileSlots,
  );

export const saveSpiritBeastProfileSlots = (
  slots: SpiritBeastProfileSlots,
): void => {
  saveCalculatorState(SPIRIT_BEAST_PROFILES_STORAGE_KEY, slots);
};

/** 获取灵兽面板自动保存的原始输入，供灵兽存档完整复制。 */
export const loadCurrentSpiritBeastStateSnapshot =
  (): SpiritBeastCalculatorState =>
    loadCalculatorState(
      SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
      createDefaultSpiritBeastState(),
      normalizeSpiritBeastCalculatorState,
    );

export const restoreSpiritBeastStateSnapshot = (
  state: SpiritBeastCalculatorState,
): void => {
  saveCalculatorState(SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY, state);
};
