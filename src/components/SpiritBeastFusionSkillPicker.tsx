import { useMemo, useState } from "react";
import {
  SPIRIT_BEAST_FUSION_SKILL_OPTIONS,
  type SpiritBeastFusionSkillCategory,
} from "../data/spiritBeastFusionSkills";
import { FUSION_SKILL_MAX_PER_BEAST } from "../utils/spiritBeastFusion";

type SkillCategoryFilter = "all" | SpiritBeastFusionSkillCategory;

const SKILL_CATEGORY_FILTERS: readonly {
  value: SkillCategoryFilter;
  label: string;
}[] = [
  { value: "all", label: "全部" },
  { value: "common", label: "常规高级" },
  { value: "element", label: "元素相关" },
  { value: "other", label: "其它" },
];

type SpiritBeastFusionSkillPickerProps = {
  title: string;
  selectedSkillNames: readonly string[];
  onToggle: (skillName: string) => void;
};

/** 从截图技能库中搜索并多选一只灵兽的自身技能。 */
const SpiritBeastFusionSkillPicker = ({
  title,
  selectedSkillNames,
  onToggle,
}: SpiritBeastFusionSkillPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SkillCategoryFilter>("all");
  const selectedSkillNameSet = useMemo(
    () => new Set(selectedSkillNames),
    [selectedSkillNames],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions = SPIRIT_BEAST_FUSION_SKILL_OPTIONS.filter(
    (option) =>
      (category === "all" || option.category === category) &&
      (!normalizedQuery ||
        option.name.toLocaleLowerCase().includes(normalizedQuery)),
  );
  const isAtLimit = selectedSkillNames.length >= FUSION_SKILL_MAX_PER_BEAST;

  return (
    <details
      className="group mt-3 rounded-lg border border-slate-200 bg-white"
      aria-label={`${title}技能选择`}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <svg
            className="size-4 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          搜索并选择技能
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
          {selectedSkillNames.length}/{FUSION_SKILL_MAX_PER_BEAST}
          <svg
            className="size-3.5 transition group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m5 7 5 5 5-5"
            />
          </svg>
        </span>
      </summary>

      {isOpen ? (
        <div className="border-t border-slate-100 p-3">
          <label className="relative block">
            <span className="sr-only">{title}搜索技能</span>
            <svg
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              aria-label={`${title}搜索技能`}
              placeholder="输入名称，如“迅捷”"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>

          <div
            className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1"
            aria-label={`${title}技能分类`}
            role="group"
          >
            {SKILL_CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
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

          {isAtLimit ? (
            <p className="mt-2 text-[11px] text-amber-700">
              已选满 {FUSION_SKILL_MAX_PER_BEAST} 个；取消一个后可继续选择。
            </p>
          ) : null}

          <div
            className="mt-2 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3"
            aria-label={`${title}可选技能`}
            role="group"
          >
            {filteredOptions.map((option) => {
              const isSelected = selectedSkillNameSet.has(option.name);
              const isDisabled = isAtLimit && !isSelected;

              return (
                <label
                  key={option.id}
                  className={`relative flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border p-1.5 text-left transition ${
                    isSelected
                      ? "border-blue-400 bg-blue-50 ring-1 ring-blue-100"
                      : isDisabled
                        ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-45"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    aria-label={option.name}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => onToggle(option.name)}
                  />
                  <img
                    className="size-10 shrink-0 rounded-md object-cover"
                    src={option.iconUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="min-w-0 text-xs font-medium leading-4 text-slate-700">
                    {option.name}
                  </span>
                  {isSelected ? (
                    <span
                      className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-blue-600 text-[10px] font-bold text-white"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>

          {filteredOptions.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              没有找到匹配的技能。
            </p>
          ) : null}
        </div>
      ) : null}
    </details>
  );
};

export default SpiritBeastFusionSkillPicker;
