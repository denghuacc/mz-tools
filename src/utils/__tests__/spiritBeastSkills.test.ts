import {
  calculateSpiritBeastSkillEffects,
  createEmptySpiritBeastSkills,
  normalizeSpiritBeastSkills,
} from "../spiritBeastSkills";

const CALCULATION_BASE = {
  spirit: 100,
  health: 1000,
  speed: 200,
};

describe("灵兽面板技能", () => {
  it("应该应用低级威能、速度、气血和亲和技能", () => {
    const skills = createEmptySpiritBeastSkills();
    skills.magicalPower.normal = true;
    skills.swiftness.normal = true;
    skills.robustness.normal = true;
    skills.luckyStar.normal = true;
    skills.affinities.fireAffinity.normal = true;

    const effects = calculateSpiritBeastSkillEffects(skills, CALCULATION_BASE);

    expect(effects.magicalAttack).toBe(6);
    expect(effects.speed).toBe(20);
    expect(effects.health).toBe(200);
    expect(effects.affinities.fireAffinity).toBe(15);

    skills.swiftness.normal = false;
    skills.slowness.normal = true;
    expect(
      calculateSpiritBeastSkillEffects(skills, CALCULATION_BASE).speed,
    ).toBe(-20);
  });

  it("应该应用高级威能、速度、气血和亲和技能", () => {
    const skills = createEmptySpiritBeastSkills();
    skills.magicalPower.advanced = true;
    skills.swiftness.advanced = true;
    skills.robustness.advanced = true;
    skills.luckyStar.advanced = true;
    skills.affinities.fireAffinity.advanced = true;

    const effects = calculateSpiritBeastSkillEffects(skills, CALCULATION_BASE);

    expect(effects.magicalAttack).toBe(10);
    expect(effects.speed).toBe(40);
    expect(effects.health).toBe(350);
    expect(effects.affinities.fireAffinity).toBe(25);

    skills.swiftness.advanced = false;
    skills.slowness.advanced = true;
    expect(
      calculateSpiritBeastSkillEffects(skills, CALCULATION_BASE).speed,
    ).toBe(-40);
  });

  it("同名低级与高级技能同时存在时应该只应用高级效果", () => {
    const skills = createEmptySpiritBeastSkills();
    skills.magicalPower = { normal: true, advanced: true };
    skills.swiftness = { normal: true, advanced: true };
    skills.robustness = { normal: true, advanced: true };
    skills.luckyStar = { normal: true, advanced: true };
    skills.affinities.fireAffinity = { normal: true, advanced: true };

    expect(calculateSpiritBeastSkillEffects(skills, CALCULATION_BASE)).toEqual({
      magicalAttack: 10,
      health: 350,
      speed: 40,
      affinities: {
        fireAffinity: 25,
        waterAffinity: 0,
        electricAffinity: 0,
        poisonAffinity: 0,
        iceAffinity: 0,
        windAffinity: 0,
      },
    });
  });

  it("应该校验技能缓存并兼容单档位字符串", () => {
    expect(
      normalizeSpiritBeastSkills({
        magicalPower: { normal: true, advanced: true },
        swiftness: "advanced",
        robustness: { normal: "yes", advanced: false },
        affinities: {
          fireAffinity: "normal",
          waterAffinity: { normal: true, advanced: false },
        },
      }),
    ).toMatchObject({
      magicalPower: { normal: true, advanced: true },
      swiftness: { normal: false, advanced: true },
      robustness: { normal: false, advanced: false },
      affinities: {
        fireAffinity: { normal: true, advanced: false },
        waterAffinity: { normal: true, advanced: false },
      },
    });
  });
});
