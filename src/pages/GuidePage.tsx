import { useMemo, useState } from "react";
import ContentSourceLink from "../components/ContentSourceLink";
import FavoriteButton from "../components/FavoriteButton";
import {
  CONTENT_VERIFIED_AT,
  GUIDE_ENTRIES,
  type GuideCategory,
} from "../data/content";
import type { FavoritesState } from "../utils/favorites";
import { isFavorite } from "../utils/favorites";

type CategoryFilter = "全部" | GuideCategory;

const CATEGORY_FILTERS: readonly CategoryFilter[] = [
  "全部",
  "版本",
  "门派",
  "养成",
  "坐骑",
  "入门",
  "合集",
];

const GuidePage = ({
  favorites,
  onToggleFavorite,
}: {
  favorites: FavoritesState;
  onToggleFavorite: (id: string) => void;
}) => {
  const [category, setCategory] = useState<CategoryFilter>("全部");
  const entries = useMemo(
    () =>
      category === "全部"
        ? GUIDE_ENTRIES
        : GUIDE_ENTRIES.filter((entry) => entry.category === category),
    [category],
  );

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">官方攻略索引</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          只收录官网发布的攻略、版本说明和资料入口。文章发布日期较早时，请先确认内容是否仍适用于当前版本。
        </p>
        <p className="mt-2 text-xs text-slate-400">
          链接核验日期：{CONTENT_VERIFIED_AT}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div
          className="flex flex-wrap gap-2 border-b border-slate-100 p-4 sm:p-5"
          role="group"
          aria-label="攻略分类"
        >
          {CATEGORY_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className={`min-h-10 rounded-lg px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                category === item
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100 px-4 pb-2 sm:px-5">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    {entry.category}
                  </span>
                  <time
                    dateTime={entry.source.publishedAt}
                    className="text-xs text-slate-400"
                  >
                    发布于 {entry.source.publishedAt}
                  </time>
                </div>
                <h2 className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">
                  {entry.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {entry.summary}
                </p>
                <div className="mt-2">
                  <ContentSourceLink source={entry.source} />
                </div>
              </div>

              <FavoriteButton
                active={isFavorite(favorites, "guide", entry.id)}
                label={entry.title}
                onClick={() => onToggleFavorite(entry.id)}
              />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GuidePage;
