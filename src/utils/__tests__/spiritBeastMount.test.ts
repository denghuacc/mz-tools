import {
  calculateSpiritBeastMountFixedBonuses,
  calculateSpiritBeastMountSpeedBonus,
  createEmptySpiritBeastMountConfig,
  normalizeSpiritBeastMountConfig,
} from "../spiritBeastMount";

describe("灵兽坐骑统御", () => {
  it("应该汇总最多两项不重复的固定属性", () => {
    const mount = normalizeSpiritBeastMountConfig({
      fixedAttributes: [
        { attribute: "health", value: 63 },
        { attribute: "speed", value: "18" },
        { attribute: "health", value: 99 },
        { attribute: "mana", value: 120 },
      ],
    });

    expect(mount.fixedAttributes).toEqual([
      { attribute: "health", value: 63 },
      { attribute: "speed", value: 18 },
    ]);
    expect(calculateSpiritBeastMountFixedBonuses(mount)).toEqual({
      health: 63,
      mana: 0,
      physicalAttack: 0,
      magicalAttack: 0,
      physicalDefense: 0,
      magicalDefense: 0,
      speed: 18,
    });
  });

  it("应该允许疾风与迟钝术同时生效并按同一速度基数相减", () => {
    const mount = createEmptySpiritBeastMountConfig();
    mount.gale = { enabled: true, percentage: 10 };
    mount.slownessSpell = { enabled: true, percentage: 20 };

    expect(calculateSpiritBeastMountSpeedBonus(mount, 500)).toBe(-50);
  });

  it("应该收紧技能百分比并安全忽略非法固定属性", () => {
    expect(
      normalizeSpiritBeastMountConfig({
        fixedAttributes: [
          { attribute: "strength", value: 99 },
          { attribute: "physicalAttack", value: -10 },
        ],
        gale: { enabled: true, percentage: 99 },
        slownessSpell: { enabled: true, percentage: 19 },
      }),
    ).toEqual({
      fixedAttributes: [{ attribute: "physicalAttack", value: 0 }],
      gale: { enabled: true, percentage: 10 },
      slownessSpell: { enabled: true, percentage: 18 },
    });
  });
});
