import {
  CHARACTER_ATTRIBUTES_STORAGE_KEY,
  CHARACTER_PROFILES_STORAGE_KEY,
  LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
} from "../calculatorStorage";
import {
  activateCharacterProfileSlot,
  createEmptyCharacterProfileSlots,
  loadCharacterProfileSlots,
  loadCurrentCharacterStateSnapshot,
  normalizeCharacterProfileName,
  normalizeCharacterProfileSlots,
  replaceCharacterProfileSlot,
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
    expect(
      window.localStorage.getItem(CHARACTER_PROFILES_STORAGE_KEY),
    ).not.toBeNull();

    restoreCharacterStateSnapshot(populatedSlots[0].characterState);
    expect(loadCurrentCharacterStateSnapshot()).toEqual(
      populatedSlots[0].characterState,
    );

    window.localStorage.setItem(CHARACTER_ATTRIBUTES_STORAGE_KEY, "损坏数据");
    expect(loadCurrentCharacterStateSnapshot()).toEqual({});
  });

  it("应该校验存档根结构、名称和装备状态", () => {
    const equipmentState = createInitialEquipmentCalculatorState();

    expect(normalizeCharacterProfileSlots({})).toBeNull();
    expect(
      normalizeCharacterProfileSlots([
        {
          name: 123,
          characterState: {},
          equipmentState: {},
        },
      ]),
    ).toEqual([null, null, null]);
    expect(normalizeCharacterProfileName(null, 1)).toBe("角色2");
    expect(normalizeCharacterProfileName("   ", 2)).toBe("角色3");

    const slots = normalizeCharacterProfileSlots([
      null,
      {
        name: "角色2",
        characterState: {},
        equipmentState,
        isActive: true,
      },
      {
        name: "角色3",
        characterState: {},
        equipmentState,
        isActive: true,
      },
    ]);

    expect(slots?.[1]?.isActive).toBe(true);
    expect(slots?.[2]?.isActive).toBe(false);
  });

  it("应该替换或激活任意存档位并停用其它存档", () => {
    const equipmentState = createInitialEquipmentCalculatorState();
    const profile = {
      name: "测试角色",
      characterState: {},
      equipmentState,
      isActive: true,
    };
    const first = replaceCharacterProfileSlot(
      createEmptyCharacterProfileSlots(),
      0,
      profile,
    );
    const second = replaceCharacterProfileSlot(first, 1, profile);
    const third = replaceCharacterProfileSlot(second, 2, profile);

    expect(first.map((slot) => slot?.isActive ?? null)).toEqual([
      true,
      null,
      null,
    ]);
    expect(second.map((slot) => slot?.isActive ?? null)).toEqual([
      false,
      true,
      null,
    ]);
    expect(third.map((slot) => slot?.isActive ?? null)).toEqual([
      false,
      false,
      true,
    ]);

    expect(
      activateCharacterProfileSlot(third, 0).map(
        (slot) => slot?.isActive ?? null,
      ),
    ).toEqual([true, false, false]);
    expect(
      activateCharacterProfileSlot([null, third[1], null], 1).map(
        (slot) => slot?.isActive ?? null,
      ),
    ).toEqual([null, true, null]);
  });

  it("当前版本没有快照时应该读取合法的旧版角色配置", () => {
    window.localStorage.setItem(
      LEGACY_CHARACTER_ATTRIBUTES_STORAGE_KEY,
      JSON.stringify({ skillBonuses: { health: 88 } }),
    );

    expect(loadCurrentCharacterStateSnapshot()).toEqual({
      skillBonuses: { health: 88 },
    });
  });
});
