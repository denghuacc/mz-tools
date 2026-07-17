import { CONTENT_ITEM_IDS } from "../data/content";

export type FavoriteKind = "sect" | "equipment" | "companion" | "guide";

export type FavoritesState = {
  items: string[];
};

export const FAVORITES_STORAGE_KEY = "mz-tools.favorites.v1";

export const EMPTY_FAVORITES: FavoritesState = { items: [] };

const createFavoriteId = (kind: FavoriteKind, id: string) => `${kind}:${id}`;

/** 读取收藏并过滤已失效或非法的内容 ID。 */
export const loadFavorites = (): FavoritesState => {
  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return EMPTY_FAVORITES;

    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("items" in parsed) ||
      !Array.isArray(parsed.items)
    ) {
      return EMPTY_FAVORITES;
    }

    const items = Array.from(
      new Set(
        parsed.items.filter(
          (item): item is string =>
            typeof item === "string" && CONTENT_ITEM_IDS.has(item)
        )
      )
    );

    return { items };
  } catch {
    return EMPTY_FAVORITES;
  }
};

export const isFavorite = (
  favorites: FavoritesState,
  kind: FavoriteKind,
  id: string
) => favorites.items.includes(createFavoriteId(kind, id));

/** 切换收藏并安全写入本地存储。 */
export const toggleFavorite = (
  favorites: FavoritesState,
  kind: FavoriteKind,
  id: string
): FavoritesState => {
  const favoriteId = createFavoriteId(kind, id);
  const items = favorites.items.includes(favoriteId)
    ? favorites.items.filter((item) => item !== favoriteId)
    : [...favorites.items, favoriteId];
  const next = { items };

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 收藏写入失败不影响当前页面继续浏览。
  }

  return next;
};

export const clearFavorites = (): FavoritesState => {
  try {
    window.localStorage.removeItem(FAVORITES_STORAGE_KEY);
  } catch {
    // 存储不可用时仍返回空状态，保证界面可恢复。
  }

  return EMPTY_FAVORITES;
};
