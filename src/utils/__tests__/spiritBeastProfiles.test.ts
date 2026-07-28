import {
  SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
  SPIRIT_BEAST_PROFILES_STORAGE_KEY,
} from "../calculatorStorage";
import {
  activateSpiritBeastProfileSlot,
  createEmptySpiritBeastProfileSlots,
  loadCurrentSpiritBeastStateSnapshot,
  loadSpiritBeastProfileSlots,
  normalizeSpiritBeastProfileName,
  normalizeSpiritBeastProfileSlots,
  replaceSpiritBeastProfileSlot,
  restoreSpiritBeastStateSnapshot,
  saveSpiritBeastProfileSlots,
} from "../spiritBeastProfiles";
import { createDefaultSpiritBeastState } from "../spiritBeastAttributes";

describe("spiritBeastProfiles", () => {
  it("应该分别校验三个灵兽存档位并清空损坏槽位", () => {
    const state = createDefaultSpiritBeastState();
    state.level = 74;
    state.growth = 1.21;

    const slots = normalizeSpiritBeastProfileSlots([
      { name: "  物攻方案  ", state },
      { name: "损坏存档", state: null },
      null,
      { name: "超出上限", state },
    ]);

    expect(slots).toEqual([
      {
        name: "物攻方案",
        state,
        isActive: false,
      },
      null,
      null,
    ]);
  });

  it("应该持久化三个存档并安全读写灵兽面板快照", () => {
    const state = createDefaultSpiritBeastState();
    state.qualifications.physicalAttack = 1600;
    state.itemTraining.strength = 52;
    state.accessories.tierOne = {
      enabled: true,
      attribute: "health",
      value: 17,
    };
    state.enlightenment = {
      star: 1,
      qualificationBonuses: [
        { qualification: "health", value: 5 },
        { qualification: "physicalAttack", value: 23 },
      ],
      primaryBonuses: [{ attribute: "constitution", value: 3 }],
    };
    state.destiny.birthSkill = "divineCalculation";
    state.destiny.skills[0] = {
      attribute: "physicalAttack",
      level: 5,
      isMutated: true,
    };
    const slots = [
      {
        name: "灵兽1",
        state,
        isActive: true,
      },
      null,
      null,
    ] as const;

    saveSpiritBeastProfileSlots(slots);
    expect(loadSpiritBeastProfileSlots()).toEqual(slots);
    expect(
      window.localStorage.getItem(SPIRIT_BEAST_PROFILES_STORAGE_KEY),
    ).not.toBeNull();

    restoreSpiritBeastStateSnapshot(state);
    expect(loadCurrentSpiritBeastStateSnapshot()).toEqual(state);

    window.localStorage.setItem(
      SPIRIT_BEAST_ATTRIBUTES_STORAGE_KEY,
      "损坏数据",
    );
    expect(loadCurrentSpiritBeastStateSnapshot()).toEqual(
      createDefaultSpiritBeastState(),
    );
  });

  it("应该校验存档根结构、名称和活动槽位", () => {
    const state = createDefaultSpiritBeastState();

    expect(normalizeSpiritBeastProfileSlots({})).toBeNull();
    expect(
      normalizeSpiritBeastProfileSlots([
        { name: "灵兽1", state: {} },
        null,
        null,
      ]),
    ).toEqual([
      {
        name: "灵兽1",
        state: createDefaultSpiritBeastState(),
        isActive: false,
      },
      null,
      null,
    ]);
    expect(normalizeSpiritBeastProfileName(null, 1)).toBe("灵兽2");
    expect(normalizeSpiritBeastProfileName("   ", 2)).toBe("灵兽3");

    const slots = normalizeSpiritBeastProfileSlots([
      null,
      { name: "灵兽2", state, isActive: true },
      { name: "灵兽3", state, isActive: true },
    ]);

    expect(slots?.[1]?.isActive).toBe(true);
    expect(slots?.[2]?.isActive).toBe(false);
  });

  it("应该替换或激活任意灵兽存档位并停用其它存档", () => {
    const profile = {
      name: "测试灵兽",
      state: createDefaultSpiritBeastState(),
      isActive: true,
    };
    const first = replaceSpiritBeastProfileSlot(
      createEmptySpiritBeastProfileSlots(),
      0,
      profile,
    );
    const second = replaceSpiritBeastProfileSlot(first, 1, profile);
    const third = replaceSpiritBeastProfileSlot(second, 2, profile);

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
      activateSpiritBeastProfileSlot(third, 0).map(
        (slot) => slot?.isActive ?? null,
      ),
    ).toEqual([true, false, false]);
  });
});
