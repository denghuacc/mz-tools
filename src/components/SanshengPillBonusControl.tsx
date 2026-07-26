import {
  GAME_LAUNCH_YEAR,
  PRIMARY_ATTRIBUTE_KEYS,
  PRIMARY_ATTRIBUTE_LABELS,
  SANSHENG_PILL_ATTRIBUTE_POINTS,
  SANSHENG_PILL_COUNT_PER_YEAR,
} from "../utils/characterAttributes";
import type {
  CharacterAllocation,
  PrimaryAttribute,
} from "../utils/characterAttributes";

type SanshengPillBonusControlProps = {
  title: string;
  counts: CharacterAllocation;
  currentYear: number;
  maximumCount: number;
  onChange: (counts: CharacterAllocation) => void;
};

/** 按五维记录三生造化丹服用颗数，并统一限制累计总数。 */
const SanshengPillBonusControl = ({
  title,
  counts,
  currentYear,
  maximumCount,
  onChange,
}: SanshengPillBonusControlProps) => {
  const usedCount = PRIMARY_ATTRIBUTE_KEYS.reduce(
    (total, attribute) => total + counts[attribute],
    0,
  );
  const gameYearCount = Math.max(0, currentYear - GAME_LAUNCH_YEAR);

  const updateCount = (attribute: PrimaryAttribute, count: number) => {
    const nextUsedCount = usedCount - counts[attribute] + count;

    if (
      Number.isInteger(count) &&
      count >= 0 &&
      nextUsedCount <= maximumCount
    ) {
      onChange({ ...counts, [attribute]: count });
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            每颗选择一项力、体、耐、灵或敏并增加{" "}
            {SANSHENG_PILL_ATTRIBUTE_POINTS} 点；{GAME_LAUNCH_YEAR}{" "}
            年开服，按自然年累计，每年最多服用 {SANSHENG_PILL_COUNT_PER_YEAR}{" "}
            颗。
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:text-slate-300"
          disabled={usedCount === 0}
          onClick={() =>
            onChange({
              constitution: 0,
              spirit: 0,
              strength: 0,
              endurance: 0,
              agility: 0,
            })
          }
        >
          清空
        </button>
      </div>

      <div
        className="mt-4 grid gap-2 sm:grid-cols-2"
        role="group"
        aria-label="三生造化丹属性分配"
      >
        {PRIMARY_ATTRIBUTE_KEYS.map((attribute) => {
          const count = counts[attribute];

          return (
            <div
              key={attribute}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition ${
                count > 0
                  ? "border-blue-200 bg-blue-50/70"
                  : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-slate-700">
                  {PRIMARY_ATTRIBUTE_LABELS[attribute]}
                </div>
                <div className="mt-0.5 text-[11px] font-medium text-blue-600">
                  +{SANSHENG_PILL_ATTRIBUTE_POINTS} 点 / 颗
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`减少三生造化丹：${PRIMARY_ATTRIBUTE_LABELS[attribute]}`}
                  disabled={count === 0}
                  className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                  onClick={() => updateCount(attribute, count - 1)}
                >
                  −
                </button>
                <output
                  aria-label={`${PRIMARY_ATTRIBUTE_LABELS[attribute]}已服用颗数`}
                  className="w-8 text-center text-xs font-semibold text-slate-800"
                >
                  ×{count}
                </output>
                <button
                  type="button"
                  aria-label={`增加三生造化丹：${PRIMARY_ATTRIBUTE_LABELS[attribute]}`}
                  disabled={usedCount >= maximumCount}
                  className="h-7 w-7 rounded-lg bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-300"
                  onClick={() => updateCount(attribute, count + 1)}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p
        aria-label={`三生造化丹已服用 ${usedCount} / ${maximumCount} 颗`}
        aria-live="polite"
        className="mt-3 text-right text-xs text-slate-500"
      >
        {currentYear} 年为开服第 {gameYearCount} 年，已服用{" "}
        <span className="font-medium text-blue-600">{usedCount}</span> /{" "}
        {maximumCount} 颗
      </p>
    </section>
  );
};

export default SanshengPillBonusControl;
