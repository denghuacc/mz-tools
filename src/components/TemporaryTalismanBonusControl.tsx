import type { CharacterBonusAttribute } from "../utils/characterAttributes";

export type TemporaryTalismanStar = 6;

export type TemporaryTalismanBonusOption<
  Attribute extends CharacterBonusAttribute = CharacterBonusAttribute,
> = {
  attribute: Attribute;
  label: string;
  value: number;
};

type TemporaryTalismanBonusControlProps<
  Attribute extends CharacterBonusAttribute,
> = {
  title: string;
  options: readonly TemporaryTalismanBonusOption<Attribute>[];
  selectedStar: TemporaryTalismanStar | null;
  selectedAttributes: readonly Attribute[];
  onStarChange: (star: TemporaryTalismanStar) => void;
  onSelectedAttributesChange: (attributes: readonly Attribute[]) => void;
  onReset: () => void;
};

/** 选择灵符星级和固定满值属性，不允许手动录入无法核验的中间数值。 */
const TemporaryTalismanBonusControl = <
  Attribute extends CharacterBonusAttribute,
>({
  title,
  options,
  selectedStar,
  selectedAttributes,
  onStarChange,
  onSelectedAttributesChange,
  onReset,
}: TemporaryTalismanBonusControlProps<Attribute>) => {
  const isSixStarSelected = selectedStar === 6;

  const toggleAttribute = (attribute: Attribute) => {
    if (!isSixStarSelected) return;

    onSelectedAttributesChange(
      selectedAttributes.includes(attribute)
        ? selectedAttributes.filter((candidate) => candidate !== attribute)
        : [...selectedAttributes, attribute],
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            选择灵符星级后勾选打符属性，自动使用该星级的满属性。
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={selectedStar === null && selectedAttributes.length === 0}
          onClick={onReset}
        >
          清空
        </button>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-600">灵符星级</p>
        <div
          className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="radiogroup"
          aria-label="灵符星级选择"
        >
          <button
            type="button"
            role="radio"
            aria-checked={isSixStarSelected}
            className={`rounded-xl border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1 ${
              isSixStarSelected
                ? "border-violet-600 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-violet-200 hover:bg-violet-50/60"
            }`}
            onClick={() => onStarChange(6)}
          >
            <span className="block text-sm font-semibold">6 星灵符</span>
            <span className="mt-1 block text-[11px] text-slate-500">
              当前唯一支持的满属性预设
            </span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-600">打符属性</p>
          <span className="text-xs text-slate-400">
            已选 {selectedAttributes.length} / {options.length} 项
          </span>
        </div>
        <div
          className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3"
          role="group"
          aria-label="6 星灵符属性选择"
        >
          {options.map(({ attribute, label, value }) => {
            const isSelected = selectedAttributes.includes(attribute);

            return (
              <label
                key={attribute}
                className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2.5 transition ${
                  !isSixStarSelected
                    ? "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300"
                    : isSelected
                      ? "cursor-pointer border-violet-500 bg-violet-50 text-violet-700"
                      : "cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/50"
                }`}
              >
                <input
                  type="checkbox"
                  aria-label={`${label} +${value}`}
                  disabled={!isSixStarSelected}
                  checked={isSelected}
                  className="h-4 w-4 shrink-0 accent-violet-600"
                  onChange={() => toggleAttribute(attribute)}
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium">{label}</span>
                  <span className="mt-0.5 block text-[11px]">+{value}</span>
                </span>
              </label>
            );
          })}
        </div>
        {!isSixStarSelected && (
          <p className="mt-2 text-xs text-slate-400">
            请先选择 6 星灵符，再勾选需要的属性。
          </p>
        )}
      </div>
    </section>
  );
};

export default TemporaryTalismanBonusControl;
