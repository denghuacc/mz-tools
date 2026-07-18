export type TalismanBonusOption = {
  id: string;
  title: string;
  effectLabel: string;
};

type TalismanBonusControlProps = {
  title: string;
  options: readonly TalismanBonusOption[];
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  onReset: () => void;
};

/** 法宝提供固定的互斥加成，只允许启用其中一种效果。 */
const TalismanBonusControl = ({
  title,
  options,
  selectedOptionId,
  onSelect,
  onReset,
}: TalismanBonusControlProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          选择一种法宝加成，属性数值按当前角色等级自动计算。
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
        disabled={selectedOptionId === null}
        onClick={onReset}
      >
        清空
      </button>
    </div>

    <div className="mt-4 grid gap-2" role="radiogroup" aria-label="法宝加成选择">
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
  </section>
);

export default TalismanBonusControl;
