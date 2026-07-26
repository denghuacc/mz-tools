import { useMemo, useState } from "react";
import ContentSourceLink from "../components/ContentSourceLink";
import FavoriteButton from "../components/FavoriteButton";
import {
  COMPANION_ENTRIES,
  CONTENT_VERIFIED_AT,
  EQUIPMENT_ENTRIES,
  SECT_PROFILES,
} from "../data/content";
import type { CompanionKind, EquipmentCategory } from "../data/content";
import type { Profession } from "../types";
import { ProfessionEnum } from "../types";
import type { FavoriteKind, FavoritesState } from "../utils/favorites";
import { isFavorite } from "../utils/favorites";

type DataCategory = "sect" | "equipment" | "companion";
type DataFavoriteKind = Exclude<FavoriteKind, "guide">;
type ProfessionFilter = "全部" | Profession;
type EquipmentFilter = "全部" | EquipmentCategory;
type CompanionFilter = "全部" | CompanionKind;

const DATA_CATEGORIES: readonly {
  id: DataCategory;
  label: string;
}[] = [
  { id: "sect", label: "门派" },
  { id: "equipment", label: "装备" },
  { id: "companion", label: "灵兽与坐骑" },
];

const PROFESSION_FILTERS: readonly ProfessionFilter[] = [
  "全部",
  ProfessionEnum.PHYSICAL,
  ProfessionEnum.MAGIC,
  ProfessionEnum.HEALING,
  ProfessionEnum.SEAL,
];

const EQUIPMENT_FILTERS: readonly EquipmentFilter[] = [
  "全部",
  "打造",
  "升级",
  "词条",
  "全等级装备",
];

const COMPANION_FILTERS: readonly CompanionFilter[] = ["全部", "灵兽", "坐骑"];

const SEARCH_CONTENT: Record<
  DataCategory,
  { label: string; placeholder: string }
> = {
  sect: {
    label: "搜索门派或定位",
    placeholder: "例如：鬼道、封印、持续治疗",
  },
  equipment: {
    label: "搜索装备资料",
    placeholder: "例如：110级、词条、赛年神装",
  },
  companion: {
    label: "搜索灵兽或坐骑",
    placeholder: "例如：九儿、法术、速度支援",
  },
};

const FilterButtons = <T extends string>({
  items,
  selected,
  label,
  onChange,
}: {
  items: readonly T[];
  selected: T;
  label: string;
  onChange: (item: T) => void;
}) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
    {items.map((item) => (
      <button
        key={item}
        type="button"
        aria-pressed={selected === item}
        className={`min-h-10 rounded-lg px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          selected === item
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
        onClick={() => onChange(item)}
      >
        {item}
      </button>
    ))}
  </div>
);

const DataPage = ({
  favorites,
  onToggleFavorite,
}: {
  favorites: FavoritesState;
  onToggleFavorite: (kind: DataFavoriteKind, id: string) => void;
}) => {
  const [activeCategory, setActiveCategory] = useState<DataCategory>("sect");
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("全部");
  const [equipmentCategory, setEquipmentCategory] =
    useState<EquipmentFilter>("全部");
  const [companionKind, setCompanionKind] = useState<CompanionFilter>("全部");

  const keyword = query.trim().toLocaleLowerCase("zh-CN");

  const profiles = useMemo(
    () =>
      SECT_PROFILES.filter((profile) => {
        const matchesProfession =
          profession === "全部" || profile.profession === profession;
        const matchesQuery =
          keyword === "" ||
          [profile.id, profile.positioning, profile.summary].some((value) =>
            value.toLocaleLowerCase("zh-CN").includes(keyword),
          );

        return matchesProfession && matchesQuery;
      }),
    [keyword, profession],
  );

  const equipmentEntries = useMemo(
    () =>
      EQUIPMENT_ENTRIES.filter((entry) => {
        const matchesCategory =
          equipmentCategory === "全部" || entry.category === equipmentCategory;
        const matchesQuery =
          keyword === "" ||
          [entry.title, entry.category, entry.availability, entry.summary].some(
            (value) => value.toLocaleLowerCase("zh-CN").includes(keyword),
          );

        return matchesCategory && matchesQuery;
      }),
    [equipmentCategory, keyword],
  );

  const companionEntries = useMemo(
    () =>
      COMPANION_ENTRIES.filter((entry) => {
        const matchesKind =
          companionKind === "全部" || entry.kind === companionKind;
        const matchesQuery =
          keyword === "" ||
          [
            entry.title,
            entry.kind,
            entry.positioning,
            entry.availability,
            entry.summary,
          ].some((value) => value.toLocaleLowerCase("zh-CN").includes(keyword));

        return matchesKind && matchesQuery;
      }),
    [companionKind, keyword],
  );

  const resultCount =
    activeCategory === "sect"
      ? profiles.length
      : activeCategory === "equipment"
        ? equipmentEntries.length
        : companionEntries.length;
  const resultLabel =
    activeCategory === "sect"
      ? "个门派"
      : activeCategory === "equipment"
        ? "条装备资料"
        : "条灵兽与坐骑资料";

  const handleCategoryChange = (category: DataCategory) => {
    setActiveCategory(category);
    setQuery("");
  };

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">游戏资料查询</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          收录门派定位、装备机制以及灵兽与坐骑资料。内容优先来自《梦幻新诛仙》官网，旧公告中的限时获取方式不代表当前仍然开放。
        </p>
        <p className="mt-2 text-xs text-slate-400">
          数据快照核验日期：{CONTENT_VERIFIED_AT} ·
          具体技能和数值以当前游戏版本为准
        </p>
      </section>

      <div
        className="inline-flex max-w-full gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label="资料分类"
      >
        {DATA_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            aria-controls="data-results"
            className={`min-h-10 shrink-0 rounded-md px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeCategory === category.id
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <section
        id="data-results"
        role="tabpanel"
        className="rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div>
            <label
              htmlFor="data-search"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              {SEARCH_CONTENT[activeCategory].label}
            </label>
            <input
              id="data-search"
              type="search"
              value={query}
              placeholder={SEARCH_CONTENT[activeCategory].placeholder}
              className="block h-11 w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {activeCategory === "sect" ? (
            <FilterButtons
              items={PROFESSION_FILTERS}
              selected={profession}
              label="按职业筛选"
              onChange={setProfession}
            />
          ) : activeCategory === "equipment" ? (
            <FilterButtons
              items={EQUIPMENT_FILTERS}
              selected={equipmentCategory}
              label="按装备主题筛选"
              onChange={setEquipmentCategory}
            />
          ) : (
            <FilterButtons
              items={COMPANION_FILTERS}
              selected={companionKind}
              label="按资料类型筛选"
              onChange={setCompanionKind}
            />
          )}
        </div>

        <div
          aria-live="polite"
          className="px-4 pt-4 text-sm text-slate-500 sm:px-5"
        >
          找到 {resultCount} {resultLabel}
        </div>

        {resultCount > 0 ? (
          <div className="divide-y divide-slate-100 px-4 pb-2 sm:px-5">
            {activeCategory === "sect"
              ? profiles.map((profile) => (
                  <article
                    key={profile.id}
                    className="grid gap-4 py-5 lg:grid-cols-[minmax(140px,0.55fr)_minmax(280px,1.6fr)_auto] lg:items-center"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {profile.id}
                      </h2>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {profile.profession}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {profile.positioning}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {profile.summary}
                      </p>
                      <div className="mt-2">
                        <ContentSourceLink source={profile.source} />
                      </div>
                    </div>

                    <FavoriteButton
                      active={isFavorite(favorites, "sect", profile.id)}
                      label={profile.id}
                      onClick={() => onToggleFavorite("sect", profile.id)}
                    />
                  </article>
                ))
              : activeCategory === "equipment"
                ? equipmentEntries.map((entry) => (
                    <article
                      key={entry.id}
                      className="grid gap-4 py-5 lg:grid-cols-[minmax(180px,0.7fr)_minmax(280px,1.6fr)_auto] lg:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-slate-900">
                            {entry.title}
                          </h2>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {entry.category}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {entry.availability}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm leading-6 text-slate-500">
                          {entry.summary}
                        </p>
                        <div className="mt-2">
                          <ContentSourceLink source={entry.source} />
                        </div>
                      </div>

                      <FavoriteButton
                        active={isFavorite(favorites, "equipment", entry.id)}
                        label={entry.title}
                        onClick={() => onToggleFavorite("equipment", entry.id)}
                      />
                    </article>
                  ))
                : companionEntries.map((entry) => (
                    <article
                      key={entry.id}
                      className="grid gap-4 py-5 lg:grid-cols-[minmax(180px,0.7fr)_minmax(280px,1.6fr)_auto] lg:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-slate-900">
                            {entry.title}
                          </h2>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {entry.kind}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {entry.positioning}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          {entry.availability}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm leading-6 text-slate-500">
                          {entry.summary}
                        </p>
                        <div className="mt-2">
                          <ContentSourceLink source={entry.source} />
                        </div>
                      </div>

                      <FavoriteButton
                        active={isFavorite(favorites, "companion", entry.id)}
                        label={entry.title}
                        onClick={() => onToggleFavorite("companion", entry.id)}
                      />
                    </article>
                  ))}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">没有匹配的资料</p>
            <p className="mt-2 text-sm text-slate-500">
              尝试清空搜索词或切换筛选分类。
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DataPage;
