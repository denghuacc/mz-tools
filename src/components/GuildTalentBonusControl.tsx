type GuildTalentBonusControlProps<OptionId extends string> = {
  title: string;
  description?: string;
  groupLabel?: string;
  options: readonly { id: OptionId; label: string; effectLabel?: string }[];
  selectedOptionIds: readonly OptionId[];
  onChange: (optionIds: readonly OptionId[]) => void;
};

/** 展示一组每项最多选择一次的固定属性选项。 */
const GuildTalentBonusControl = <OptionId extends string>({
  title,
  description = "每项可单独选择一次；斜杠两侧的属性属于同一天赋，选择后同时生效。",
  groupLabel = "帮派天赋选择",
  options,
  selectedOptionIds,
  onChange,
}: GuildTalentBonusControlProps<OptionId>) => {
  const toggleOption = (optionId: OptionId) => {
    onChange(
      selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((candidate) => candidate !== optionId)
        : [...selectedOptionIds, optionId]
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={selectedOptionIds.length === 0}
          onClick={() => onChange([])}
        >
          清空
        </button>
      </div>

      <div
        className="mt-4 grid gap-2 sm:grid-cols-2"
        role="group"
        aria-label={groupLabel}
      >
        {options.map(({ id, label, effectLabel }) => {
          const isSelected = selectedOptionIds.includes(id);

          return (
            <label
              key={id}
              className={`flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
                isSelected
                  ? "border-orange-400 bg-orange-50 text-orange-800"
                  : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-orange-200 hover:bg-orange-50/50"
              }`}
            >
              <input
                type="checkbox"
                aria-label={label}
                checked={isSelected}
                className="h-4 w-4 shrink-0 accent-orange-500"
                onChange={() => toggleOption(id)}
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium leading-5">
                  {label}
                </span>
                {effectLabel && (
                  <span className="mt-0.5 block text-[11px] font-medium text-orange-600">
                    {effectLabel}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      <p className="mt-3 text-right text-xs text-slate-500">
        已选 <span className="font-medium text-orange-600">{selectedOptionIds.length}</span>
        {" / "}{options.length} 项
      </p>
    </section>
  );
};

export default GuildTalentBonusControl;
