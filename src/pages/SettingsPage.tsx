import { useState } from "react";
import { CONTENT_VERIFIED_AT } from "../data/content";

const SettingsPage = ({
  favoriteCount,
  onResetPreferences,
  onClearFavorites,
}: {
  favoriteCount: number;
  onResetPreferences: () => void;
  onClearFavorites: () => void;
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">设置</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          管理当前浏览器中的工具偏好、计算器输入和收藏。所有设置均保存在本地。
        </p>
      </section>

      {notice ? (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {notice}
        </p>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">数据来源策略</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-400">来源优先级</dt>
            <dd className="mt-1 font-medium text-slate-700">
              游戏官网与官方公告优先
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">资料快照核验日期</dt>
            <dd className="mt-1 font-medium text-slate-700">
              {CONTENT_VERIFIED_AT}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm leading-6 text-slate-500">
          页面会展示原文链接和发布日期。遇到版本调整时，以游戏内实际内容和最新官方公告为准。
        </p>
        <p className="mt-3 text-xs text-slate-300">FR69服明天</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">本地数据</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          当前收藏 {favoriteCount}{" "}
          项。角色面板、八件装备、灵兽面板和融合配置会保存在当前浏览器；融合结果仅在手动保存到记录时持久化。
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              onResetPreferences();
              setNotice("计算器偏好已恢复默认值。重新打开计算器后生效。");
            }}
          >
            重置计算器偏好
          </button>
          <button
            type="button"
            disabled={favoriteCount === 0}
            className="min-h-11 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
            onClick={() => {
              onClearFavorites();
              setNotice("收藏已清空。");
            }}
          >
            清空收藏
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
