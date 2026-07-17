import ContentSourceLink from "../components/ContentSourceLink";
import FavoriteButton from "../components/FavoriteButton";
import {
  COMPANION_ENTRIES,
  EQUIPMENT_ENTRIES,
  GUIDE_ENTRIES,
  SECT_PROFILES,
} from "../data/content";
import type { FavoriteKind, FavoritesState } from "../utils/favorites";
import { isFavorite } from "../utils/favorites";

const FavoritesPage = ({
  favorites,
  onToggleFavorite,
  onBrowseData,
}: {
  favorites: FavoritesState;
  onToggleFavorite: (kind: FavoriteKind, id: string) => void;
  onBrowseData: () => void;
}) => {
  const sects = SECT_PROFILES.filter((profile) =>
    isFavorite(favorites, "sect", profile.id)
  );
  const equipment = EQUIPMENT_ENTRIES.filter((entry) =>
    isFavorite(favorites, "equipment", entry.id)
  );
  const companions = COMPANION_ENTRIES.filter((entry) =>
    isFavorite(favorites, "companion", entry.id)
  );
  const guides = GUIDE_ENTRIES.filter((entry) =>
    isFavorite(favorites, "guide", entry.id)
  );
  const hasFavorites =
    sects.length > 0 ||
    equipment.length > 0 ||
    companions.length > 0 ||
    guides.length > 0;

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">我的收藏</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          收藏仅保存在当前浏览器，不会上传属性、账号或其他个人数据。
        </p>
      </section>

      {hasFavorites ? (
        <div className="space-y-5">
          {sects.length > 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold text-slate-900">门派资料</h2>
              <div className="mt-3 divide-y divide-slate-100">
                {sects.map((profile) => (
                  <article
                    key={profile.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{profile.id}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {profile.positioning}
                      </p>
                      <div className="mt-2">
                        <ContentSourceLink source={profile.source} />
                      </div>
                    </div>
                    <FavoriteButton
                      active
                      label={profile.id}
                      onClick={() => onToggleFavorite("sect", profile.id)}
                    />
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {equipment.length > 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold text-slate-900">装备资料</h2>
              <div className="mt-3 divide-y divide-slate-100">
                {equipment.map((entry) => (
                  <article
                    key={entry.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {entry.summary}
                      </p>
                      <div className="mt-2">
                        <ContentSourceLink source={entry.source} />
                      </div>
                    </div>
                    <FavoriteButton
                      active
                      label={entry.title}
                      onClick={() => onToggleFavorite("equipment", entry.id)}
                    />
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {companions.length > 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold text-slate-900">
                灵兽与坐骑资料
              </h2>
              <div className="mt-3 divide-y divide-slate-100">
                {companions.map((entry) => (
                  <article
                    key={entry.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {entry.positioning} · {entry.summary}
                      </p>
                      <div className="mt-2">
                        <ContentSourceLink source={entry.source} />
                      </div>
                    </div>
                    <FavoriteButton
                      active
                      label={entry.title}
                      onClick={() => onToggleFavorite("companion", entry.id)}
                    />
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {guides.length > 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-semibold text-slate-900">攻略与版本资料</h2>
              <div className="mt-3 divide-y divide-slate-100">
                {guides.map((entry) => (
                  <article
                    key={entry.id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">{entry.summary}</p>
                      <div className="mt-2">
                        <ContentSourceLink source={entry.source} />
                      </div>
                    </div>
                    <FavoriteButton
                      active
                      label={entry.title}
                      onClick={() => onToggleFavorite("guide", entry.id)}
                    />
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">还没有收藏内容</h2>
          <p className="mt-2 text-sm text-slate-500">
            可以先浏览游戏资料，把常用内容保存到这里。
          </p>
          <button
            type="button"
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onBrowseData}
          >
            浏览游戏资料
          </button>
        </section>
      )}
    </div>
  );
};

export default FavoritesPage;
