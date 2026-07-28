import {
  SPIRIT_BEAST_DESTINY_SKILL_OPTIONS,
  calculateSpiritBeastDestinyBonuses,
  countConfiguredSpiritBeastDestinySkills,
  createEmptySpiritBeastDestiny,
  getSpiritBeastDestinySkillValue,
  normalizeSpiritBeastDestiny,
} from "../spiritBeastDestiny";

describe("灵兽命格", () => {
  it("默认应该没有任何面板命技", () => {
    expect(createEmptySpiritBeastDestiny()).toEqual({
      birthSkill: "none",
      skills: [],
    });
  });

  it("应该保存截图中的普通和变异命技数值", () => {
    expect(
      SPIRIT_BEAST_DESTINY_SKILL_OPTIONS.map(
        ({ label, normalValues, mutatedValues }) => ({
          label,
          normalValues,
          mutatedValues,
        }),
      ),
    ).toEqual([
      {
        label: "气血",
        normalValues: [30, 50, 70, 90, 110],
        mutatedValues: [40, 70, 100, 130, 160],
      },
      {
        label: "法力",
        normalValues: [45, 75, 105, 135, 165],
        mutatedValues: [60, 105, 150, 195, 240],
      },
      {
        label: "物攻",
        normalValues: [9, 15, 21, 27, 33],
        mutatedValues: [12, 21, 30, 39, 48],
      },
      {
        label: "法攻",
        normalValues: [7, 12, 17, 22, 27],
        mutatedValues: [9, 17, 24, 32, 39],
      },
      {
        label: "物防",
        normalValues: [9, 15, 21, 27, 33],
        mutatedValues: [12, 21, 30, 39, 48],
      },
      {
        label: "法防",
        normalValues: [7, 12, 17, 22, 27],
        mutatedValues: [9, 17, 24, 32, 39],
      },
      {
        label: "速度",
        normalValues: [3, 5, 7, 9, 11],
        mutatedValues: [4, 7, 10, 13, 16],
      },
    ]);
  });

  it("应该汇总六个命技并应用被动·神机妙算的等级减速", () => {
    const destiny = createEmptySpiritBeastDestiny();
    destiny.birthSkill = "divineCalculation";
    destiny.skills = [
      { attribute: "health", level: 5, isMutated: true },
      { attribute: "mana", level: 4, isMutated: false },
      { attribute: "physicalAttack", level: 3, isMutated: true },
      { attribute: "magicalAttack", level: 2, isMutated: false },
      { attribute: "physicalDefense", level: 1, isMutated: true },
      { attribute: "speed", level: 5, isMutated: true },
    ];

    expect(calculateSpiritBeastDestinyBonuses(destiny, 69)).toEqual({
      health: 160,
      mana: 135,
      physicalAttack: 30,
      magicalAttack: 12,
      physicalDefense: 12,
      magicalDefense: 0,
      speed: -53,
    });
    expect(countConfiguredSpiritBeastDestinySkills(destiny)).toBe(6);
    expect(getSpiritBeastDestinySkillValue(destiny.skills[0])).toBe(160);
  });

  it("应该清除无效和重复属性并限制最多读取六个命技", () => {
    const normalized = normalizeSpiritBeastDestiny({
      birthSkill: "divineCalculation",
      skills: [
        { attribute: "physicalAttack", level: 99, isMutated: true },
        { attribute: "physicalAttack", level: -2, isMutated: false },
        { attribute: "speed", level: "3", isMutated: true },
        { attribute: "unknown", level: 4, isMutated: true },
        null,
        { attribute: "health", level: 2 },
        { attribute: "mana", level: 5 },
      ],
    });

    expect(normalized.birthSkill).toBe("divineCalculation");
    expect(normalized.skills).toEqual([
      {
        attribute: "physicalAttack",
        level: 5,
        isMutated: true,
      },
      {
        attribute: "speed",
        level: 3,
        isMutated: true,
      },
      {
        attribute: "health",
        level: 2,
        isMutated: false,
      },
    ]);
  });
});
