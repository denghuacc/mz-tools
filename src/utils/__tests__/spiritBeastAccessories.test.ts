import {
  calculateSpiritBeastAccessoryBonuses,
  createEmptySpiritBeastAccessories,
  normalizeSpiritBeastAccessories,
} from "../spiritBeastAccessories";

describe("灵兽灵饰", () => {
  it("应该汇总两件灵饰的固定全资质和随机属性", () => {
    const accessories = createEmptySpiritBeastAccessories();
    accessories.tierOne = {
      enabled: true,
      attribute: "health",
      value: 17,
    };
    accessories.tierTwo = {
      enabled: true,
      attribute: "health",
      value: 31,
    };

    const bonuses = calculateSpiritBeastAccessoryBonuses(accessories);

    expect(bonuses.qualification).toBe(30);
    expect(bonuses.panelAttributes.health).toBe(48);
    expect(bonuses.panelAttributes.physicalAttack).toBe(0);
  });

  it("应该校验损坏配置并忽略未启用灵饰", () => {
    const normalized = normalizeSpiritBeastAccessories({
      tierOne: {
        enabled: true,
        attribute: "mana",
        value: -10,
      },
      tierTwo: {
        enabled: "true",
        attribute: "speed",
        value: "31",
      },
    });

    expect(normalized.tierOne).toEqual({
      enabled: true,
      attribute: "physicalAttack",
      value: 0,
    });
    expect(normalized.tierTwo).toEqual({
      enabled: false,
      attribute: "speed",
      value: 31,
    });
    expect(calculateSpiritBeastAccessoryBonuses(normalized).qualification).toBe(
      10,
    );
  });
});
