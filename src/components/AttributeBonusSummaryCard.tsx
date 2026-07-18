import { useId } from "react";
import EditIconButton from "./EditIconButton";

export type AttributeBonusSummaryItem = {
  label: string;
  value: number;
  unit?: string;
};

type AttributeBonusSummaryCardProps = {
  title: string;
  badge?: string;
  details?: string;
  items: readonly AttributeBonusSummaryItem[];
  onEdit: () => void;
  validationError?: string | null;
};

type SummaryDetailsProps = {
  title: string;
  details: string;
};

const SummaryDetails = ({ title, details }: SummaryDetailsProps) => {
  const tooltipId = useId();

  return (
    <span className="group relative shrink-0">
      <button
        type="button"
        aria-label={`查看${title}详情`}
        aria-describedby={tooltipId}
        title={details}
        className="flex size-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-4"
        >
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M12 11v5" />
          <path strokeLinecap="round" d="M12 8h.01" />
        </svg>
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-20 mt-1 w-max max-w-56 rounded-md bg-slate-900 px-2.5 py-1.5 text-[11px] font-medium leading-5 text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        {details}
      </span>
    </span>
  );
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
  details,
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
          <h3
            className={`text-[13px] font-semibold text-slate-800 ${
              details ? "shrink-0 whitespace-nowrap" : "truncate"
            }`}
          >
            {title}
          </h3>
          {badge && (
            <span className="shrink-0 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
              {badge}
            </span>
          )}
          {details && <SummaryDetails title={title} details={details} />}
        </div>
        <EditIconButton label={`编辑${title}`} onClick={onEdit} />
      </div>

      <div className="mt-2 flex min-h-10 flex-1 flex-wrap content-start gap-1">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={`${item.label}-${item.unit ?? ""}`}
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
