import {
  calculateSpiritBeastEnlightenmentBonuses,
  createEmptySpiritBeastEnlightenment,
  getSpiritBeastEnlightenmentPrimaryCount,
  getSpiritBeastEnlightenmentPrimaryValueMaximum,
  getSpiritBeastEnlightenmentValidationError,
  normalizeSpiritBeastEnlightenment,
} from "../spiritBeastEnlightenment";

describe("灵兽仙府点化", () => {
  it("应该按星级确定五维词条数量和数值上限", () => {
    expect(
      [1, 2, 3, 4, 5].map((star) =>
        getSpiritBeastEnlightenmentPrimaryCount(star as 1 | 2 | 3 | 4 | 5),
      ),
    ).toEqual([1, 1, 2, 2, 3]);

    expect(getSpiritBeastEnlightenmentPrimaryValueMaximum(1, 0)).toBe(5);
    expect(getSpiritBeastEnlightenmentPrimaryValueMaximum(2, 0)).toBe(10);
    expect(getSpiritBeastEnlightenmentPrimaryValueMaximum(3, 1)).toBe(15);
    expect(getSpiritBeastEnlightenmentPrimaryValueMaximum(4, 0)).toBe(20);
    expect(getSpiritBeastEnlightenmentPrimaryValueMaximum(5, 2)).toBe(15);
  });

  it("应该清理重复词条，并按 5 星规则收紧数量和数值", () => {
    const enlightenment = normalizeSpiritBeastEnlightenment({
      star: 5,
      qualificationBonuses: [
        { qualification: "physicalAttack", value: 23 },
        { qualification: "physicalAttack", value: 99 },
        { qualification: "speed", value: "8" },
        { qualification: "health", value: 5 },
      ],
      primaryBonuses: [
        { attribute: "constitution", value: 30 },
        { attribute: "constitution", value: 10 },
        { attribute: "spirit", value: 30 },
        { attribute: "strength", value: 13 },
        { attribute: "endurance", value: 14 },
      ],
    });

    expect(enlightenment).toEqual({
      star: 5,
      qualificationBonuses: [
        { qualification: "physicalAttack", value: 23 },
        { qualification: "speed", value: 8 },
      ],
      primaryBonuses: [
        { attribute: "constitution", value: 20 },
        { attribute: "spirit", value: 15 },
        { attribute: "strength", value: 13 },
      ],
    });
    expect(
      getSpiritBeastEnlightenmentValidationError(enlightenment),
    ).toBeNull();
  });

  it("应该汇总两项资质和五维，并识别未完成配置", () => {
    const empty = createEmptySpiritBeastEnlightenment();
    expect(getSpiritBeastEnlightenmentValidationError(empty)).toBeNull();

    const incomplete = normalizeSpiritBeastEnlightenment({
      star: 3,
      qualificationBonuses: [{ qualification: "health", value: 5 }],
      primaryBonuses: [{ attribute: "constitution", value: 13 }],
    });
    expect(getSpiritBeastEnlightenmentValidationError(incomplete)).toBe(
      "仙府点化必须选择 2 项不同资质。",
    );

    const bonuses = calculateSpiritBeastEnlightenmentBonuses({
      star: 5,
      qualificationBonuses: [
        { qualification: "health", value: 5 },
        { qualification: "physicalAttack", value: 23 },
      ],
      primaryBonuses: [
        { attribute: "spirit", value: 13 },
        { attribute: "strength", value: 15 },
        { attribute: "constitution", value: 13 },
      ],
    });

    expect(bonuses.qualifications).toEqual({
      physicalAttack: 23,
      physicalDefense: 0,
      health: 5,
      spirit: 0,
      speed: 0,
    });
    expect(bonuses.primary).toEqual({
      constitution: 13,
      spirit: 13,
      strength: 15,
      endurance: 0,
      agility: 0,
    });
  });
});
