import {
  PRIMARY_ATTRIBUTE_KEYS,
  PRIMARY_ATTRIBUTE_LABELS,
} from "../utils/characterAttributes";
import type { PrimaryAttribute } from "../utils/characterAttributes";

export const STAR_BLESSING_ATTRIBUTE_COUNT = 3;
export type StarBlessingBonusValue = 18 | 25;

type StarBlessingBonusControlProps = {
  title: string;
  selectedAttributes: readonly PrimaryAttribute[];
  bonusValue: StarBlessingBonusValue;
  onSelectedAttributesChange: (attributes: readonly PrimaryAttribute[]) => void;
  onBonusValueChange: (value: StarBlessingBonusValue) => void;
};

/** 按当前门派手动选择三项五维属性，并为三项统一应用祈福档位。 */
const StarBlessingBonusControl = ({
  title,
  selectedAttributes,
  bonusValue,
  onSelectedAttributesChange,
  onBonusValueChange,
}: StarBlessingBonusControlProps) => {
  const toggleAttribute = (attribute: PrimaryAttribute) => {
    if (selectedAttributes.includes(attribute)) {
      onSelectedAttributesChange(
        selectedAttributes.filter((selected) => selected !== attribute),
      );
      return;
    }

    if (selectedAttributes.length < STAR_BLESSING_ATTRIBUTE_COUNT) {
      onSelectedAttributesChange([...selectedAttributes, attribute]);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            按当前门派从灵、力、体、耐、敏中选择 3 项，三项使用同一加成档位。
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={selectedAttributes.length === 0}
          onClick={() => onSelectedAttributesChange([])}
        >
          清空
        </button>
      </div>

      <div
        className="mt-4 grid grid-cols-5 gap-1.5"
        role="group"
        aria-label="星运祈福属性选择"
      >
        {PRIMARY_ATTRIBUTE_KEYS.map((attribute) => {
          const isSelected = selectedAttributes.includes(attribute);
          const isDisabled =
            !isSelected &&
            selectedAttributes.length >= STAR_BLESSING_ATTRIBUTE_COUNT;

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
              {PRIMARY_ATTRIBUTE_LABELS[attribute]}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">必须选择 3 项后才计入结果</span>
        <span
          className={
            selectedAttributes.length === STAR_BLESSING_ATTRIBUTE_COUNT
              ? "font-medium text-emerald-600"
              : "text-slate-500"
          }
        >
          已选 {selectedAttributes.length} / {STAR_BLESSING_ATTRIBUTE_COUNT} 项
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-medium text-slate-600">加成档位</div>
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-label="星运祈福加成档位"
        >
          {([18, 25] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={bonusValue === value}
              className={`h-10 rounded-lg border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                bonusValue === value
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => onBonusValueChange(value)}
            >
              +{value}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StarBlessingBonusControl;
