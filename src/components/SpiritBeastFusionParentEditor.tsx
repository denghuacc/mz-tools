import { useEffect, useState } from "react";

import {
  SPIRIT_BEAST_GROWTH_MAX,
  SPIRIT_BEAST_GROWTH_MIN,
  SPIRIT_BEAST_QUALIFICATION_MAX,
  SPIRIT_BEAST_QUALIFICATION_MIN,
  SPIRIT_BEAST_QUALIFICATIONS,
  type SpiritBeastQualification,
} from "../utils/spiritBeastAttributes";
import type { FusionBeast, FusionParents } from "../utils/spiritBeastFusion";
import {
  SPIRIT_BEAST_QUALIFICATION_LABELS,
  SPIRIT_BEAST_QUALIFICATION_SHORT_LABELS,
} from "./spiritBeastLabels";
import SpiritBeastFusionSkillEditor from "./SpiritBeastFusionSkillEditor";

const clampNumber = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const BoundedNumberInput = ({
  label,
  value,
  minimum,
  maximum,
  step,
  className,
  inputMode,
  normalizeValue = (nextValue) => nextValue,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  step: number;
  className: string;
  inputMode?: "decimal" | "numeric";
  normalizeValue?: (value: number) => number;
  onChange: (value: number) => void;
}) => {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const commitValue = () => {
    if (draftValue.trim() === "") {
      setDraftValue(String(value));
      return;
    }

    const parsedValue = Number(draftValue);
    if (!Number.isFinite(parsedValue)) {
      setDraftValue(String(value));
      return;
    }

    const nextValue = clampNumber(
      normalizeValue(parsedValue),
      minimum,
      maximum,
    );
    setDraftValue(String(nextValue));
    if (nextValue !== value) onChange(nextValue);
  };

  return (
    <input
      type="number"
      className={className}
      aria-label={label}
      min={minimum}
      max={maximum}
      step={step}
      inputMode={inputMode}
      value={draftValue}
      onChange={(event) => setDraftValue(event.target.value)}
      onBlur={commitValue}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
      }}
    />
  );
};

const QualificationSliderInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-2.5 py-2">
    <BoundedNumberInput
      className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-right text-sm font-semibold tabular-nums text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      label={label}
      minimum={SPIRIT_BEAST_QUALIFICATION_MIN}
      maximum={SPIRIT_BEAST_QUALIFICATION_MAX}
      step={1}
      inputMode="numeric"
      value={value}
      normalizeValue={Math.round}
      onChange={onChange}
    />
    <input
      type="range"
      className="mt-2 h-2 w-full cursor-pointer accent-blue-600"
      aria-label={`${label}滑杆`}
      min={SPIRIT_BEAST_QUALIFICATION_MIN}
      max={SPIRIT_BEAST_QUALIFICATION_MAX}
      step={1}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
    <span
      className="mt-0.5 flex justify-between text-[10px] text-slate-400"
      aria-hidden="true"
    >
      <span>{SPIRIT_BEAST_QUALIFICATION_MIN}</span>
      <span>{SPIRIT_BEAST_QUALIFICATION_MAX}</span>
    </span>
  </div>
);

type SpiritBeastFusionParentEditorProps = {
  parents: FusionParents;
  onBeastChange: (role: keyof FusionParents, beast: FusionBeast) => void;
  onQualificationChange: (
    role: keyof FusionParents,
    qualification: SpiritBeastQualification,
    value: number,
  ) => void;
};

/** 编辑融合主副宠的名称、资质、成长和自身技能。 */
const SpiritBeastFusionParentEditor = ({
  parents,
  onBeastChange,
  onQualificationChange,
}: SpiritBeastFusionParentEditorProps) => (
  <section
    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    aria-labelledby="fusion-parent-heading"
  >
    <div>
      <h2
        id="fusion-parent-heading"
        className="text-base font-semibold text-slate-900"
      >
        主副宠数据
      </h2>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        可拖动滑杆快速调整，也可直接输入精确数值；资质下限取两只灵兽的较低值，上限暂按较高值增加
        3.5% 估算。
      </p>
    </div>

    <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-1">
      <div className="grid min-w-[520px] grid-cols-[72px_minmax(180px,1fr)_minmax(180px,1fr)] gap-2 text-xs sm:gap-3">
        <span className="self-end pb-2 font-medium text-slate-500">属性</span>
        <label>
          <span className="mb-1.5 block font-semibold text-amber-700">
            主宠
          </span>
          <input
            type="text"
            className="h-9 w-full rounded-lg border border-amber-200 bg-amber-50/50 px-2 text-sm font-semibold text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            aria-label="主宠名称"
            maxLength={20}
            value={parents.main.name}
            onChange={(event) =>
              onBeastChange("main", {
                ...parents.main,
                name: event.target.value,
              })
            }
          />
        </label>
        <label>
          <span className="mb-1.5 block font-semibold text-cyan-700">副宠</span>
          <input
            type="text"
            className="h-9 w-full rounded-lg border border-cyan-200 bg-cyan-50/50 px-2 text-sm font-semibold text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            aria-label="副宠名称"
            maxLength={20}
            value={parents.secondary.name}
            onChange={(event) =>
              onBeastChange("secondary", {
                ...parents.secondary,
                name: event.target.value,
              })
            }
          />
        </label>
        {SPIRIT_BEAST_QUALIFICATIONS.map((qualification) => (
          <div
            key={qualification}
            className="contents"
            role="group"
            aria-label={SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}
          >
            <span className="self-center font-medium text-slate-600">
              {SPIRIT_BEAST_QUALIFICATION_SHORT_LABELS[qualification]}
            </span>
            <QualificationSliderInput
              label={`主宠${SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}`}
              value={parents.main.qualifications[qualification]}
              onChange={(value) =>
                onQualificationChange("main", qualification, value)
              }
            />
            <QualificationSliderInput
              label={`副宠${SPIRIT_BEAST_QUALIFICATION_LABELS[qualification]}`}
              value={parents.secondary.qualifications[qualification]}
              onChange={(value) =>
                onQualificationChange("secondary", qualification, value)
              }
            />
          </div>
        ))}

        <span className="self-center font-medium text-slate-600">成长</span>
        <BoundedNumberInput
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-right text-sm font-semibold tabular-nums text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          label="主宠成长"
          minimum={SPIRIT_BEAST_GROWTH_MIN}
          maximum={SPIRIT_BEAST_GROWTH_MAX}
          step={0.001}
          inputMode="decimal"
          value={parents.main.growth}
          normalizeValue={(value) => Math.round(value * 1_000) / 1_000}
          onChange={(growth) =>
            onBeastChange("main", { ...parents.main, growth })
          }
        />
        <BoundedNumberInput
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-right text-sm font-semibold tabular-nums text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          label="副宠成长"
          minimum={SPIRIT_BEAST_GROWTH_MIN}
          maximum={SPIRIT_BEAST_GROWTH_MAX}
          step={0.001}
          inputMode="decimal"
          value={parents.secondary.growth}
          normalizeValue={(value) => Math.round(value * 1_000) / 1_000}
          onChange={(growth) =>
            onBeastChange("secondary", { ...parents.secondary, growth })
          }
        />
      </div>
    </div>

    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      <SpiritBeastFusionSkillEditor
        title="主宠技能"
        accent="main"
        skills={parents.main.skills}
        onChange={(skills) =>
          onBeastChange("main", { ...parents.main, skills })
        }
      />
      <SpiritBeastFusionSkillEditor
        title="副宠技能"
        accent="secondary"
        skills={parents.secondary.skills}
        onChange={(skills) =>
          onBeastChange("secondary", { ...parents.secondary, skills })
        }
      />
    </div>
  </section>
);

export default SpiritBeastFusionParentEditor;
