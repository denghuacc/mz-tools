import { useId, useRef } from "react";
import fusionFullMark from "../assets/spirit-beast-fusion-full-mark.png";
import fusionTransitionArrow from "../assets/spirit-beast-fusion-transition-arrow.png";
import fusionTrendDown from "../assets/spirit-beast-fusion-trend-down.png";
import fusionTrendUp from "../assets/spirit-beast-fusion-trend-up.png";
import { useModalDialog } from "../hooks/useModalDialog";
import { SPIRIT_BEAST_QUALIFICATIONS } from "../utils/spiritBeastAttributes";
import {
  FUSION_PILLS_PER_ATTEMPT,
  FUSION_SILVER_PER_ATTEMPT,
  type FusionPreview,
  type FusionResult,
  type FusionRun,
} from "../utils/spiritBeastFusion";
import {
  formatFusionGrowth,
  formatFusionInteger,
} from "../utils/spiritBeastFusionFormatters";
import { SPIRIT_BEAST_QUALIFICATION_LABELS } from "./spiritBeastLabels";
import { SPIRIT_BEAST_GAME_FONT_STYLE } from "./spiritBeastGameStyles";
import SpiritBeastGameDialogHeader from "./SpiritBeastGameDialogHeader";
import { QualificationBurstMark } from "./SpiritBeastFusionMarks";
import SpiritBeastFusionSkillIcons from "./SpiritBeastFusionSkillIcons";

type Trend = "up" | "down" | "same";

const getTrend = (current: number, next: number): Trend => {
  if (next > current) return "up";
  if (next < current) return "down";
  return "same";
};

const TrendIndicator = ({ trend }: { trend: Trend }) => {
  if (trend === "same") {
    return (
      <span
        className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
        aria-label="属性持平"
      >
        持平
      </span>
    );
  }

  return (
    <span
      className="inline-flex size-6 shrink-0 items-center justify-center"
      aria-label={trend === "up" ? "属性提升" : "属性下降"}
    >
      <img
        className="size-5 object-contain"
        src={trend === "up" ? fusionTrendUp : fusionTrendDown}
        alt=""
      />
    </span>
  );
};

const FullAttributeMark = () => (
  <span
    className="inline-flex size-7 shrink-0 items-center justify-center"
    title="达到当前融合上限"
    aria-label="达到当前融合上限"
  >
    <img className="size-7 object-contain" src={fusionFullMark} alt="" />
  </span>
);

const AttributeRow = ({
  label,
  value,
  maximum,
  compareValue,
  isBurst = false,
  isFull = false,
  formatValue = String,
}: {
  label: string;
  value: number;
  maximum: number;
  compareValue?: number;
  isBurst?: boolean;
  isFull?: boolean;
  formatValue?: (value: number) => string;
}) => {
  const progress = Math.max(12, Math.min(100, (value / maximum) * 100));

  return (
    <div className="grid grid-cols-[4.25rem_minmax(5rem,1fr)_auto] items-center gap-2">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="relative h-7 overflow-hidden rounded-md bg-slate-200/80">
        <span
          className="absolute inset-y-0 left-0 bg-emerald-400/85"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
        <strong className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-white [text-shadow:0_1px_2px_rgba(15,23,42,0.45)]">
          {formatValue(value)}
        </strong>
      </div>
      <span className="flex min-w-6 items-center gap-1">
        {compareValue === undefined ? null : (
          <TrendIndicator trend={getTrend(compareValue, value)} />
        )}
        {isBurst ? <QualificationBurstMark compact /> : null}
        {isFull ? <FullAttributeMark /> : null}
      </span>
    </div>
  );
};

const SkillList = ({ result }: { result: FusionResult }) => (
  <div className="mt-4">
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold tracking-[0.18em] text-slate-500">
        技能
      </span>
      <span className="text-xs tabular-nums text-slate-400">
        {result.skillCount} 技能 · {result.specialSkillCount} 特殊
      </span>
    </div>
    <div className="mt-2 min-h-44 rounded-lg bg-white/65 p-3">
      <SpiritBeastFusionSkillIcons skills={result.skills} />
    </div>
  </div>
);

const ResultPanel = ({
  title,
  result,
  compareResult,
  preview,
  isNew = false,
}: {
  title: string;
  result: FusionResult;
  compareResult?: FusionResult;
  preview: FusionPreview;
  isNew?: boolean;
}) => (
  <section
    className={`h-full min-w-0 rounded-2xl border p-4 sm:p-6 ${
      isNew
        ? "border-amber-200 bg-amber-50/65 shadow-[0_16px_45px_rgba(180,83,9,0.12)]"
        : "border-slate-200 bg-slate-100/85"
    }`}
    aria-label={title}
  >
    <div className="mb-5 flex items-center justify-center">
      <h3
        className={`text-xl font-bold tracking-[0.1em] ${
          isNew ? "text-amber-900" : "text-slate-700"
        }`}
        style={SPIRIT_BEAST_GAME_FONT_STYLE}
      >
        {title}
      </h3>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => (
        <AttributeRow
          key={qualification}
          label={SPIRIT_BEAST_QUALIFICATION_LABELS[qualification].replace(
            "资质",
            "",
          )}
          value={result.qualifications[qualification]}
          maximum={preview.qualificationRanges[qualification].maximum}
          compareValue={compareResult?.qualifications[qualification]}
          isBurst={result.qualificationBreakthroughs[qualification]}
          isFull={
            isNew &&
            result.qualifications[qualification] >=
              preview.qualificationRanges[qualification].maximum
          }
        />
      ))}

      <AttributeRow
        label="成长"
        value={result.growth}
        maximum={preview.growthRange.maximum}
        compareValue={compareResult?.growth}
        isFull={
          isNew &&
          Math.abs(result.growth - preview.growthRange.maximum) < 0.0005
        }
        formatValue={formatFusionGrowth}
      />
    </div>

    <div className="mt-3 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-600">初始属性</span>
        <span className="flex items-center gap-2">
          <strong className="text-lg tabular-nums text-slate-900">
            {result.initialAttributeTotal}
          </strong>
          {compareResult ? (
            <TrendIndicator
              trend={getTrend(
                compareResult.initialAttributeTotal,
                result.initialAttributeTotal,
              )}
            />
          ) : null}
        </span>
      </div>
    </div>

    <SkillList result={result} />
  </section>
);

const EmptyResultPanel = () => (
  <section
    className="flex h-full min-h-80 min-w-0 flex-col rounded-2xl border border-slate-300 bg-[#d6dfeb] p-4 sm:p-6"
    aria-label="新属性"
  >
    <div className="mb-5 flex items-center justify-center">
      <h3
        className="text-3xl font-bold tracking-[0.1em] text-amber-900 sm:text-4xl"
        style={SPIRIT_BEAST_GAME_FONT_STYLE}
      >
        新属性
      </h3>
    </div>
    <p
      className="flex flex-1 items-center justify-center px-6 pb-12 text-center text-2xl font-medium leading-relaxed text-slate-600 sm:text-3xl"
      style={SPIRIT_BEAST_GAME_FONT_STYLE}
    >
      点击下方重置按钮获得新的
      <br />
      资质和技能吧
    </p>
  </section>
);

type SpiritBeastFusionComparisonProps = {
  currentResult: FusionResult;
  run: FusionRun | null;
  preview: FusionPreview;
  mainName: string;
  secondaryName: string;
  useFusionFruit: boolean;
  onClose: () => void;
  onSave: () => void;
  onUseFusionFruitChange: (useFusionFruit: boolean) => void;
  onReset: () => void;
};

const SpiritBeastFusionComparison = ({
  currentResult,
  run,
  preview,
  mainName,
  secondaryName,
  useFusionFruit,
  onClose,
  onSave,
  onUseFusionFruitChange,
  onReset,
}: SpiritBeastFusionComparisonProps) => {
  const titleId = useId();
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useModalDialog(onClose, {
    initialFocusRef: primaryButtonRef,
  });

  return (
    <div className="fixed inset-0 z-[75] overflow-y-auto bg-slate-950/85 p-2 backdrop-blur-sm sm:p-5">
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="fusion-reveal-enter relative mx-auto flex min-h-full w-full max-w-[1800px] flex-col overflow-hidden rounded-[26px] border border-blue-200/70 bg-[#edf3fb] shadow-[0_30px_100px_rgba(2,6,23,0.6)] sm:min-h-0 sm:max-h-[calc(100vh-2.5rem)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <SpiritBeastGameDialogHeader
          title="融合结果"
          titleId={titleId}
          closeAriaLabel="关闭融合结果"
          onClose={onClose}
        />

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="mx-auto mb-5 flex w-fit items-center gap-3 rounded-lg border border-blue-100 bg-white/80 px-4 py-2 shadow-sm">
            <span className="rounded bg-amber-500 px-1.5 py-1 text-[10px] font-bold text-white">
              主宠
            </span>
            <strong className="max-w-32 truncate text-sm text-slate-800">
              {mainName || "主宠"}
            </strong>
            <span
              className="text-2xl font-light text-slate-500"
              aria-hidden="true"
            >
              +
            </span>
            <span className="rounded bg-sky-500 px-1.5 py-1 text-[10px] font-bold text-white">
              副宠
            </span>
            <strong className="max-w-32 truncate text-sm text-slate-800">
              {secondaryName || "副宠"}
            </strong>
          </div>

          <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)]">
            <ResultPanel
              title="生效中"
              result={currentResult}
              preview={preview}
            />

            <div
              className="hidden items-center justify-center lg:flex"
              aria-hidden="true"
            >
              {run ? (
                <img
                  className="h-10 w-12 object-contain"
                  src={fusionTransitionArrow}
                  alt=""
                />
              ) : null}
            </div>

            {run ? (
              <ResultPanel
                title="新属性"
                result={run.result}
                compareResult={currentResult}
                preview={preview}
                isNew
              />
            ) : (
              <EmptyResultPanel />
            )}
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-blue-200 bg-white/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4">
          <div className="flex flex-col items-start gap-1.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <label className="flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1 text-slate-700 transition hover:bg-blue-50">
                <span className="text-base font-semibold">灵融果</span>
                <strong className="text-xl tabular-nums">
                  {useFusionFruit ? "1/1" : "0/1"}
                </strong>
                <input
                  type="checkbox"
                  className="size-7 rounded accent-emerald-600"
                  aria-label="重置时使用灵融果"
                  checked={useFusionFruit}
                  onChange={(event) =>
                    onUseFusionFruitChange(event.target.checked)
                  }
                />
              </label>
              <button
                type="button"
                className="flex min-h-14 min-w-64 items-center justify-center gap-8 rounded-full bg-amber-200 px-10 py-3 text-lg font-bold text-amber-950 shadow-[0_8px_24px_rgba(217,119,6,0.18)] transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                aria-label={`${formatFusionInteger(FUSION_SILVER_PER_ATTEMPT)} 银 · 重置`}
                onClick={onReset}
              >
                <span className="tabular-nums">
                  {formatFusionInteger(FUSION_SILVER_PER_ATTEMPT)} 银
                </span>
                <span>重置</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              重置只刷新右侧新属性，消耗 {FUSION_PILLS_PER_ATTEMPT} 个伐骨丹
              {useFusionFruit ? "和 1 个灵融果" : ""}；左侧在保存前保持不变
            </p>
          </div>
          {run ? (
            <button
              ref={primaryButtonRef}
              type="button"
              className="min-h-14 w-full rounded-full bg-amber-200 px-16 py-3 text-lg font-bold text-amber-950 shadow-[0_8px_24px_rgba(217,119,6,0.22)] transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 sm:w-auto sm:min-w-64"
              onClick={onSave}
            >
              保存
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  );
};

export default SpiritBeastFusionComparison;
