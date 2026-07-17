type GuildBlessingBonusControlProps = {
  title: string;
  enabled: boolean;
  items: readonly { label: string; value: number }[];
  onEnabledChange: (enabled: boolean) => void;
};

/** 启用或停用整组固定帮派祝福，固定数值不允许单独修改。 */
const GuildBlessingBonusControl = ({
  title,
  enabled,
  items,
  onEnabledChange,
}: GuildBlessingBonusControlProps) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          四项数值固定，启用后整组计入最终属性。
        </p>
      </div>
      <button
        type="button"
        aria-pressed={enabled}
        className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        }`}
        onClick={() => onEnabledChange(!enabled)}
      >
        {enabled ? "已启用" : "启用"}
      </button>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className={`rounded-xl border px-3 py-3 text-center transition ${
            enabled
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-slate-200 bg-slate-50 text-slate-400"
          }`}
        >
          <div className="text-xs font-medium">{label}</div>
          <div className="mt-1 text-sm font-semibold">+{value}</div>
        </div>
      ))}
    </div>
  </section>
);

export default GuildBlessingBonusControl;
