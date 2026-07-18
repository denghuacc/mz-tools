import EditIconButton from "./EditIconButton";

export type AttributeBonusSummaryItem = {
  label: string;
  value: number;
  unit?: string;
};

type AttributeBonusSummaryCardProps = {
  title: string;
  badge?: string;
  items: readonly AttributeBonusSummaryItem[];
  onEdit: () => void;
  validationError?: string | null;
};

const formatValue = (value: number, unit = "") => {
  const formatted = Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

  return `${value > 0 ? "+" : ""}${formatted}${unit}`;
};

/** 紧凑展示一类属性来源的已配置变更，完整录入交给独立编辑弹层。 */
const AttributeBonusSummaryCard = ({
  title,
  badge,
  items,
  onEdit,
  validationError,
}: AttributeBonusSummaryCardProps) => (
    <article
      className={`flex min-h-24 flex-col rounded-xl border p-3 transition hover:border-blue-200 hover:bg-blue-50/30 ${
        validationError
          ? "border-rose-200 bg-rose-50/40"
          : "border-slate-200 bg-slate-50/60"
      }`}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="truncate text-[13px] font-semibold text-slate-800">
            {title}
          </h3>
          {badge && (
            <span className="shrink-0 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
              {badge}
            </span>
          )}
        </div>
        <EditIconButton label={`编辑${title}`} onClick={onEdit} />
      </div>

      <div className="mt-2 flex min-h-10 flex-1 flex-wrap content-start gap-1">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item.label}
              className={`whitespace-nowrap rounded-md bg-white px-1.5 py-1 text-[11px] font-medium ${
                item.value < 0 ? "text-rose-600" : "text-blue-600"
              }`}
            >
              {item.label} {formatValue(item.value, item.unit)}
            </span>
          ))
        ) : (
          <span className="text-xs leading-5 text-slate-400">尚未添加</span>
        )}
      </div>

      {validationError && (
        <p className="mt-1 text-[11px] font-medium text-rose-600">
          数值待调整
        </p>
      )}
    </article>
  );

export default AttributeBonusSummaryCard;
