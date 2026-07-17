import { useMemo, useState } from "react";
import {
  AFFINITY_LABELS,
  calculateCharacterAttributes,
  CHARACTER_LEVEL,
  CHARACTER_UPGRADE_COUNT,
  EMPTY_CHARACTER_ALLOCATION,
  FIXED_ATTRIBUTE_POINTS_PER_LEVEL,
  LEVEL_ONE_ADVANCED_ATTRIBUTES,
  LEVEL_ONE_STATUS_ATTRIBUTES,
  POTENTIAL_POINTS_PER_LEVEL,
  PRIMARY_ATTRIBUTE_KEYS,
  PRIMARY_ATTRIBUTE_LABELS,
  SEAL_HIT_POINTS_PER_UPGRADE,
  TOTAL_POTENTIAL_POINTS,
} from "../utils/characterAttributes";
import type {
  CharacterAllocation,
  PrimaryAttribute,
} from "../utils/characterAttributes";

const ATTRIBUTE_RULES: Record<PrimaryAttribute, string> = {
  constitution: "+3 气血 · +0.1 法攻/法防/速度",
  spirit: "+0.5 法攻/法防 · +0.05 速度",
  strength: "+0.5 物攻 · +0.3 法攻/法防 · +0.1 速度",
  endurance: "+1 物防 · +0.1 法攻/法防/速度",
  agility: "+0.5 速度",
};

const DERIVED_ATTRIBUTES = [
  ["magicAttack", "法攻"],
  ["magicDefense", "法防"],
  ["physicalAttack", "物攻"],
  ["physicalDefense", "物防"],
  ["speed", "速度"],
] as const;

const PRIMARY_ATTRIBUTE_SHORT_LABELS: Record<PrimaryAttribute, string> = {
  constitution: "体",
  spirit: "灵",
  strength: "力",
  endurance: "耐",
  agility: "敏",
};

type AttributeTab = "basic" | "advanced";

const ADVANCED_ATTRIBUTE_COLUMNS = [
  [
    { label: "物理暴击", attribute: "physicalCritical", unit: "%" },
    { label: "法术暴击", attribute: "magicalCritical", unit: "%" },
    { label: "命中率", attribute: "hitRate", unit: "%" },
    { label: "躲避率", attribute: "dodgeRate", unit: "%" },
  ],
  [
    { label: "治疗暴击", attribute: "healingCritical", unit: "%" },
    { label: "治疗强度", attribute: "healingPower", unit: "" },
    { label: "封印命中", attribute: "sealHit", unit: "", growsWithLevel: true },
    { label: "封印抵抗", attribute: "sealResistance", unit: "" },
  ],
] as const;

const formatAttribute = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

const CharacterAttributeCalculator = () => {
  const [allocation, setAllocation] = useState<CharacterAllocation>({
    ...EMPTY_CHARACTER_ALLOCATION,
  });
  const [activeAttributeTab, setActiveAttributeTab] =
    useState<AttributeTab>("basic");
  const calculated = useMemo(
    () => calculateCharacterAttributes(allocation),
    [allocation]
  );

  const updateAllocation = (attribute: PrimaryAttribute, nextValue: number) => {
    setAllocation((current) => {
      const currentValue = current[attribute];
      const usedByOthers =
        calculateCharacterAttributes(current).allocatedPoints - currentValue;
      const availableForAttribute = TOTAL_POTENTIAL_POINTS - usedByOthers;
      const safeValue = Number.isFinite(nextValue)
        ? Math.min(Math.max(Math.trunc(nextValue), 0), availableForAttribute)
        : 0;

      return { ...current, [attribute]: safeValue };
    });
  };

  const adjustAllocation = (attribute: PrimaryAttribute, delta: number) => {
    updateAllocation(attribute, allocation[attribute] + delta);
  };

  const resetAllocation = () => {
    setAllocation({ ...EMPTY_CHARACTER_ALLOCATION });
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {CHARACTER_LEVEL} 级裸属性
              </h2>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                白版
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                物理角色基准
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              从刚创建的 1 级角色裸值开始计算，不含装备、魂器、神器与临时符。
            </p>
          </div>
          <button
            type="button"
            className="h-10 shrink-0 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={resetAllocation}
          >
            重置加点
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/70">
          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-xs text-slate-500">潜力点总计</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {TOTAL_POTENTIAL_POINTS}
            </p>
          </div>
          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-xs text-slate-500">已分配</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {calculated.allocatedPoints}
            </p>
          </div>
          <div className="px-3 py-4 text-center sm:px-5">
            <p className="text-xs text-slate-500">剩余</p>
            <p
              className={`mt-1 text-xl font-semibold ${
                calculated.remainingPoints === 0
                  ? "text-emerald-600"
                  : "text-blue-600"
              }`}
            >
              {calculated.remainingPoints}
            </p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(520px,1.2fr)_minmax(360px,0.8fr)]">
        <section className="order-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-900">潜力点分配</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              每级固定五维各 +{FIXED_ATTRIBUTE_POINTS_PER_LEVEL}，另有 +
              {POTENTIAL_POINTS_PER_LEVEL} 点可自由分配；共升级 {CHARACTER_UPGRADE_COUNT} 次。
            </p>
          </div>

          <div className="space-y-3">
            {PRIMARY_ATTRIBUTE_KEYS.map((attribute) => {
              const label = PRIMARY_ATTRIBUTE_LABELS[attribute];
              const canIncrease = calculated.remainingPoints > 0;

              return (
                <div
                  key={attribute}
                  className="rounded-xl border border-slate-200 p-3.5"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <label
                        htmlFor={`${attribute}-allocation`}
                        className="text-sm font-semibold text-slate-800"
                      >
                        {label}
                      </label>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {ATTRIBUTE_RULES[attribute]}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-slate-400">
                      最终 {calculated.primary[attribute]}
                    </p>
                  </div>

                  <div className="grid grid-cols-[40px_minmax(0,1fr)_40px] gap-2">
                    <button
                      type="button"
                      aria-label={`${label}减少 1 点`}
                      className="h-10 rounded-lg border border-slate-200 bg-slate-50 text-lg text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={allocation[attribute] === 0}
                      onClick={() => adjustAllocation(attribute, -1)}
                    >
                      −
                    </button>
                    <input
                      id={`${attribute}-allocation`}
                      aria-label={`${label}加点`}
                      type="number"
                      min={0}
                      max={allocation[attribute] + calculated.remainingPoints}
                      step={1}
                      inputMode="numeric"
                      className="h-10 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-center text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      value={allocation[attribute]}
                      onChange={(event) =>
                        updateAllocation(attribute, Number(event.target.value))
                      }
                    />
                    <button
                      type="button"
                      aria-label={`${label}增加 1 点`}
                      className="h-10 rounded-lg bg-blue-600 text-lg text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      disabled={!canIncrease}
                      onClick={() => adjustAllocation(attribute, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="order-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">状态条</h2>
                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  气血按体力增长；法力只展示 1 级基准，怒气/真气沿用截图值。
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">暂算值</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">气血</span>
                  <strong className="text-base text-emerald-700">
                    {formatAttribute(calculated.derived.health)}
                  </strong>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-full rounded-full bg-emerald-500" />
                </div>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">法力</span>
                  <div className="text-right">
                    <strong className="text-sm text-blue-700">
                      {LEVEL_ONE_STATUS_ATTRIBUTES.mana}
                    </strong>
                    <span className="ml-2 text-xs text-slate-400">
                      1 级基准 · 成长待补
                    </span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-blue-100" />
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">
                    怒气 / 真气
                  </span>
                  <strong className="text-sm text-amber-700">
                    {LEVEL_ONE_STATUS_ATTRIBUTES.anger}
                  </strong>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-100">
                  <div className="h-full w-full rounded-full bg-amber-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div
              className="grid grid-cols-2 rounded-xl bg-slate-100 p-1"
              role="tablist"
              aria-label="属性类型"
            >
              {(
                [
                  ["basic", "基础属性"],
                  ["advanced", "进阶属性"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeAttributeTab === tab}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    activeAttributeTab === tab
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  onClick={() => setActiveAttributeTab(tab)}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeAttributeTab === "basic" ? (
              <div className="mt-5">
                <div className="mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-slate-900">
                      基础属性 · 10 项
                    </h2>
                    <span className="text-xs font-medium text-amber-600">
                      五项派生初值待验证
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    当前值 = 1 级物理角色初始值 + {CHARACTER_UPGRADE_COUNT} 次固定成长 + 潜力点。
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2" role="group" aria-label="派生属性列">
                    {DERIVED_ATTRIBUTES.map(([attribute, label]) => (
                      <div
                        key={attribute}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <span className="text-xs text-slate-600 sm:text-sm">
                          {label}
                        </span>
                        <strong className="text-sm text-slate-900">
                          {formatAttribute(calculated.derived[attribute])}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2" role="group" aria-label="潜力属性列">
                    {PRIMARY_ATTRIBUTE_KEYS.map((attribute) => (
                      <div
                        key={attribute}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                      >
                        <span className="text-xs text-slate-600 sm:text-sm">
                          {PRIMARY_ATTRIBUTE_SHORT_LABELS[attribute]}
                        </span>
                        <div className="min-w-0 text-right">
                          <strong
                            className={`text-sm ${
                              allocation[attribute] > 0
                                ? "text-emerald-600"
                                : "text-slate-900"
                            }`}
                          >
                            {calculated.primary[attribute]}
                          </strong>
                          {allocation[attribute] > 0 && (
                            <span className="ml-1 text-[11px] text-emerald-600">
                              +{allocation[attribute]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      进阶属性 · 8 项
                    </h2>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      潜力点不影响进阶属性；封印命中每次升级固定增加 {SEAL_HIT_POINTS_PER_UPGRADE} 点。
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-emerald-600">
                    69 级规则值
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {ADVANCED_ATTRIBUTE_COLUMNS.map((column, columnIndex) => (
                    <div
                      key={columnIndex}
                      className="space-y-2"
                      role="group"
                      aria-label={`进阶属性第 ${columnIndex + 1} 列`}
                    >
                      {column.map((attribute) => (
                        <div
                          key={attribute.label}
                          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2.5"
                        >
                          <span className="text-xs text-slate-600 sm:text-sm">
                            {attribute.label}
                          </span>
                          <div className="text-right">
                            <strong
                              className={`text-sm ${
                                "growsWithLevel" in attribute
                                  ? "text-emerald-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {calculated.advanced[attribute.attribute]}
                              {attribute.unit}
                            </strong>
                            {"growsWithLevel" in attribute && (
                              <span className="ml-1 text-[11px] text-emerald-600">
                                +
                                {calculated.advanced.sealHit -
                                  LEVEL_ONE_ADVANCED_ATTRIBUTES.sealHit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-800">亲和</h3>
                    <span className="text-xs text-slate-400">潜力点不影响</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {AFFINITY_LABELS.map((affinity) => (
                      <div
                        key={affinity}
                        className="rounded-lg bg-slate-50 px-2 py-3 text-center"
                      >
                        <p className="text-xs text-slate-500">{affinity}</p>
                        <strong className="mt-1 block text-sm text-slate-800">0</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 text-xs leading-6 text-blue-900 sm:px-5">
        <strong className="font-semibold">当前计算口径：</strong>
        以 1 级物理角色截图样本为基准，升至 69 级共成长 {CHARACTER_UPGRADE_COUNT} 次，
        可分配潜力点 {TOTAL_POTENTIAL_POINTS}。初始力量多 10 点，以及法攻/法防/物攻/物防/速度初值是否随机，均待更多新号样本确认。
      </section>
    </div>
  );
};

export default CharacterAttributeCalculator;
