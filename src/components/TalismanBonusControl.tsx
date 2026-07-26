export type TalismanBonusOption = {
  id: string;
  title: string;
  effectLabel: string;
};

type TalismanBonusControlProps = {
  title: string;
  options: readonly TalismanBonusOption[];
  selectedOptionId: string | null;
  additionalOption: TalismanBonusOption;
  isAdditionalOptionSelected: boolean;
  onSelect: (optionId: string) => void;
  onAdditionalOptionSelectedChange: (selected: boolean) => void;
  onReset: () => void;
};

/** 三种主法宝互斥选择，额外法宝可独立勾选并共同生效。 */
const TalismanBonusControl = ({
  title,
  options,
  selectedOptionId,
  additionalOption,
  isAdditionalOptionSelected,
  onSelect,
  onAdditionalOptionSelectedChange,
  onReset,
}: TalismanBonusControlProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          原有三种法宝互斥选择；琥珀朱绫可额外共同佩戴。
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
        disabled={selectedOptionId === null && !isAdditionalOptionSelected}
        onClick={onReset}
      >
        清空
      </button>
    </div>

    <div
      className="mt-4 grid gap-2"
      role="radiogroup"
      aria-label="法宝加成选择"
    >
      {options.map((option) => {
        const isSelected = option.id === selectedOptionId;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`rounded-xl border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              isSelected
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 bg-slate-50/60 hover:border-blue-200 hover:bg-blue-50/60"
            }`}
            onClick={() => onSelect(option.id)}
          >
            <span className="block text-sm font-medium text-slate-800">
              {option.title}
            </span>
            <span className="mt-1 block text-xs font-medium text-blue-600">
              {option.effectLabel}
            </span>
          </button>
        );
      })}
    </div>

    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="mb-2 text-xs font-medium text-slate-500">可共同佩戴</p>
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
          isAdditionalOptionSelected
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/50"
        }`}
      >
        <input
          type="checkbox"
          aria-label={additionalOption.title}
          checked={isAdditionalOptionSelected}
          className="h-4 w-4 shrink-0 accent-indigo-600"
          onChange={(event) =>
            onAdditionalOptionSelectedChange(event.target.checked)
          }
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium text-slate-800">
            {additionalOption.title}
          </span>
          <span className="mt-1 block text-xs font-medium text-indigo-600">
            {additionalOption.effectLabel}
          </span>
        </span>
      </label>
    </div>
  </section>
);

export default TalismanBonusControl;
