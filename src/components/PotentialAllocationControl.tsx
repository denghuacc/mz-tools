import { CHARACTER_ALLOCATION_PRESETS } from "../utils/characterAttributes";
import type { CharacterAllocationPresetId } from "../utils/characterAttributes";

type PotentialAllocationControlProps = {
  title: string;
  selectedPresetId: CharacterAllocationPresetId;
  summary: string;
  onSelect: (presetId: CharacterAllocationPresetId) => void;
};

/** 在编辑弹层中选择固定比例的潜力点分配方案。 */
const PotentialAllocationControl = ({
  title,
  selectedPresetId,
  summary,
  onSelect,
}: PotentialAllocationControlProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          按每 10 点的固定比例分配，暂提供常用方案。
        </p>
      </div>
      <p className="text-xs font-medium text-emerald-600">{summary}</p>
    </div>

    <div
      className="mt-3 flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="潜力点加点方案"
    >
      {CHARACTER_ALLOCATION_PRESETS.map((preset) => {
        const isSelected = preset.id === selectedPresetId;

        return (
          <button
            key={preset.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`h-9 rounded-lg border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              isSelected
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            }`}
            onClick={() => onSelect(preset.id)}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  </section>
);

export default PotentialAllocationControl;
