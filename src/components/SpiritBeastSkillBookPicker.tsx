import { useMemo } from "react";
import { type SpiritBeastSkillCategoryFilter } from "../data/spiritBeastFusionSkills";
import { useSpiritBeastSkillOptionFilter } from "../hooks/useSpiritBeastSkillOptionFilter";

const SKILL_CATEGORY_FILTERS: readonly {
  value: SpiritBeastSkillCategoryFilter;
  label: string;
}[] = [
  { value: "all", label: "全部" },
  { value: "common", label: "常规高级" },
  { value: "element", label: "元素相关" },
  { value: "other", label: "其它高级书" },
];

const priceFormatter = new Intl.NumberFormat("zh-CN");

type SpiritBeastSkillBookPickerProps = {
  currentSkillNames: readonly string[];
  selectedSkillName: string | null;
  configurationError: string | null;
  notice: string;
  onSelect: (skillName: string) => void;
  onLearn: () => void;
};

/** 搜索并单选本次要消耗的高级技能书。 */
const SpiritBeastSkillBookPicker = ({
  currentSkillNames,
  selectedSkillName,
  configurationError,
  notice,
  onSelect,
  onLearn,
}: SpiritBeastSkillBookPickerProps) => {
  const { query, setQuery, category, setCategory, filteredOptions } =
    useSpiritBeastSkillOptionFilter();
  const currentSkillNameSet = useMemo(
    () => new Set(currentSkillNames),
    [currentSkillNames],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-blue-600">技能书</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            选择要学习的技能
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            价格来自 2026-08-07 游戏截图，仅作为本轮消耗参考。
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
          {filteredOptions.length} 项
        </span>
      </div>

      <label className="mt-4 block">
        <span className="sr-only">搜索要学习的技能</span>
        <input
          type="search"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          aria-label="搜索要学习的技能"
          placeholder="搜索技能名称，如“火元素”"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div
        className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="技能书分类"
      >
        {SKILL_CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              category === filter.value
                ? "bg-slate-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
            aria-pressed={category === filter.value}
            onClick={() => setCategory(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div
        className="mt-3 grid max-h-[32rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3"
        role="radiogroup"
        aria-label="选择学习技能"
      >
        {filteredOptions.map((option) => {
          const isSelected = selectedSkillName === option.name;
          const isOwned = currentSkillNameSet.has(option.name);

          return (
            <div
              key={option.id}
              className={`relative min-w-0 overflow-hidden rounded-xl border transition ${
                isSelected ? "col-span-2 sm:col-span-2 xl:col-span-1" : ""
              } ${
                isSelected
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-100"
                  : isOwned
                    ? "border-slate-100 bg-slate-50 opacity-50"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${option.name}，参考价 ${priceFormatter.format(option.referencePrice)} 银`}
                className={`relative flex min-h-16 w-full min-w-0 items-center gap-2 p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                  isSelected ? "pr-24" : ""
                } ${isOwned ? "cursor-not-allowed" : ""}`}
                disabled={isOwned}
                onClick={() => onSelect(option.name)}
              >
                <img
                  className="size-12 shrink-0 rounded-lg object-cover"
                  src={option.iconUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-4 text-slate-700">
                    {option.name}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-slate-500">
                    {isOwned
                      ? "已拥有"
                      : `${priceFormatter.format(option.referencePrice)} 银`}
                  </span>
                </span>
              </button>

              {isSelected ? (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 z-10 inline-flex h-8 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 px-3 !text-[11px] !font-semibold !leading-none text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  aria-label={`学习${option.name}`}
                  disabled={Boolean(configurationError)}
                  onClick={onLearn}
                >
                  学习
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {filteredOptions.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          没有找到匹配的技能。
        </p>
      ) : null}

      <p
        className={`mt-3 text-xs leading-5 ${
          configurationError ? "text-amber-700" : "text-slate-500"
        }`}
        aria-live="polite"
      >
        {configurationError ?? "选中技能书后，可直接在技能卡片内点击“学习”。"}
      </p>
      {notice ? (
        <p
          className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
          role="status"
        >
          {notice}
        </p>
      ) : null}
    </section>
  );
};

export default SpiritBeastSkillBookPicker;
