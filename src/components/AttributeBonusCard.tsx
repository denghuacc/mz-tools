import type {
  CharacterAttributeBonuses,
  CharacterBonusAttribute,
} from "../utils/characterAttributes";

export type AttributeBonusField = {
  attribute: CharacterBonusAttribute;
  label: string;
  allowNegative?: boolean;
};

type AttributeBonusCardProps = {
  title: string;
  description: string;
  fields: readonly AttributeBonusField[];
  values: CharacterAttributeBonuses;
  onChange: (attribute: CharacterBonusAttribute, value: number) => void;
  onReset: () => void;
  validationError?: string | null;
};

/** 可配置为单属性或多属性，用于录入技能、装备等来源的直接或潜力属性加成。 */
const AttributeBonusCard = ({
  title,
  description,
  fields,
  values,
  onChange,
  onReset,
  validationError,
}: AttributeBonusCardProps) => {
  const hasBonus = fields.some(({ attribute }) => values[attribute] !== 0);

  const handleChange = (
    attribute: CharacterBonusAttribute,
    inputValue: string,
    allowNegative: boolean,
  ) => {
    if (inputValue === "") {
      onChange(attribute, 0);
      return;
    }

    const nextValue = Number(inputValue);
    if (Number.isFinite(nextValue) && (allowNegative || nextValue >= 0)) {
      onChange(attribute, nextValue);
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
          disabled={!hasBonus}
          onClick={onReset}
        >
          清空
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
        {fields.map(({ attribute, label, allowNegative = false }) => (
          <label key={attribute} className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-600">
              {label}
            </span>
            <span className="flex h-10 items-center rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
              <span className="mr-2 text-sm text-slate-400">
                {allowNegative ? "±" : "+"}
              </span>
              <input
                aria-label={`${title}：${label}`}
                type="number"
                min={allowNegative ? undefined : 0}
                step="any"
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                placeholder="0"
                value={values[attribute] || ""}
                onChange={(event) =>
                  handleChange(attribute, event.target.value, allowNegative)
                }
              />
            </span>
          </label>
        ))}
      </div>

      {validationError && (
        <p
          className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700"
          role="alert"
        >
          {validationError}
        </p>
      )}
    </section>
  );
};

export default AttributeBonusCard;
