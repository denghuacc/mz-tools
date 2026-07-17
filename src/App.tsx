import { useState } from "react";
import RingConverter from "./components/RingConverter";
import WeaponConverter from "./components/WeaponConverter";
import DataPage from "./pages/DataPage";
import FavoritesPage from "./pages/FavoritesPage";
import GuidePage from "./pages/GuidePage";
import SettingsPage from "./pages/SettingsPage";
import {
  loadPreferences,
  resetPreferences,
  updatePreferences,
} from "./utils/preferences";
import type { CalculatorTool } from "./utils/preferences";
import {
  clearFavorites,
  loadFavorites,
  toggleFavorite,
} from "./utils/favorites";
import type { FavoriteKind } from "./utils/favorites";

type PageId =
  | "home"
  | "calculator"
  | "data"
  | "guide"
  | "favorites"
  | "settings";

type NavigationItem = {
  id: PageId;
  label: string;
  description: string;
};

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { id: "home", label: "首页", description: "工具箱概览与最近更新" },
  { id: "calculator", label: "计算器", description: "游戏数值计算工具" },
  { id: "data", label: "数据查询", description: "门派、装备与灵兽资料" },
  { id: "guide", label: "攻略", description: "玩法攻略与实用技巧" },
  { id: "favorites", label: "收藏", description: "保存常用工具和内容" },
  { id: "settings", label: "设置", description: "个性化工具箱体验" },
];

const HomePage = ({
  onOpenCalculator,
  onOpenData,
  onOpenGuide,
}: {
  onOpenCalculator: () => void;
  onOpenData: () => void;
  onOpenGuide: () => void;
}) => (
  <div className="space-y-6">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="mb-2 text-sm font-medium text-blue-600">欢迎回来</p>
      <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
        梦幻新诛仙实用工具
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        当前已上线装备属性转换、游戏资料查询和官方攻略索引，资料均保留原文链接与核验日期。
      </p>
    </section>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-blue-600">已上线</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">
          装备属性转换
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          计算不同门派武器与戒指转换后的主属性。
        </p>
        <button
          type="button"
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onOpenCalculator}
        >
          进入计算器
        </button>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-blue-600">官网资料</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">游戏资料查询</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          查询门派、装备、灵兽与坐骑资料，并查看官网出处。
        </p>
        <button
          type="button"
          className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onOpenData}
        >
          查询资料
        </button>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-blue-600">官方内容</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">攻略与版本资料</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          按主题浏览官方攻略、门派说明和近期版本公告。
        </p>
        <button
          type="button"
          className="mt-5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={onOpenGuide}
        >
          浏览攻略
        </button>
      </article>
    </section>
  </div>
);

const CalculatorPage = () => {
  const [activeTool, setActiveTool] = useState<CalculatorTool>(
    () => loadPreferences().activeTool
  );
  const isWeapon = activeTool === "weapon";

  const handleToolChange = (tool: CalculatorTool) => {
    setActiveTool(tool);
    updatePreferences({ activeTool: tool });
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-blue-600">计算器</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          装备数值计算
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          输入当前装备属性，查看转换至目标门派后的数值变化。
        </p>
      </div>

      <div
        className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        role="tablist"
        aria-label="装备转换类型"
      >
        {(
          [
            ["weapon", "武器转换"],
            ["ring", "戒指转换"],
          ] as const
        ).map(([tool, label]) => (
          <button
            key={tool}
            type="button"
            role="tab"
            aria-selected={activeTool === tool}
            className={`rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTool === tool
                ? "bg-blue-600 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
            onClick={() => handleToolChange(tool)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,672px)_minmax(260px,1fr)]">
        {isWeapon ? <WeaponConverter /> : <RingConverter />}

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 hidden border-b border-slate-100 pb-5 xl:block">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {isWeapon ? "武器属性转换器" : "戒指属性转换器"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {isWeapon
                  ? "设置转换路径，并填写当前武器的三项属性。"
                  : "选择当前与目标门派，并填写戒指的两项主属性。"}
              </p>
            </div>
            <h2 className="text-base font-semibold text-slate-900">工具说明</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-500">
              {isWeapon ? (
                <>
                  <p>选择武器等级、当前门派与目标门派，再填写三项武器属性。</p>
                  <p>如武器经过原造型转换，可选择原造型以计算完整转换路径。</p>
                </>
              ) : (
                <>
                  <p>戒指第一条主属性固定为气血，转换后数值保持不变。</p>
                  <p>戒指为全等级装备，属性值会随角色等级自动成长。</p>
                  <p>第二条主属性按门派职业类型的对应比例转换。</p>
                </>
              )}
              <p>计算结果可能与游戏内实际数值存在轻微差异，仅供参考。</p>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-900">后续计划</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                逐步更新
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-500">
              <li>规则数据持续核验</li>
              <li>装备与灵兽资料持续更新</li>
              <li>官方攻略索引持续更新</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

function App() {
  const [activePage, setActivePage] = useState<PageId>("calculator");
  const [favorites, setFavorites] = useState(loadFavorites);
  const activeItem =
    NAVIGATION_ITEMS.find((item) => item.id === activePage) ??
    NAVIGATION_ITEMS[0];

  const handleToggleFavorite = (kind: FavoriteKind, id: string) => {
    setFavorites((current) => toggleFavorite(current, kind, id));
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return (
          <HomePage
            onOpenCalculator={() => setActivePage("calculator")}
            onOpenData={() => setActivePage("data")}
            onOpenGuide={() => setActivePage("guide")}
          />
        );
      case "calculator":
        return <CalculatorPage />;
      case "data":
        return (
          <DataPage
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "guide":
        return (
          <GuidePage
            favorites={favorites}
            onToggleFavorite={(id) => handleToggleFavorite("guide", id)}
          />
        );
      case "favorites":
        return (
          <FavoritesPage
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onBrowseData={() => setActivePage("data")}
          />
        );
      case "settings":
        return (
          <SettingsPage
            favoriteCount={favorites.items.length}
            onResetPreferences={resetPreferences}
            onClearFavorites={() => setFavorites(clearFavorites())}
          />
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 py-0 flex justify-center">
      <div className="min-h-screen w-full bg-slate-50 text-slate-800">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center">
            <div className="flex h-full w-full items-center px-4 md:w-60 md:border-r md:border-slate-200 md:px-6">
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold tracking-tight text-slate-900">
                  梦幻新诛仙工具箱
                </p>
                <p className="mt-0.5 text-xs text-slate-400 md:hidden">
                  {activeItem.label}
                </p>
              </div>
            </div>

            <div className="hidden min-w-0 flex-1 items-center justify-between gap-6 px-7 md:flex">
              <p className="truncate text-sm text-slate-500">
                工具箱&nbsp;&nbsp;/&nbsp;&nbsp;
                <span className="font-medium text-slate-800">{activeItem.label}</span>
              </p>
              <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                持续更新中
              </span>
            </div>
          </div>

          <nav
            className="no-scrollbar flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden"
            aria-label="移动端主导航"
          >
            {NAVIGATION_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={activePage === item.id ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  activePage === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
                onClick={() => setActivePage(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        <div className="flex min-h-[calc(100vh-4rem)]">
          <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
            <nav className="sticky top-16 space-y-1 p-4" aria-label="主导航">
              {NAVIGATION_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-current={activePage === item.id ? "page" : undefined}
                  className={`w-full rounded-lg border-l-2 px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activePage === item.id
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  onClick={() => setActivePage(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1400px]">{renderPage()}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
