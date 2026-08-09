import { useSpiritBeastSkillLearningSimulator } from "../hooks/useSpiritBeastSkillLearningSimulator";
import { SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS } from "../utils/spiritBeastSkillLearning";
import ResetButton from "./ResetButton";
import SpiritBeastFusionSkillPicker from "./SpiritBeastFusionSkillPicker";
import SpiritBeastSkillBookPicker from "./SpiritBeastSkillBookPicker";
import SpiritBeastSkillLearningResultDialog from "./SpiritBeastSkillLearningResultDialog";
import SpiritBeastSkillSlots from "./SpiritBeastSkillSlots";

const numberFormatter = new Intl.NumberFormat("zh-CN");

/** 还原游戏高级技能学习、新增或随机替换及结果确认流程。 */
const SpiritBeastSkillLearningSimulator = () => {
  const {
    state,
    selectedSkillName,
    pendingAttempt,
    configurationError,
    notice,
    setSelectedSkillName,
    toggleCurrentSkill,
    toggleChainSkill,
    learnSelectedSkill,
    discardPendingAttempt,
    savePendingAttempt,
    reset,
  } = useSpiritBeastSkillLearningSimulator();
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                灵兽技能学习模拟器
              </h2>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                娱乐模拟
              </span>
            </div>
            <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500">
              第一版只提供截图中的高级技能书。无技能时学习会直接新增；不超过 3
              个可替换技能时有 5%
              概率新增，否则会随机替换。带“宝”标记的宝链技能不会被替换。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <span className="text-blue-500">学习次数</span>
              <strong className="ml-2">
                {numberFormatter.format(state.attemptCount)}
              </strong>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <span className="text-amber-600">参考消耗</span>
              <strong className="ml-2">
                {numberFormatter.format(state.totalReferenceSilver)} 银
              </strong>
            </div>
            <ResetButton
              confirmationTitle="重置技能学习模拟器？"
              confirmationMessage="当前技能、宝链标记、学习次数和参考消耗都会清空，此操作无法撤销。"
              onConfirm={reset}
            />
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.82fr)_minmax(420px,1.18fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:sticky xl:top-24">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-blue-600">灵兽配置</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                当前技能
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
              {state.skillNames.length} /{" "}
              {SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS}
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
            <SpiritBeastSkillSlots
              skillNames={state.skillNames}
              chainSkillNames={state.chainSkillNames}
              ariaLabel="当前灵兽技能"
              onToggleChainSkill={toggleChainSkill}
            />
          </div>

          <SpiritBeastFusionSkillPicker
            title="当前"
            selectedSkillNames={state.skillNames}
            onToggle={toggleCurrentSkill}
            maxSelected={SPIRIT_BEAST_SKILL_LEARNING_MAX_SKILLS}
          />

          <p className="mt-3 text-xs leading-5 text-slate-500">
            当前技能最多 9 个。直接点击上方已有技能图标，可标记最多 2
            个宝链技能；图标左上角显示“宝”，学习时始终保留。可替换技能为 1～3
            个时，每次学习有 5% 概率新增。
          </p>
        </section>

        <div className="min-w-0 space-y-4">
          <SpiritBeastSkillBookPicker
            currentSkillNames={state.skillNames}
            selectedSkillName={selectedSkillName}
            configurationError={configurationError}
            notice={notice}
            onSelect={setSelectedSkillName}
            onLearn={learnSelectedSkill}
          />
        </div>
      </div>

      {pendingAttempt ? (
        <SpiritBeastSkillLearningResultDialog
          attempt={pendingAttempt}
          onDiscard={discardPendingAttempt}
          onSave={savePendingAttempt}
        />
      ) : null}
    </div>
  );
};

export default SpiritBeastSkillLearningSimulator;
