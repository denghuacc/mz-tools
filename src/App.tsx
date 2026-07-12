import { useState } from "react";
import RingConverter from "./components/RingConverter";
import WeaponConverter from "./components/WeaponConverter";

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

const HomePage = ({ onOpenCalculator }: { onOpenCalculator: () => void }) => (
  <div className="space-y-6">
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="mb-2 text-sm font-medium text-blue-600">欢迎回来</p>
      <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
        梦幻新诛仙实用工具
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        当前已上线武器与戒指属性转换功能。后续的计算、数据查询和攻略内容会逐步补充到对应栏目。
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

      <article className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <p className="text-xs font-medium text-slate-400">持续建设中</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-700">更多实用工具</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          新功能会在这里展示，也会同步加入左侧对应栏目。
        </p>
      </article>
    </section>
  </div>
);

type CalculatorTool = "weapon" | "ring";

const CalculatorPage = () => {
  const [activeTool, setActiveTool] = useState<CalculatorTool>("weapon");
  const isWeapon = activeTool === "weapon";

  return (
    <div className="space-y-4">
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
            onClick={() => setActiveTool(tool)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,672px)_minmax(260px,1fr)]">
        {isWeapon ? <WeaponConverter /> : <RingConverter />}

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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
              <li>更多等级的武器属性</li>
              <li>戒指副属性转换</li>
              <li>门派与装备数据查询</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};

const PlaceholderPage = ({ item }: { item: NavigationItem }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
      功能规划中
    </span>
    <h1 className="mt-4 text-2xl font-semibold text-slate-900">{item.label}</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
      {item.description}。当前栏目暂未开放，后续内容会在这里逐步补充。
    </p>
  </section>
);

function App() {
  const [activePage, setActivePage] = useState<PageId>("calculator");
  const activeItem =
    NAVIGATION_ITEMS.find((item) => item.id === activePage) ??
    NAVIGATION_ITEMS[0];

  const renderPage = () => {
    if (activePage === "home") {
      return <HomePage onOpenCalculator={() => setActivePage("calculator")} />;
    }

    if (activePage === "calculator") {
      return <CalculatorPage />;
    }

    return <PlaceholderPage item={activeItem} />;
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
            className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2 md:hidden"
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
