import { useState } from "react";
import { useWeaponConverter } from "../hooks/useWeaponConverter";
import type { AttributeType, Sect, WeaponType } from "../types";
import {
  ATTRIBUTE_FIELDS,
  SECTS_BY_PROFESSION,
  SECT_WEAPON_TYPES,
  WEAPON_LEVEL_CONFIGS,
  WEAPON_LEVEL_OPTIONS,
} from "../types/constants";

type SectOptionsProps = {
  valueType: "sect" | "weapon";
};

const SectOptions = ({ valueType }: SectOptionsProps) =>
  Object.entries(SECTS_BY_PROFESSION).map(([profession, sects]) => (
    <optgroup key={profession} label={profession}>
      {sects.map((sect) => (
        <option
          key={sect}
          value={valueType === "sect" ? sect : SECT_WEAPON_TYPES[sect]}
        >
          {sect} - {SECT_WEAPON_TYPES[sect]}
        </option>
      ))}
    </optgroup>
  ));

const getChangeClassName = (change: number) => {
  if (change > 0) return "bg-green-50 text-green-700";
  if (change < 0) return "bg-red-50 text-red-700";
  return "text-slate-500";
};

const WeaponConverter = () => {
  const {
    weaponLevel,
    setWeaponLevelAndMaxValues,
    currentSect,
    setCurrentSect,
    targetSect,
    setTargetSect,
    originalForm,
    setOriginalForm,
    attributes,
    setAttributes,
    result,
    conversionOutcome,
    error,
    convertAttributes,
    resetAttributes,
    originalData,
  } = useWeaponConverter();

  // 控制原造型数据展示的状态
  const [showOriginalData, setShowOriginalData] = useState(false);
  const levelVerification = WEAPON_LEVEL_CONFIGS[weaponLevel].verification;

  const handleAttributeChange = (type: AttributeType, value: string) => {
    const current = value === "" ? null : Number(value);
    setAttributes((prev) => ({
      ...prev,
      [type]: { ...prev[type], current },
    }));
  };

  const handleSectChange =
    (setter: typeof setCurrentSect | typeof setTargetSect) =>
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value as Sect);
    };

  const handleOriginalFormChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setOriginalForm(value === "无" ? null : (value as WeaponType));
    setShowOriginalData(false);
  };

  const handleReset = () => {
    resetAttributes();
    setShowOriginalData(false);
  };

  const unchangedResultMessage = (() => {
    switch (conversionOutcome) {
      case "seal-rule":
        return {
          title: "属性保持不变",
          description:
            "本次转换涉及封印造型，按转换规则不调整武器属性。",
        };
      case "same-attribute-type":
        return {
          title: "属性保持不变",
          description:
            "本次转换路径中的造型属于同一属性类型，无需调整属性数值。",
        };
      case "calculated-same":
        return {
          title: "换算结果一致",
          description:
            "换算过程已执行，最终数值与当前值一致。这通常由转换路径、属性比例或取整造成。",
        };
      default:
        return null;
    }
  })();

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-5 p-4 sm:p-6">
        <section className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-inset ring-slate-200/70">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">转换设置</h2>
          <div>
            <label
              htmlFor="weapon-level"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              武器等级
            </label>
            <select
              id="weapon-level"
              className="block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={String(weaponLevel)}
              onChange={(event) =>
                setWeaponLevelAndMaxValues(
                  WEAPON_LEVEL_OPTIONS[event.target.selectedIndex].id
                )
              }
            >
              {WEAPON_LEVEL_OPTIONS.map((option) => (
                <option key={option.id} value={String(option.id)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="original-form"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                原造型
              </label>
              <select
                id="original-form"
                className="block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={originalForm ?? "无"}
                onChange={handleOriginalFormChange}
              >
                <option value="无">无</option>
                <SectOptions valueType="weapon" />
              </select>
            </div>

            <div>
              <label
                htmlFor="current-sect"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                当前造型
              </label>
              <select
                id="current-sect"
                className="block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={currentSect}
                onChange={handleSectChange(setCurrentSect)}
              >
                <SectOptions valueType="sect" />
              </select>
            </div>

            <div>
              <label
                htmlFor="target-sect"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                目标造型
              </label>
              <select
                id="target-sect"
                className="block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={targetSect}
                onChange={handleSectChange(setTargetSect)}
              >
                <SectOptions valueType="sect" />
              </select>
            </div>
          </div>

        </section>

        <section className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-inset ring-slate-200/70">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">武器属性</h2>
              <p className="mt-1 text-xs text-slate-500">
                输入当前值，最高值仅供参考。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 px-2 sm:gap-4 sm:px-3">
            <div className="text-center text-xs font-medium text-slate-500 sm:text-sm">
              属性
            </div>
            <div className="text-center text-xs font-medium text-slate-500 sm:text-sm">
              当前值
            </div>
            <div className="text-center text-xs font-medium text-slate-500 sm:text-sm">
              最高值
            </div>
          </div>

          {ATTRIBUTE_FIELDS.map(({ type, label }) => {
            const attribute = attributes[type];
            const inputId = `${type}-current`;

            return (
              <div
                key={type}
                className="mt-2 grid grid-cols-3 items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-inset ring-slate-200/70 sm:gap-4 sm:p-3"
              >
                <label
                  htmlFor={inputId}
                  className="text-center text-sm font-medium text-slate-700"
                >
                  {label}
                </label>
                <input
                  id={inputId}
                  type="number"
                  min={0}
                  max={attribute.max}
                  step={1}
                  inputMode="numeric"
                  aria-label={`${label}当前值`}
                  className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  value={attribute.current ?? ""}
                  onChange={(event) =>
                    handleAttributeChange(type, event.target.value)
                  }
                />
                <input
                  type="number"
                  aria-label={`${label}最高值`}
                  className="block h-10 w-full border-0 bg-transparent px-2 text-center text-sm font-medium text-slate-500 shadow-none disabled:cursor-default disabled:opacity-100"
                  value={attribute.max}
                  disabled
                />
              </div>
            );
          })}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            数据依据：{levelVerification.sourceNote} · 最近核验：
            {levelVerification.verifiedAt ?? "待复核"}
          </p>
        </section>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            className="min-h-11 flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={convertAttributes}
          >
            转换
          </button>

          <button
            type="button"
            className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            onClick={handleReset}
          >
            重置
          </button>
        </div>

        {result && (
          <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-blue-100 bg-blue-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">转换结果</h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                  <p>
                    <span className="mr-1.5 text-slate-400">门派</span>
                    {currentSect} → {targetSect}
                  </p>
                  <p>
                    <span className="mr-1.5 text-slate-400">造型</span>
                    {originalForm
                      ? `${SECT_WEAPON_TYPES[currentSect]} → ${originalForm} → ${SECT_WEAPON_TYPES[targetSect]}`
                      : `${SECT_WEAPON_TYPES[currentSect]} → ${SECT_WEAPON_TYPES[targetSect]}`}
                  </p>
                </div>
              </div>
              {originalForm && (
                <button
                  type="button"
                  onClick={() => setShowOriginalData((visible) => !visible)}
                  className="flex min-h-10 items-center gap-1.5 self-start rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:self-auto"
                  aria-expanded={showOriginalData}
                  aria-controls="original-form-values"
                  aria-label={
                    showOriginalData ? "收起原造型值" : "查看原造型值"
                  }
                  title={showOriginalData ? "收起原造型值" : "查看原造型值"}
                >
                  <span>原造型值</span>
                  <svg
                    aria-hidden="true"
                    className={`h-4 w-4 transition-transform ${
                      showOriginalData ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m6 9 6 6 6-6"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="space-y-4 p-4">
              <div id="original-form-values">
                <div
                  className={`grid items-center gap-1 px-3 pb-2 text-[11px] font-medium text-slate-400 sm:gap-3 sm:text-xs ${
                    showOriginalData
                      ? "grid-cols-[minmax(3rem,1fr)_minmax(2.5rem,.75fr)_minmax(3.5rem,1fr)_minmax(2.5rem,.75fr)_auto]"
                      : "grid-cols-[1fr_1.5fr_auto]"
                  }`}
                >
                  <span>属性</span>
                  {showOriginalData ? (
                    <>
                      <span className="text-center">当前值</span>
                      <span className="text-center">
                        原造型值<span className="hidden sm:inline">（{originalForm}）</span>
                      </span>
                      <span className="text-center">转换后</span>
                    </>
                  ) : (
                    <span className="text-center">当前值 → 转换后</span>
                  )}
                  <span className="min-w-12 text-right">变化</span>
                </div>
                <div className="space-y-2">
                  {ATTRIBUTE_FIELDS.map(({ type, label }) => {
                    const change =
                      result[type].current - (attributes[type].current ?? 0);

                    return (
                      <div
                        key={type}
                        className={`grid items-center gap-1 rounded-lg bg-slate-50/80 px-3 py-2.5 sm:gap-3 ${
                          showOriginalData
                            ? "grid-cols-[minmax(3rem,1fr)_minmax(2.5rem,.75fr)_minmax(3.5rem,1fr)_minmax(2.5rem,.75fr)_auto]"
                            : "grid-cols-[1fr_1.5fr_auto]"
                        }`}
                      >
                        <span className="text-sm font-medium text-slate-700">
                          {label}
                        </span>
                        {showOriginalData ? (
                          <>
                            <span className="text-center text-xs tabular-nums text-slate-500 sm:text-sm">
                              {attributes[type].current ?? 0}
                            </span>
                            <span
                              className="justify-self-center rounded-md bg-blue-50 px-1.5 py-0.5 text-center text-xs font-medium tabular-nums text-blue-700 ring-1 ring-inset ring-blue-100 sm:text-sm"
                              data-testid={`original-form-${type}`}
                            >
                              （{originalData?.[type].current ?? "N/A"}）
                            </span>
                            <span className="text-center text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
                              {result[type].current}
                            </span>
                          </>
                        ) : (
                          <div className="flex min-w-0 items-center justify-center gap-2 text-sm tabular-nums">
                            <span className="text-slate-500">
                              {attributes[type].current ?? 0}
                            </span>
                            <span aria-hidden="true" className="text-slate-300">
                              →
                            </span>
                            <span className="text-base font-semibold text-slate-900">
                              {result[type].current}
                            </span>
                          </div>
                        )}
                        <span
                          className={`min-w-12 rounded-md px-2 py-1 text-right text-xs font-semibold tabular-nums ${getChangeClassName(
                            change
                          )}`}
                          aria-label={change === 0 ? "无变化" : undefined}
                        >
                          {change === 0
                            ? "—"
                            : `${change > 0 ? "+" : ""}${change}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {unchangedResultMessage && (
                <div
                  className="rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5"
                  role="status"
                >
                  <p className="text-sm leading-6 text-slate-600">
                    <strong className="font-semibold text-slate-800">
                      {unchangedResultMessage.title}：
                    </strong>
                    {unchangedResultMessage.description}
                  </p>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-left text-xs leading-5 text-slate-400">
                  结果可能与游戏实际数值存在少量误差，仅供参考。
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default WeaponConverter;
