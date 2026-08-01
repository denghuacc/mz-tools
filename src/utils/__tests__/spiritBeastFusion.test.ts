import {
  FUSION_PITY_WITHOUT_FRUIT,
  FUSION_PITY_WITH_FRUIT,
  SPIRIT_BEAST_FUSION_STORAGE_KEY,
  calculateFusionCost,
  calculateFusionPreview,
  createDefaultSpiritBeastFusionState,
  getFusionConfigurationError,
  getFusionMaximumSkillCount,
  normalizeSpiritBeastFusionState,
  simulateFusionAttempt,
  simulateFusionUntilTarget,
  type FusionSkill,
} from "../spiritBeastFusion";

const createSkills = (
  prefix: string,
  count: number,
  specialIndexes: readonly number[] = [],
  passiveSpecialIndexes: readonly number[] = [],
): readonly FusionSkill[] =>
  Array.from({ length: count }, (_, index) => {
    const isSpecial = specialIndexes.includes(index);

    return {
      id: `${prefix}-${index}`,
      name: `${prefix}技能${index + 1}`,
      isSpecial,
      specialType: isSpecial
        ? passiveSpecialIndexes.includes(index)
          ? "passive"
          : "active"
        : null,
    };
  });

const createValidState = () => {
  const state = createDefaultSpiritBeastFusionState();

  return {
    ...state,
    parents: {
      main: {
        ...state.parents.main,
        name: "惊了",
        qualifications: {
          physicalAttack: 956,
          physicalDefense: 1_314,
          health: 1_491,
          spirit: 1_570,
          speed: 1_456,
        },
        growth: 1.183,
        skills: createSkills("主", 5, [0]),
      },
      secondary: {
        ...state.parents.secondary,
        name: "小冰",
        qualifications: {
          physicalAttack: 1_555,
          physicalDefense: 1_278,
          health: 1_383,
          spirit: 1_580,
          speed: 1_257,
        },
        growth: 1.234,
        skills: createSkills("副", 5, [0], [0]),
      },
    },
  };
};

describe("灵兽融合规则", () => {
  it("按技能总和计算结果上限", () => {
    expect(getFusionMaximumSkillCount(8)).toBe(5);
    expect(getFusionMaximumSkillCount(9)).toBe(5);
    expect(getFusionMaximumSkillCount(10)).toBe(6);
    expect(getFusionMaximumSkillCount(11)).toBe(6);
    expect(getFusionMaximumSkillCount(12)).toBe(7);
  });

  it("按最低值和经验增幅生成资质成长预览", () => {
    const preview = calculateFusionPreview(createValidState().parents);

    expect(preview.qualificationRanges.physicalAttack).toEqual({
      minimum: 956,
      maximum: 1_609,
    });
    expect(preview.qualificationRanges.physicalDefense).toEqual({
      minimum: 1_278,
      maximum: 1_360,
    });
    expect(preview.growthRange).toEqual({
      minimum: 1.183,
      maximum: 1.276,
    });
    expect(preview.initialAttributeRange).toEqual({
      minimum: 100,
      maximum: 135,
    });
    expect(preview.minimumSkillCount).toBe(5);
    expect(preview.maximumSkillCount).toBe(6);
    expect(preview.specialSkillPoolCount).toBe(2);
  });

  it("有果和无果保底分别累计", () => {
    const state = createValidState();
    const withoutFruit = simulateFusionAttempt(
      {
        ...state,
        strategy: "without-fruit",
        probabilities: { fullSkills: 0, doubleSpecial: 0 },
        pity: {
          withoutFruit: FUSION_PITY_WITHOUT_FRUIT - 1,
          withFruit: 12,
          fullDoubleSpecial: 0,
        },
      },
      () => 0.99,
    );

    expect(withoutFruit.result.isFullSkills).toBe(true);
    expect(withoutFruit.pity.withoutFruit).toBe(0);
    expect(withoutFruit.pity.withFruit).toBe(12);

    const withFruit = simulateFusionAttempt(
      {
        ...state,
        strategy: "with-fruit",
        probabilities: { fullSkills: 0, doubleSpecial: 0 },
        pity: {
          withoutFruit: 23,
          withFruit: FUSION_PITY_WITH_FRUIT - 1,
          fullDoubleSpecial: 0,
        },
      },
      () => 0.99,
    );

    expect(withFruit.result.isFullSkills).toBe(true);
    expect(withFruit.pity.withFruit).toBe(0);
    expect(withFruit.pity.withoutFruit).toBe(23);
  });

  it("第 4 次满技能结果强制获得双特殊并重置进度", () => {
    const state = createValidState();
    const attempt = simulateFusionAttempt(
      {
        ...state,
        probabilities: { fullSkills: 0, doubleSpecial: 0 },
        pity: {
          withoutFruit: FUSION_PITY_WITHOUT_FRUIT - 1,
          withFruit: 0,
          fullDoubleSpecial: 3,
        },
      },
      () => 0.99,
    );

    expect(attempt.result.skillCount).toBe(6);
    expect(attempt.result.specialSkillCount).toBe(2);
    expect(attempt.result.isDoubleSpecial).toBe(true);
    expect(attempt.result.skills[0].specialType).toBe("active");
    expect(attempt.result.skills.at(-1)?.specialType).toBe("passive");
    expect(attempt.result.qualificationBreakthroughs.physicalAttack).toBe(true);
    expect(attempt.pity.fullDoubleSpecial).toBe(0);
  });

  it("模拟至目标时计算材料和银两成本", () => {
    const state = createValidState();
    const run = simulateFusionUntilTarget(
      {
        ...state,
        probabilities: { fullSkills: 0, doubleSpecial: 0 },
        pity: {
          withoutFruit: FUSION_PITY_WITHOUT_FRUIT - 1,
          withFruit: 0,
          fullDoubleSpecial: 0,
        },
      },
      () => 0.99,
    );

    expect(run.reachedTarget).toBe(true);
    expect(run.cost).toEqual({
      attempts: 1,
      pills: 3,
      silver: 15_000,
      fruits: 0,
    });
    expect(calculateFusionCost(80, "with-fruit")).toEqual({
      attempts: 80,
      pills: 240,
      silver: 1_200_000,
      fruits: 80,
    });
  });

  it("拒绝技能不足、同名技能池不足和缺少双特殊来源", () => {
    const state = createDefaultSpiritBeastFusionState();
    expect(getFusionConfigurationError(state)).toContain("至少需要录入 4 个");

    const duplicateState = createValidState();
    duplicateState.parents.secondary.skills = createSkills("主", 5, [0]);
    expect(getFusionConfigurationError(duplicateState)).toContain(
      "候选技能不足",
    );

    const noSpecialState = createValidState();
    noSpecialState.parents.main.skills = createSkills("主", 5);
    noSpecialState.parents.secondary.skills = createSkills("副", 5);
    noSpecialState.target.requireDoubleSpecial = true;
    expect(getFusionConfigurationError(noSpecialState)).toContain(
      "至少需要录入 2 个特殊技能",
    );
  });

  it("预览、校验和结果选择共用同一份去重技能池", () => {
    const state = createDefaultSpiritBeastFusionState();
    const sharedNormalSkills = createSkills("共享", 4);
    state.parents.main.skills = sharedNormalSkills;
    state.parents.secondary.skills = [
      ...sharedNormalSkills.slice(0, 3),
      {
        id: "secondary-special",
        name: "副宠特殊",
        isSpecial: true,
        specialType: "active",
      },
    ];
    state.probabilities = { fullSkills: 1, doubleSpecial: 0 };

    const preview = calculateFusionPreview(state.parents);
    const attempt = simulateFusionAttempt(state, () => 0.99);

    expect(preview.maximumSkillCount).toBe(5);
    expect(preview.specialSkillPoolCount).toBe(1);
    expect(getFusionConfigurationError(state)).toBeNull();
    expect(attempt.result.isFullSkills).toBe(true);
    expect(attempt.result.skillCount).toBe(5);
    expect(attempt.result.specialSkillCount).toBe(1);
  });

  it("同名异类型技能不会被重复计入双特殊来源", () => {
    const state = createValidState();
    state.parents.main.skills = createSkills("主", 5, [3]);
    state.parents.secondary.skills = createSkills("副", 5, [0]).map(
      (skill, index) =>
        index === 0
          ? { ...skill, name: state.parents.main.skills[0].name }
          : skill,
    );
    state.target.requireDoubleSpecial = true;

    expect(calculateFusionPreview(state.parents).specialSkillPoolCount).toBe(1);
    expect(getFusionConfigurationError(state)).toContain(
      "至少需要录入 2 个特殊技能",
    );
  });

  it("恢复缓存时补默认字段、收紧进度并保留融合后高资质记录", () => {
    const normalized = normalizeSpiritBeastFusionState({
      parents: {
        main: {
          name: "主宠",
          qualifications: {},
          skills: [{ id: "legacy", name: "旧特殊", isSpecial: true }],
        },
        secondary: { name: "副宠", qualifications: {}, skills: [] },
      },
      probabilities: {},
      pity: {
        withoutFruit: 999,
        withFruit: 999,
        fullDoubleSpecial: 99,
      },
      target: {},
      records: [
        {
          id: "record-1",
          createdAt: 1,
          mainName: "主宠",
          secondaryName: "副宠",
          result: {
            qualifications: {
              physicalAttack: 1_863,
              physicalDefense: 1_800,
              health: 1_800,
              spirit: 1_800,
              speed: 1_800,
            },
            growth: 1.5,
            initialAttributeTotal: 135,
            skills: [],
            isFullSkills: true,
          },
        },
      ],
    });

    expect(SPIRIT_BEAST_FUSION_STORAGE_KEY).toBe(
      "mz-tools.spirit-beast-fusion.v1",
    );
    expect(normalized?.parents.main.qualifications.physicalAttack).toBe(1_500);
    expect(normalized?.parents.main.growth).toBe(1.2);
    expect(normalized?.parents.main.skills[0].specialType).toBe("active");
    expect(normalized?.probabilities).toEqual({
      fullSkills: 0.01,
      doubleSpecial: 0.1,
    });
    expect(normalized?.pity).toEqual({
      withoutFruit: 239,
      withFruit: 79,
      fullDoubleSpecial: 3,
    });
    expect(normalized?.records[0].result.qualifications.physicalAttack).toBe(
      1_863,
    );
    expect(
      normalized?.records[0].result.qualificationBreakthroughs.physicalAttack,
    ).toBe(false);
  });
});
