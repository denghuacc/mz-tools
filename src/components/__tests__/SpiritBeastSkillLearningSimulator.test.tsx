import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vite-plus/test";
import { SPIRIT_BEAST_SKILL_LEARNING_STORAGE_KEY } from "../../utils/calculatorStorage";
import SpiritBeastSkillLearningSimulator from "../SpiritBeastSkillLearningSimulator";

const selectCurrentSkill = async (
  user: ReturnType<typeof userEvent.setup>,
  skillName: string,
) => {
  const picker = screen.getByRole("group", { name: "当前技能选择" });
  const search = within(picker).getByRole("searchbox", {
    name: "当前搜索技能",
  });
  await user.clear(search);
  await user.type(search, skillName);
  await user.click(within(picker).getByRole("checkbox", { name: skillName }));
};

describe("SpiritBeastSkillLearningSimulator", () => {
  it("展示高级技能学习流程和截图参考价格", () => {
    render(<SpiritBeastSkillLearningSimulator />);

    expect(
      screen.getByRole("heading", { name: "灵兽技能学习模拟器" }),
    ).toBeInTheDocument();
    expect(screen.getByText("娱乐模拟")).toBeInTheDocument();
    expect(screen.getByText("0 / 9")).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "当前灵兽技能" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(9);
    expect(screen.getByText("请选择要学习的高级技能。")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /学习高级/ })).toBeNull();
    expect(
      screen.getByRole("radiogroup", { name: "选择学习技能" }),
    ).toBeInTheDocument();
  });

  it("没有当前技能时可以学习并保存一个新技能", async () => {
    const user = userEvent.setup();
    render(<SpiritBeastSkillLearningSimulator />);

    const learningSearch = screen.getByRole("searchbox", {
      name: "搜索要学习的技能",
    });
    await user.type(learningSearch, "火元素");
    await user.click(
      screen.getByRole("radio", { name: /高级火元素，参考价 5,002 银/ }),
    );
    const learnButton = screen.getByRole("button", {
      name: "学习高级火元素",
    });
    expect(learnButton).toBeEnabled();
    expect(learnButton).toHaveTextContent(/^学习$/);
    expect(screen.queryByText("已选")).toBeNull();

    await user.click(screen.getByRole("button", { name: "学习高级火元素" }));
    const dialog = screen.getByRole("dialog", { name: "学习成功" });
    expect(dialog).toHaveTextContent("本次成功新增了“高级火元素”");
    expect(
      within(dialog).getByRole("heading", {
        name: "学习结果（请选择是否保存学习结果）",
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getAllByRole("listitem", { name: /.+/ }),
    ).toHaveLength(36);
    expect(within(dialog).getByText("!")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "关闭学习结果窗口" }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "保存" }));
    expect(
      within(screen.getByRole("list", { name: "当前灵兽技能" })).getByRole(
        "listitem",
        { name: "高级火元素" },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("1 / 9")).toBeInTheDocument();
  });

  it("随机替换第一个技能，关闭放弃后可重新学习并保存", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const user = userEvent.setup();
    const { unmount } = render(<SpiritBeastSkillLearningSimulator />);

    const currentPicker = screen.getByRole("group", {
      name: "当前技能选择",
    });
    await user.click(within(currentPicker).getByText("搜索并选择技能"));
    await selectCurrentSkill(user, "高级物暴");
    await selectCurrentSkill(user, "高级物连");
    await selectCurrentSkill(user, "高级噬血");
    await selectCurrentSkill(user, "高级蛮劲");
    await user.click(
      screen.getByRole("button", { name: "高级噬血，标记为宝链技能" }),
    );
    await user.click(
      screen.getByRole("button", { name: "高级蛮劲，标记为宝链技能" }),
    );
    await user.click(
      screen.getByRole("button", { name: "高级物连，标记为宝链技能" }),
    );
    expect(
      screen.getByRole("button", { name: "高级物连，标记为宝链技能" }),
    ).toHaveAttribute("aria-pressed", "false");

    const learningSearch = screen.getByRole("searchbox", {
      name: "搜索要学习的技能",
    });
    await user.type(learningSearch, "火元素");
    await user.click(
      screen.getByRole("radio", { name: /高级火元素，参考价 5,002 银/ }),
    );

    await user.click(screen.getByRole("button", { name: "学习高级火元素" }));
    let dialog = screen.getByRole("dialog", { name: "学习成功" });
    expect(dialog).toHaveTextContent("本次随机替换了“高级物暴”");
    expect(
      within(dialog).getByRole("listitem", { name: "高级火元素" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getAllByRole("listitem", {
        name: "高级噬血（宝链技能，不参与替换）",
      }),
    ).toHaveLength(2);

    await user.click(within(dialog).getByRole("button", { name: "关闭" }));
    expect(screen.queryByRole("dialog", { name: "学习成功" })).toBeNull();
    let currentSkills = screen.getByRole("list", {
      name: "当前灵兽技能",
    });
    expect(
      within(currentSkills).getByRole("listitem", { name: "高级物暴" }),
    ).toBeInTheDocument();
    expect(
      within(currentSkills).queryByRole("listitem", { name: "高级火元素" }),
    ).toBeNull();
    expect(
      screen.getByText("已放弃本次学习结果，可以继续学习。"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "学习高级火元素" }));
    dialog = screen.getByRole("dialog", { name: "学习成功" });
    await user.click(within(dialog).getByRole("button", { name: "保存" }));

    currentSkills = screen.getByRole("list", { name: "当前灵兽技能" });
    expect(
      within(currentSkills).getByRole("listitem", { name: "高级火元素" }),
    ).toBeInTheDocument();
    expect(
      within(currentSkills).getByRole("listitem", { name: "高级物连" }),
    ).toBeInTheDocument();
    expect(
      within(currentSkills).getByRole("listitem", {
        name: "高级蛮劲（宝链技能，不参与替换）",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("已保存高级火元素，可以继续学习。"),
    ).toBeInTheDocument();
    expect(screen.getByText("10,004 银")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(
            SPIRIT_BEAST_SKILL_LEARNING_STORAGE_KEY,
          ) ?? "{}",
        ),
      ).toEqual({
        skillNames: ["高级火元素", "高级物连", "高级噬血", "高级蛮劲"],
        chainSkillNames: ["高级噬血", "高级蛮劲"],
        attemptCount: 2,
        totalReferenceSilver: 10004,
      });
    });

    unmount();
    render(<SpiritBeastSkillLearningSimulator />);
    currentSkills = screen.getByRole("list", { name: "当前灵兽技能" });
    expect(
      within(currentSkills).getByRole("listitem", { name: "高级火元素" }),
    ).toBeInTheDocument();
    expect(screen.getByText("10,004 银")).toBeInTheDocument();
    random.mockRestore();
  });

  it("恢复缓存时忽略未知技能并收紧非法统计", async () => {
    window.localStorage.setItem(
      SPIRIT_BEAST_SKILL_LEARNING_STORAGE_KEY,
      JSON.stringify({
        skillNames: ["高级迅捷", "未知技能", "高级迅捷"],
        attemptCount: 2.9,
        totalReferenceSilver: -10,
      }),
    );

    render(<SpiritBeastSkillLearningSimulator />);

    const currentSkills = screen.getByRole("list", {
      name: "当前灵兽技能",
    });
    expect(
      within(currentSkills).getAllByRole("listitem", { name: "高级迅捷" }),
    ).toHaveLength(1);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("0 银")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        JSON.parse(
          window.localStorage.getItem(
            SPIRIT_BEAST_SKILL_LEARNING_STORAGE_KEY,
          ) ?? "{}",
        ),
      ).toEqual({
        skillNames: ["高级迅捷"],
        chainSkillNames: [],
        attemptCount: 2,
        totalReferenceSilver: 0,
      });
    });
  });
});
