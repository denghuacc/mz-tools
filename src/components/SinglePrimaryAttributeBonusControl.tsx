import {
  PRIMARY_ATTRIBUTE_KEYS,
  PRIMARY_ATTRIBUTE_LABELS,
} from "../utils/characterAttributes";
import type { PrimaryAttribute } from "../utils/characterAttributes";

type SinglePrimaryAttributeBonusControlProps = {
  title: string;
  description: string;
  selectedAttribute: PrimaryAttribute | null;
  value: number;
  onSelect: (attribute: PrimaryAttribute) => void;
  onReset: () => void;
  onValueChange: (value: number) => void;
  maximumValue?: number;
  embedded?: boolean;
  controlLabel?: string;
};

/** 单选五维属性，并录入该属性本次实际增加的潜能点。 */
const SinglePrimaryAttributeBonusControl = ({
  title,
  description,
  selectedAttribute,
  value,
  onSelect,
  onReset,
  onValueChange,
  maximumValue,
  embedded = false,
  controlLabel = title,
}: SinglePrimaryAttributeBonusControlProps) => {
  const handleValueChange = (inputValue: string) => {
    if (inputValue === "") {
      onValueChange(0);
      return;
    }

    const nextValue = Number(inputValue);
    if (
      Number.isFinite(nextValue) &&
      nextValue >= 0 &&
      (maximumValue === undefined || nextValue <= maximumValue)
    ) {
      onValueChange(nextValue);
    }
  };

  return (
    <div
      className={
        embedded
          ? ""
          : "rounded-xl border border-slate-200 bg-slate-50/70 p-3.5"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-400 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={selectedAttribute === null}
          onClick={onReset}
        >
          清空
        </button>
      </div>

      <div
        className="mt-3 grid grid-cols-5 gap-1.5"
        role="radiogroup"
        aria-label={`${controlLabel}潜能属性`}
      >
        {PRIMARY_ATTRIBUTE_KEYS.map((attribute) => {
          const isSelected = attribute === selectedAttribute;

          return (
            <button
              key={attribute}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`h-9 rounded-lg border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => onSelect(attribute)}
            >
              {PRIMARY_ATTRIBUTE_LABELS[attribute]}
            </button>
          );
        })}
      </div>

      <label className="mt-3 flex items-center gap-3">
        <span className="shrink-0 text-xs font-medium text-slate-600">
          潜能点
        </span>
        <span
          className={`flex h-9 min-w-0 flex-1 items-center rounded-lg border bg-white px-3 transition ${
            selectedAttribute
              ? "border-slate-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100"
              : "border-slate-100 bg-slate-100"
          }`}
        >
          <span className="mr-2 text-sm text-slate-400">+</span>
          <input
            aria-label={`${controlLabel}：潜能点`}
            type="number"
            min={0}
            max={maximumValue}
            step="any"
            inputMode="decimal"
            disabled={selectedAttribute === null}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300 disabled:cursor-not-allowed"
            placeholder={selectedAttribute ? "填写实际属性" : "先选择属性"}
            value={value || ""}
            onChange={(event) => handleValueChange(event.target.value)}
          />
        </span>
      </label>
    </div>
  );
};

export default SinglePrimaryAttributeBonusControl;
