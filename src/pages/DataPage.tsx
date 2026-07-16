import { useMemo, useState } from "react";
import FavoriteButton from "../components/FavoriteButton";
import ContentSourceLink from "../components/ContentSourceLink";
import { CONTENT_VERIFIED_AT, SECT_PROFILES } from "../data/content";
import type { Profession } from "../types";
import { ProfessionEnum } from "../types";
import type { FavoritesState } from "../utils/favorites";
import { isFavorite } from "../utils/favorites";

type ProfessionFilter = "全部" | Profession;

const PROFESSION_FILTERS: readonly ProfessionFilter[] = [
  "全部",
  ProfessionEnum.PHYSICAL,
  ProfessionEnum.MAGIC,
  ProfessionEnum.HEALING,
  ProfessionEnum.SEAL,
];

const DataPage = ({
  favorites,
  onToggleFavorite,
}: {
  favorites: FavoritesState;
  onToggleFavorite: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState<ProfessionFilter>("全部");

  const profiles = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("zh-CN");

    return SECT_PROFILES.filter((profile) => {
      const matchesProfession =
        profession === "全部" || profile.profession === profession;
      const matchesQuery =
        keyword === "" ||
        [profile.id, profile.positioning, profile.summary].some((value) =>
          value.toLocaleLowerCase("zh-CN").includes(keyword)
        );

      return matchesProfession && matchesQuery;
    });
  }, [profession, query]);

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">门派资料查询</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          收录现有 13 个门派的基础战斗定位。内容来自《梦幻新诛仙》官网，旧资料可能不包含后续新增流派。
        </p>
        <p className="mt-2 text-xs text-slate-400">
          数据快照核验日期：{CONTENT_VERIFIED_AT} · 具体技能和数值以当前游戏版本为准
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div>
            <label
              htmlFor="sect-search"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              搜索门派或定位
            </label>
            <input
              id="sect-search"
              type="search"
              value={query}
              placeholder="例如：鬼道、封印、持续治疗"
              className="block h-11 w-full max-w-xl rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="按职业筛选"
          >
            {PROFESSION_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={profession === item}
                className={`min-h-10 rounded-lg px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  profession === item
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                onClick={() => setProfession(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite" className="px-4 pt-4 text-sm text-slate-500 sm:px-5">
          找到 {profiles.length} 个门派
        </div>

        {profiles.length > 0 ? (
          <div className="divide-y divide-slate-100 px-4 pb-2 sm:px-5">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="grid gap-4 py-5 lg:grid-cols-[minmax(140px,0.55fr)_minmax(280px,1.6fr)_auto] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {profile.id}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {profile.profession}
                    </span>
                  </div>
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
                  onClick={() => onToggleFavorite(profile.id)}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">没有匹配的门派</p>
            <p className="mt-2 text-sm text-slate-500">尝试清空搜索词或切换职业分类。</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default DataPage;
