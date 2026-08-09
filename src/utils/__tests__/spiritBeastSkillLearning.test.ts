import {
  createDefaultSpiritBeastSkillLearningState,
  getSpiritBeastSkillLearningError,
  normalizeSpiritBeastSkillLearningState,
  simulateSpiritBeastSkillLearning,
  toggleSpiritBeastSkillLearningSkill,
} from "../spiritBeastSkillLearning";

describe("灵兽技能学习规则", () => {
  it("默认不保存技能或学习消耗", () => {
    expect(createDefaultSpiritBeastSkillLearningState()).toEqual({
      skillNames: [],
      chainSkillNames: [],
      attemptCount: 0,
      totalReferenceSilver: 0,
    });
  });

  it("恢复时清理未知、重复和越界数据", () => {
    expect(
      normalizeSpiritBeastSkillLearningState({
        skillNames: [
          "高级物暴",
          "未知技能",
          "高级物暴",
          "高级物连",
          "高级乘胜",
          "高级噬血",
          "高级蛮劲",
          "高级助攻",
          "高级法暴",
          "高级法连",
          "高级修罗",
          "高级玄法",
          "高级威能",
        ],
        chainSkillNames: [
          "高级物暴",
          "未知技能",
          "高级物暴",
          "高级法连",
          "高级修罗",
        ],
        attemptCount: 3.8,
        totalReferenceSilver: -1,
      }),
    ).toEqual({
      skillNames: [
        "高级物暴",
        "高级物连",
        "高级乘胜",
        "高级噬血",
        "高级蛮劲",
        "高级助攻",
        "高级法暴",
        "高级法连",
        "高级修罗",
      ],
      chainSkillNames: ["高级物暴", "高级法连"],
      attemptCount: 3,
      totalReferenceSilver: 0,
    });
    expect(normalizeSpiritBeastSkillLearningState("bad")).toBeNull();
  });

  it("支持多选和取消当前技能，并限制最多九个", () => {
    expect(toggleSpiritBeastSkillLearningSkill([], "高级物暴")).toEqual([
      "高级物暴",
    ]);
    expect(
      toggleSpiritBeastSkillLearningSkill(["高级物暴"], "高级物暴"),
    ).toEqual([]);
    const nineSkills = [
      "高级物暴",
      "高级物连",
      "高级乘胜",
      "高级噬血",
      "高级蛮劲",
      "高级助攻",
      "高级法暴",
      "高级法连",
      "高级修罗",
    ];
    expect(toggleSpiritBeastSkillLearningSkill(nineSkills, "高级玄法")).toEqual(
      nineSkills,
    );
    expect(
      toggleSpiritBeastSkillLearningSkill(
        ["高级法连", "高级修罗"],
        "高级玄法",
        2,
      ),
    ).toEqual(["高级法连", "高级修罗"]);
  });

  it("没有当前技能时直接新增技能", () => {
    expect(
      simulateSpiritBeastSkillLearning([], "高级火元素", 0.9),
    ).toMatchObject({
      beforeSkillNames: [],
      afterSkillNames: ["高级火元素"],
      resultType: "added",
      learnedSkillIndex: 0,
      replacedSkillName: null,
      referencePrice: 5002,
    });
  });

  it("不超过三个技能时有 5% 概率新增，否则等概率替换", () => {
    const addedResult = simulateSpiritBeastSkillLearning(
      ["高级物暴", "高级物连", "高级乘胜"],
      "高级火元素",
      0.049,
    );
    const firstResult = simulateSpiritBeastSkillLearning(
      ["高级物暴", "高级物连", "高级乘胜"],
      "高级火元素",
      0.05,
    );
    const lastResult = simulateSpiritBeastSkillLearning(
      ["高级物暴", "高级物连", "高级乘胜"],
      "高级火元素",
      0.999,
    );

    expect(addedResult).toMatchObject({
      afterSkillNames: ["高级物暴", "高级物连", "高级乘胜", "高级火元素"],
      resultType: "added",
      learnedSkillIndex: 3,
      replacedSkillName: null,
    });
    expect(firstResult).toMatchObject({
      afterSkillNames: ["高级火元素", "高级物连", "高级乘胜"],
      resultType: "replaced",
      learnedSkillIndex: 0,
      replacedSkillName: "高级物暴",
      referencePrice: 5002,
    });
    expect(lastResult).toMatchObject({
      afterSkillNames: ["高级物暴", "高级物连", "高级火元素"],
      resultType: "replaced",
      learnedSkillIndex: 2,
      replacedSkillName: "高级乘胜",
    });
  });

  it("四个及以上技能时不会触发新增", () => {
    expect(
      simulateSpiritBeastSkillLearning(
        ["高级物暴", "高级物连", "高级乘胜", "高级噬血"],
        "高级火元素",
        0,
      ),
    ).toMatchObject({
      afterSkillNames: ["高级火元素", "高级物连", "高级乘胜", "高级噬血"],
      resultType: "replaced",
      learnedSkillIndex: 0,
      replacedSkillName: "高级物暴",
    });
  });

  it("随机替换只作用于自身技能并完整保留宝链技能", () => {
    expect(
      simulateSpiritBeastSkillLearning(
        [
          "高级物暴",
          "高级物连",
          "高级乘胜",
          "高级噬血",
          "高级法连",
          "高级修罗",
        ],
        "高级火元素",
        0.999,
        ["高级法连", "高级修罗"],
      ),
    ).toMatchObject({
      beforeSkillNames: [
        "高级物暴",
        "高级物连",
        "高级乘胜",
        "高级噬血",
        "高级法连",
        "高级修罗",
      ],
      afterSkillNames: [
        "高级物暴",
        "高级物连",
        "高级乘胜",
        "高级火元素",
        "高级法连",
        "高级修罗",
      ],
      chainSkillNames: ["高级法连", "高级修罗"],
      replacedSkillName: "高级噬血",
    });
  });

  it("未选技能或重复技能时不生成结果", () => {
    expect(getSpiritBeastSkillLearningError([], "高级火元素")).toBeNull();
    expect(getSpiritBeastSkillLearningError([], null)).toBe(
      "请选择要学习的高级技能。",
    );
    expect(getSpiritBeastSkillLearningError(["高级物暴"], null)).toBe(
      "请选择要学习的高级技能。",
    );
    expect(getSpiritBeastSkillLearningError(["高级物暴"], "高级物暴")).toBe(
      "灵兽已经拥有这个技能。",
    );
    expect(
      getSpiritBeastSkillLearningError(["高级物暴", "高级法连"], "高级法连", [
        "高级法连",
      ]),
    ).toBe("灵兽已经拥有这个技能。");
    expect(simulateSpiritBeastSkillLearning([], "未知技能", 0)).toBeNull();
  });

  it("九个技能必须标记两个宝链技能后才能学习", () => {
    const nineSkills = [
      "高级物暴",
      "高级物连",
      "高级乘胜",
      "高级噬血",
      "高级蛮劲",
      "高级助攻",
      "高级法暴",
      "高级法连",
      "高级修罗",
    ];

    expect(
      getSpiritBeastSkillLearningError(nineSkills, "高级玄法", ["高级法连"]),
    ).toBe("请先将 1 个当前技能标记为宝链技能。");
    expect(
      getSpiritBeastSkillLearningError(nineSkills, "高级玄法", [
        "高级法连",
        "高级修罗",
      ]),
    ).toBeNull();
  });
});
