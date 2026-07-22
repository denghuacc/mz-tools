import {
  CHARACTER_ATTRIBUTES_STORAGE_KEY,
  CHARACTER_PROFILES_STORAGE_KEY,
} from "../calculatorStorage";
import {
  createEmptyCharacterProfileSlots,
  loadCharacterProfileSlots,
  loadCurrentCharacterStateSnapshot,
  normalizeCharacterProfileSlots,
  restoreCharacterStateSnapshot,
  saveCharacterProfileSlots,
} from "../characterProfiles";
import { createInitialEquipmentCalculatorState } from "../equipmentAttributes";

describe("characterProfiles", () => {
  it("应该分别校验三个存档位并清空损坏槽位", () => {
    const equipmentState = createInitialEquipmentCalculatorState();
    const slots = normalizeCharacterProfileSlots([
      {
        name: "  鬼王69  ",
        characterState: { skillBonuses: { health: 100 } },
        equipmentState,
      },
      { name: "损坏存档", characterState: null, equipmentState },
      null,
      { name: "超出上限", characterState: {}, equipmentState },
    ]);

    expect(slots).toEqual([
      {
        name: "鬼王69",
        characterState: { skillBonuses: { health: 100 } },
        equipmentState,
        isActive: false,
      },
      null,
      null,
    ]);
  });

  it("应该持久化三个存档并安全读取角色面板快照", () => {
    const equipmentState = createInitialEquipmentCalculatorState();
    const slots = createEmptyCharacterProfileSlots();
    const populatedSlots = [
      {
        name: "角色1",
        characterState: { skillBonuses: { health: 100 } },
        equipmentState,
        isActive: true,
      },
      slots[1],
      slots[2],
    ] as const;

    saveCharacterProfileSlots(populatedSlots);
    expect(loadCharacterProfileSlots()).toEqual(populatedSlots);
    expect(window.localStorage.getItem(CHARACTER_PROFILES_STORAGE_KEY)).not.toBeNull();

    restoreCharacterStateSnapshot(populatedSlots[0].characterState);
    expect(loadCurrentCharacterStateSnapshot()).toEqual(
      populatedSlots[0].characterState
    );

    window.localStorage.setItem(CHARACTER_ATTRIBUTES_STORAGE_KEY, "损坏数据");
    expect(loadCurrentCharacterStateSnapshot()).toEqual({});
  });
});
