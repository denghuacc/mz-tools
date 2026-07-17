import type { CharacterBonusAttribute } from "../utils/characterAttributes";

export type SelectableBonusField<
  Attribute extends CharacterBonusAttribute = CharacterBonusAttribute,
> = {
  attribute: Attribute;
  label: string;
  unit?: string;
};

export type SelectableBonusSelection<
  Attribute extends CharacterBonusAttribute = CharacterBonusAttribute,
> = {
  attribute: Attribute;
  value: number;
};

type SelectableAttributeBonusControlProps<
  Attribute extends CharacterBonusAttribute,
> = {
  title: string;
  description: string;
  groupLabel: string;
  fields: readonly SelectableBonusField<Attribute>[];
  selections: readonly SelectableBonusSelection<Attribute>[];
  onChange: (
    selections: readonly SelectableBonusSelection<Attribute>[]
  ) => void;
  maximumSelectionCount?: number;
};

/** 从指定属性中选择有限项并录入实际加成，可复用于单属性和双属性来源。 */
const SelectableAttributeBonusControl = <
  Attribute extends CharacterBonusAttribute,
>({
  title,
  description,
  groupLabel,
  fields,
  selections,
  onChange,
  maximumSelectionCount = 2,
}: SelectableAttributeBonusControlProps<Attribute>) => {
  const toggleAttribute = (attribute: Attribute) => {
    const isSelected = selections.some(
      (selection) => selection.attribute === attribute
    );

    if (isSelected) {
      onChange(
        selections.filter((selection) => selection.attribute !== attribute)
      );
      return;
    }

    if (selections.length < maximumSelectionCount) {
      onChange([...selections, { attribute, value: 0 }]);
    }
  };

  const updateValue = (attribute: Attribute, inputValue: string) => {
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
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
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
        className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5"
        role="group"
        aria-label={groupLabel}
      >
        {fields.map(({ attribute, label }) => {
          const isSelected = selections.some(
            (selection) => selection.attribute === attribute
          );
          const isDisabled =
            !isSelected && selections.length >= maximumSelectionCount;

          return (
            <button
              key={attribute}
              type="button"
              aria-pressed={isSelected}
              disabled={isDisabled}
              className={`min-h-9 rounded-lg border px-1 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300 ${
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
        <span className="text-slate-400">
          最多选择 {maximumSelectionCount} 项
        </span>
        <span
          className={
            selections.length === maximumSelectionCount
              ? "font-medium text-emerald-600"
              : "text-slate-500"
          }
        >
          已选 {selections.length} / {maximumSelectionCount} 项
        </span>
      </div>

      {selections.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {selections.map((selection) => {
            const field = fields.find(
              ({ attribute }) => attribute === selection.attribute
            );

            if (!field) {
              return null;
            }

            return (
              <label key={selection.attribute} className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                  {field.label}
                </span>
                <span className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="mr-2 text-sm text-slate-400">+</span>
                  <input
                    aria-label={`${title}：${field.label}`}
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
                  {field.unit && (
                    <span className="ml-2 text-xs text-slate-400">
                      {field.unit}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SelectableAttributeBonusControl;
