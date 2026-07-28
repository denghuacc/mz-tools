import { useEffect, useState } from "react";
import {
  SPIRIT_BEAST_GROWTH_MAX,
  SPIRIT_BEAST_GROWTH_MIN,
  SPIRIT_BEAST_QUALIFICATION_MAX,
  SPIRIT_BEAST_QUALIFICATION_MIN,
  SPIRIT_BEAST_QUALIFICATIONS,
} from "../utils/spiritBeastAttributes";
import type { SpiritBeastQualifications } from "../utils/spiritBeastAttributes";
import { SPIRIT_BEAST_QUALIFICATION_LABELS as QUALIFICATION_LABELS } from "./spiritBeastLabels";

type SliderNumberFieldProps = {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  precision?: number;
  onChange: (value: number) => void;
};

const formatSliderValue = (value: number, precision: number) =>
  precision > 0 ? value.toFixed(precision) : String(value);

const SliderNumberField = ({
  label,
  value,
  minimum,
  maximum,
  step,
  precision = 0,
  onChange,
}: SliderNumberFieldProps) => {
  const [draftValue, setDraftValue] = useState(() =>
    formatSliderValue(value, precision),
  );

  useEffect(() => {
    setDraftValue((currentDraft) => {
      const draftNumber = Number(currentDraft);

      // 父状态回传当前输入值时保留编辑格式，避免输入 1.2 后立即变成 1.200。
      return currentDraft !== "" && draftNumber === value
        ? currentDraft
        : formatSliderValue(value, precision);
    });
  }, [precision, value]);

  const commitValue = (inputValue: string) => {
    const nextValue = Number(inputValue);

    if (
      Number.isFinite(nextValue) &&
      nextValue >= minimum &&
      nextValue <= maximum
    ) {
      onChange(nextValue);
      return true;
    }

    return false;
  };

  return (
    <label className="block rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-3">
      <span className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <span className="whitespace-nowrap text-xs font-medium text-slate-700">
          {label}
        </span>
        <input
          type="number"
          aria-label={`${label}数值`}
          className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-right text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-24"
          min={minimum}
          max={maximum}
          step={step}
          inputMode="decimal"
          value={draftValue}
          onBlur={() => {
            if (commitValue(draftValue)) {
              setDraftValue(formatSliderValue(Number(draftValue), precision));
            } else {
              setDraftValue(formatSliderValue(value, precision));
            }
          }}
          onChange={(event) => {
            setDraftValue(event.target.value);
            commitValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      </span>
      <input
        type="range"
        aria-label={`${label}滑杆`}
        className="mt-3 h-2 w-full cursor-pointer accent-blue-600"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{formatSliderValue(minimum, precision)}</span>
        <span>{formatSliderValue(maximum, precision)}</span>
      </span>
    </label>
  );
};

type SpiritBeastQualificationPanelProps = {
  qualifications: SpiritBeastQualifications;
  growth: number;
  accessoryQualificationBonus?: number;
  onQualificationsChange: (qualifications: SpiritBeastQualifications) => void;
  onGrowthChange: (growth: number) => void;
};

/** 资质与成长使用滑杆快速调整，同时保留精确数字输入。 */
const SpiritBeastQualificationPanel = ({
  qualifications,
  growth,
  accessoryQualificationBonus = 0,
  onQualificationsChange,
  onGrowthChange,
}: SpiritBeastQualificationPanelProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-slate-900">灵兽资质</h2>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
          公式待复核
        </span>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        拖动滑杆快速调整，也可以直接输入精确数值。
      </p>
      {accessoryQualificationBonus > 0 ? (
        <p className="mt-1 text-xs font-medium text-violet-600">
          已启用灵饰额外提供全资质 +{accessoryQualificationBonus}
          ，计算时自动叠加。
        </p>
      ) : null}
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2.5">
      {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => (
        <SliderNumberField
          key={qualification}
          label={QUALIFICATION_LABELS[qualification]}
          value={qualifications[qualification]}
          minimum={SPIRIT_BEAST_QUALIFICATION_MIN}
          maximum={SPIRIT_BEAST_QUALIFICATION_MAX}
          step={1}
          onChange={(value) =>
            onQualificationsChange({
              ...qualifications,
              [qualification]: value,
            })
          }
        />
      ))}
      <SliderNumberField
        label="成长"
        value={growth}
        minimum={SPIRIT_BEAST_GROWTH_MIN}
        maximum={SPIRIT_BEAST_GROWTH_MAX}
        step={0.001}
        precision={3}
        onChange={onGrowthChange}
      />
    </div>
  </section>
);

export default SpiritBeastQualificationPanel;
