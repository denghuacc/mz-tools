import {
  calculateCharacterTrainingBonuses,
  createDefaultCharacterTrainingLevels,
  normalizeCharacterTrainingLevels,
} from "../characterTraining";

describe("characterTraining", () => {
  it("应该让默认 1 级修炼按每级基础值计入属性", () => {
    const bonuses = calculateCharacterTrainingBonuses(
      createDefaultCharacterTrainingLevels(),
    );

    expect(bonuses.healingPower).toBe(5);
    expect(bonuses.sealHit).toBe(2);
    expect(bonuses.sealResistance).toBe(2);
  });

  it("应该把 12 级突破按有效 13 级计算", () => {
    const bonuses = calculateCharacterTrainingBonuses({
      attack: { level: 12, breakthrough: true },
      physicalDefense: { level: 12, breakthrough: true },
      magicDefense: { level: 12, breakthrough: true },
    });

    expect(bonuses.healingPower).toBe(65);
    expect(bonuses.sealHit).toBe(26);
    expect(bonuses.sealResistance).toBe(26);
  });

  it("应该清理非法缓存和未满级的突破状态", () => {
    expect(
      normalizeCharacterTrainingLevels({
        attack: { level: 12, breakthrough: true },
        physicalDefense: { level: 11, breakthrough: true },
        magicDefense: { level: 13, breakthrough: true },
      }),
    ).toEqual({
      attack: { level: 12, breakthrough: true },
      physicalDefense: { level: 11, breakthrough: false },
      magicDefense: { level: 1, breakthrough: false },
    });
  });
});
