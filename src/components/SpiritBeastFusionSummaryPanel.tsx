import {
  SPIRIT_BEAST_QUALIFICATIONS,
  type SpiritBeastQualification,
} from "../utils/spiritBeastAttributes";
import {
  FUSION_DOUBLE_SPECIAL_PITY,
  FUSION_INITIAL_ATTRIBUTE_MAX,
  FUSION_INITIAL_ATTRIBUTE_MIN,
  FUSION_SILVER_PER_ATTEMPT,
  type FusionAnalysis,
  type FusionCost,
  type FusionParents,
  type FusionPityProgress,
  type FusionPreview,
  type FusionResult,
  type FusionRun,
} from "../utils/spiritBeastFusion";
import { SPIRIT_BEAST_QUALIFICATION_LABELS } from "./spiritBeastLabels";
import { QualificationBurstMark } from "./SpiritBeastFusionMarks";
import SpiritBeastFusionSkillIcons from "./SpiritBeastFusionSkillIcons";

const QUALIFICATION_SHORT_LABELS: Record<SpiritBeastQualification, string> = {
  physicalAttack: "物攻",
  physicalDefense: "物防",
  health: "气血",
  spirit: "灵力",
  speed: "速度",
};

const formatGrowth = (value: number) => value.toFixed(3);

const formatInteger = (value: number) =>
  new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value);

const formatAttempts = (value: number) =>
  value < 10 ? value.toFixed(1) : formatInteger(Math.round(value));

const RESULT_ATTRIBUTE_GRID_CLASS =
  "grid grid-cols-[minmax(0,1fr)_3.5rem_1.25rem] items-center gap-2";

const FusionResultSkills = ({ result }: { result: FusionResult }) => (
  <div className="mt-3" aria-label="融合结果技能">
    <SpiritBeastFusionSkillIcons skills={result.skills} size="small" />
  </div>
);

const CostSummary = ({ cost, title }: { cost: FusionCost; title: string }) => (
  <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
    <p className="text-xs font-medium text-slate-500">{title}</p>
    <strong className="mt-1 block text-xl font-semibold tabular-nums text-slate-900">
      {formatInteger(cost.attempts)} 次
    </strong>
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
      <div>
        <span className="block text-slate-400">伐骨丹</span>
        <strong className="mt-0.5 block text-slate-700">
          {formatInteger(cost.pills)} 个
        </strong>
      </div>
      <div>
        <span className="block text-slate-400">银两</span>
        <strong className="mt-0.5 block text-slate-700">
          {formatInteger(cost.silver)}
        </strong>
      </div>
      <div>
        <span className="block text-slate-400">灵融果</span>
        <strong className="mt-0.5 block text-slate-700">
          {formatInteger(cost.fruits)} 个
        </strong>
      </div>
      <div>
        <span className="block text-slate-400">单次成本</span>
        <strong className="mt-0.5 block text-slate-700">
          {formatInteger(FUSION_SILVER_PER_ATTEMPT)} 银
        </strong>
      </div>
    </div>
  </section>
);

type SpiritBeastFusionSummaryPanelProps = {
  parents: FusionParents;
  preview: FusionPreview;
  pity: FusionPityProgress;
  selectedPity: number;
  selectedPityLimit: number;
  configurationError: string | null;
  fullSkillConfigurationError: string | null;
  notice: string;
  lastRun: FusionRun | null;
  analysis: FusionAnalysis | null;
  onSimulate: () => void;
  onFuseUntilFullSkills: () => void;
};

/** 展示融合预览、执行入口、最近结果与成本分析。 */
const SpiritBeastFusionSummaryPanel = ({
  parents,
  preview,
  pity,
  selectedPity,
  selectedPityLimit,
  configurationError,
  fullSkillConfigurationError,
  notice,
  lastRun,
  analysis,
  onSimulate,
  onFuseUntilFullSkills,
}: SpiritBeastFusionSummaryPanelProps) => (
  <aside className="min-w-0 space-y-4 2xl:sticky 2xl:top-24">
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">融合预览</h2>
          <p className="mt-1 text-xs text-slate-500">
            {parents.main.name || "主宠"} + {parents.secondary.name || "副宠"}
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          最多 {preview.maximumSkillCount} 技能
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => {
          const range = preview.qualificationRanges[qualification];
          return (
            <div
              key={qualification}
              className="rounded-lg bg-slate-50 px-3 py-2.5"
            >
              <span className="text-[11px] text-slate-500">
                {SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}
              </span>
              <strong className="mt-0.5 block text-sm tabular-nums text-slate-900">
                {range.minimum}～{range.maximum}
              </strong>
            </div>
          );
        })}
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="text-[11px] text-slate-500">成长</span>
          <strong className="mt-0.5 block text-sm tabular-nums text-slate-900">
            {formatGrowth(preview.growthRange.minimum)}～
            {formatGrowth(preview.growthRange.maximum)}
          </strong>
        </div>
        <div className="rounded-lg bg-blue-50 px-3 py-2.5">
          <span className="text-[11px] text-blue-600">初始属性</span>
          <strong className="mt-0.5 block text-sm text-blue-800">
            {FUSION_INITIAL_ATTRIBUTE_MIN}～{FUSION_INITIAL_ATTRIBUTE_MAX}
          </strong>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-slate-600">当前满技能保底</span>
          <strong className="tabular-nums text-slate-900">
            {selectedPity}/{selectedPityLimit}
          </strong>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-[width]"
            style={{
              width: String((selectedPity / selectedPityLimit) * 100) + "%",
            }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-slate-600">满技能双特殊</span>
          <strong className="tabular-nums text-violet-700">
            {pity.fullDoubleSpecial}/{FUSION_DOUBLE_SPECIAL_PITY}
          </strong>
        </div>
      </div>

      {configurationError ? (
        <p
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-5 text-rose-700"
          role="alert"
        >
          {configurationError}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-xl border border-blue-200 bg-white px-3 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={configurationError !== null}
          onClick={onSimulate}
        >
          融合
        </button>
        <button
          type="button"
          className="rounded-xl bg-blue-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={fullSkillConfigurationError !== null}
          onClick={onFuseUntilFullSkills}
        >
          融合至满技能
        </button>
      </div>

      {notice ? (
        <p
          className="mt-3 text-center text-xs font-medium text-slate-600"
          role="status"
          aria-live="polite"
        >
          {notice}
        </p>
      ) : null}
    </section>

    {lastRun ? (
      <section
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        aria-label="融合模拟结果"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">本次结果</h2>
            <p className="mt-1 text-xs text-slate-500">
              {lastRun.result.skillCount} 技能 ·{" "}
              {lastRun.result.specialSkillCount} 特殊
            </p>
          </div>
          <span
            className={
              "rounded-full px-2.5 py-1 text-xs font-semibold " +
              (lastRun.reachedTarget
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600")
            }
          >
            {lastRun.reachedTarget ? "已达标" : "未达标"}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => (
            <div key={qualification} className={RESULT_ATTRIBUTE_GRID_CLASS}>
              <span className="text-slate-500">
                {QUALIFICATION_SHORT_LABELS[qualification]}
              </span>
              <strong className="text-right tabular-nums text-slate-900">
                {lastRun.result.qualifications[qualification]}
              </strong>
              {lastRun.result.qualificationBreakthroughs[qualification] ? (
                <QualificationBurstMark compact />
              ) : (
                <span className="size-5" aria-hidden="true" />
              )}
            </div>
          ))}
          <div className={RESULT_ATTRIBUTE_GRID_CLASS}>
            <span className="text-slate-500">成长</span>
            <strong className="text-right tabular-nums text-slate-900">
              {formatGrowth(lastRun.result.growth)}
            </strong>
            <span className="size-5" aria-hidden="true" />
          </div>
          <div className={RESULT_ATTRIBUTE_GRID_CLASS}>
            <span className="text-slate-500">初始属性</span>
            <strong className="text-right tabular-nums text-blue-700">
              {lastRun.result.initialAttributeTotal}
            </strong>
            <span className="size-5" aria-hidden="true" />
          </div>
        </div>

        <FusionResultSkills result={lastRun.result} />
        <div className="mt-4">
          <CostSummary cost={lastRun.cost} title="本轮实际消耗" />
        </div>
      </section>
    ) : null}

    {analysis ? (
      <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">达标成本分析</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          基于 {analysis.sampleCount} 轮经验概率模拟，其中{" "}
          {analysis.completedSampleCount} 轮在样本上限内达标。
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white p-2.5">
            <span className="text-[10px] text-slate-500">平均</span>
            <strong className="mt-1 block text-sm text-slate-900">
              {formatAttempts(analysis.averageAttempts)}
            </strong>
          </div>
          <div className="rounded-lg bg-white p-2.5">
            <span className="text-[10px] text-slate-500">中位</span>
            <strong className="mt-1 block text-sm text-slate-900">
              {formatInteger(analysis.medianAttempts)}
            </strong>
          </div>
          <div className="rounded-lg bg-white p-2.5">
            <span className="text-[10px] text-slate-500">较倒霉 P90</span>
            <strong className="mt-1 block text-sm text-slate-900">
              {formatInteger(analysis.percentile90Attempts)}
            </strong>
          </div>
        </div>

        <div className="mt-3">
          <CostSummary cost={analysis.averageCost} title="平均准备成本" />
        </div>

        {analysis.skillPityMaximumAttempts !== null ? (
          <p className="mt-3 text-xs leading-5 text-blue-800">
            当前技能目标的理论保底上限为{" "}
            <strong>
              {formatInteger(analysis.skillPityMaximumAttempts)} 次
            </strong>
            。
            {analysis.hasNonGuaranteedAttributeTarget
              ? "资质和成长没有已知保底，因此整体目标不存在严格上限。"
              : ""}
          </p>
        ) : null}
      </section>
    ) : null}
  </aside>
);

export default SpiritBeastFusionSummaryPanel;
