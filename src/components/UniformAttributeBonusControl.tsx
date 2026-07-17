type UniformAttributeBonusControlProps = {
  title: string;
  description: string;
  attributeLabels: readonly string[];
  value: number;
  onValueChange: (value: number) => void;
  onReset: () => void;
};

/** 录入一个统一数值，并将其同时应用到一组固定属性。 */
const UniformAttributeBonusControl = ({
  title,
  description,
  attributeLabels,
  value,
  onValueChange,
  onReset,
}: UniformAttributeBonusControlProps) => {
  const handleValueChange = (inputValue: string) => {
    if (inputValue === "") {
      onValueChange(0);
      return;
    }

    const nextValue = Number(inputValue);
    if (Number.isFinite(nextValue) && nextValue >= 0) {
      onValueChange(nextValue);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={value === 0}
          onClick={onReset}
        >
          清空
        </button>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1.5" aria-label={`${title}适用属性`}>
        {attributeLabels.map((label) => (
          <span
            key={label}
            className="rounded-lg border border-blue-100 bg-blue-50 px-1 py-2 text-center text-xs font-medium text-blue-700"
          >
            {label}
          </span>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-medium text-slate-600">
          五项统一加成
        </span>
        <span className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
          <span className="mr-2 text-sm text-slate-400">+</span>
          <input
            aria-label={`${title}：五项统一加成`}
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
            placeholder="填写实际属性"
            value={value || ""}
            onChange={(event) => handleValueChange(event.target.value)}
          />
        </span>
      </label>
    </section>
  );
};

export default UniformAttributeBonusControl;
