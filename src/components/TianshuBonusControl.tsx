export type TianshuBonusControlOption = {
  id: string;
  title: string;
  effectLabel: string;
};

type TianshuBonusControlProps = {
  title: string;
  options: readonly TianshuBonusControlOption[];
  counts: Readonly<Record<string, number>>;
  onCountChange: (optionId: string, count: number) => void;
  onReset: () => void;
};

/** 天书固定属性可重复选择，以每个选项的次数作为唯一可编辑状态。 */
const TianshuBonusControl = ({
  title,
  options,
  counts,
  onCountChange,
  onReset,
}: TianshuBonusControlProps) => {
  const selectedCount = Object.values(counts).reduce(
    (total, count) => total + count,
    0
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            每次点击增加一份固定属性，同一选项可以重复选择。
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={selectedCount === 0}
          onClick={onReset}
        >
          清空
        </button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2" role="group" aria-label="天书固定加成选项">
        {options.map((option) => {
          const count = counts[option.id] ?? 0;

          return (
            <div
              key={option.id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
                count > 0
                  ? "border-blue-200 bg-blue-50/70"
                  : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-slate-700">
                  {option.title}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-blue-600">
                  {option.effectLabel} / 次
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`减少天书：${option.title}`}
                  disabled={count === 0}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                  onClick={() => onCountChange(option.id, count - 1)}
                >
                  −
                </button>
                <output
                  aria-label={`${option.title}已选次数`}
                  className="w-8 text-center text-xs font-semibold text-slate-800"
                >
                  ×{count}
                </output>
                <button
                  type="button"
                  aria-label={`增加天书：${option.title}`}
                  className="h-7 w-7 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  onClick={() => onCountChange(option.id, count + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p
        aria-label={`天书已选择 ${selectedCount} 次`}
        aria-live="polite"
        className="mt-3 text-right text-xs text-slate-500"
      >
        已选择 <span className="font-medium text-blue-600">{selectedCount}</span> 次
      </p>
    </section>
  );
};

export default TianshuBonusControl;
