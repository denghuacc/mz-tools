const SATIN_ATTRIBUTE_FIELDS = [
  { attribute: "physicalAttack", label: "物攻" },
  { attribute: "magicAttack", label: "法攻" },
  { attribute: "physicalDefense", label: "物防" },
  { attribute: "magicDefense", label: "法防" },
  { attribute: "speed", label: "速度" },
] as const;

export type SatinBonusAttribute =
  (typeof SATIN_ATTRIBUTE_FIELDS)[number]["attribute"];

export type SatinBonusSelection = {
  attribute: SatinBonusAttribute;
  value: number;
};

type SatinAttributeBonusControlProps = {
  title: string;
  selections: readonly SatinBonusSelection[];
  onChange: (selections: readonly SatinBonusSelection[]) => void;
};

const MAX_SATIN_ATTRIBUTE_COUNT = 2;

/** 录入一至两项缎纹直接属性，并在达到两项后阻止继续选择。 */
const SatinAttributeBonusControl = ({
  title,
  selections,
  onChange,
}: SatinAttributeBonusControlProps) => {
  const toggleAttribute = (attribute: SatinBonusAttribute) => {
    const isSelected = selections.some(
      (selection) => selection.attribute === attribute
    );

    if (isSelected) {
      onChange(
        selections.filter((selection) => selection.attribute !== attribute)
      );
      return;
    }

    if (selections.length < MAX_SATIN_ATTRIBUTE_COUNT) {
      onChange([...selections, { attribute, value: 0 }]);
    }
  };

  const updateValue = (attribute: SatinBonusAttribute, inputValue: string) => {
    const nextValue = inputValue === "" ? 0 : Number(inputValue);

    if (!Number.isFinite(nextValue) || nextValue < 0) {
      return;
    }

    onChange(
      selections.map((selection) =>
        selection.attribute === attribute
          ? { ...selection, value: nextValue }
          : selection
      )
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            从物攻、法攻、物防、法防、速度中选择一至两项，并填写实际数值。
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={selections.length === 0}
          onClick={() => onChange([])}
        >
          清空
        </button>
      </div>

      <div
        className="mt-3 grid grid-cols-5 gap-1.5"
        role="group"
        aria-label="缎纹属性选择"
      >
        {SATIN_ATTRIBUTE_FIELDS.map(({ attribute, label }) => {
          const isSelected = selections.some(
            (selection) => selection.attribute === attribute
          );
          const isDisabled =
            !isSelected && selections.length >= MAX_SATIN_ATTRIBUTE_COUNT;

          return (
            <button
              key={attribute}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              className={`h-9 rounded-lg border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300 ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => toggleAttribute(attribute)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">最多选择 2 项</span>
        <span
          className={
            selections.length === MAX_SATIN_ATTRIBUTE_COUNT
              ? "font-medium text-emerald-600"
              : "text-slate-500"
          }
        >
          已选 {selections.length} / {MAX_SATIN_ATTRIBUTE_COUNT} 项
        </span>
      </div>

      {selections.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {selections.map((selection) => {
            const label = SATIN_ATTRIBUTE_FIELDS.find(
              ({ attribute }) => attribute === selection.attribute
            )?.label;

            if (!label) {
              return null;
            }

            return (
              <label key={selection.attribute} className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  {label}
                </span>
                <span className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="mr-2 text-sm text-slate-400">+</span>
                  <input
                    aria-label={`缎纹属性：${label}`}
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-300"
                    placeholder="填写实际属性"
                    value={selection.value || ""}
                    onChange={(event) =>
                      updateValue(selection.attribute, event.target.value)
                    }
                  />
                </span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SatinAttributeBonusControl;
