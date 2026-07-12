import { useState } from "react";
import { useWeaponConverter } from "../hooks/useWeaponConverter";
import type { AttributeType, Sect, WeaponLevel, WeaponType } from "../types";
import {
  ATTRIBUTE_FIELDS,
  SECTS_BY_PROFESSION,
  SECT_WEAPON_TYPES,
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
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
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
    error,
    convertAttributes,
    resetAttributes,
    originalData,
  } = useWeaponConverter();

  // 控制原造型数据展示的状态
  const [showOriginalData, setShowOriginalData] = useState(false);

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

  const allChangesZero =
    result !== null &&
    ATTRIBUTE_FIELDS.every(
      ({ type }) => result[type].current === attributes[type].current
    );

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
              value={weaponLevel}
              onChange={(e) =>
                setWeaponLevelAndMaxValues(
                  e.target.value === "60-standard"
                    ? "60-standard"
                    : (Number(e.target.value) as WeaponLevel)
                )
              }
            >
              <option value={60}>60级（69特色服）</option>
              <option value="60-standard">60级</option>
              <option value={80}>80级</option>
              <option value={110}>110级</option>
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
            <div className="flex items-center justify-between gap-4 border-b border-blue-100 bg-blue-50/70 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">转换结果</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {currentSect} → {targetSect}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
                <span>
                  {originalForm
                    ? `${SECT_WEAPON_TYPES[currentSect]} → ${originalForm} → ${SECT_WEAPON_TYPES[targetSect]}`
                    : `${SECT_WEAPON_TYPES[currentSect]} → ${SECT_WEAPON_TYPES[targetSect]}`}
                </span>
                {originalForm && (
                  <button
                    type="button"
                    onClick={() => setShowOriginalData(!showOriginalData)}
                    className="rounded-md p-1 text-blue-600 transition hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="查看原造型数据"
                  >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4 p-4">

              {originalForm && showOriginalData && (
                <div
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                  data-testid="original-form-attributes"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-700">
                      原造型属性 ({originalForm})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowOriginalData(false)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                      aria-label="关闭原造型属性"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ATTRIBUTE_FIELDS.map(({ type, label }) => (
                      <div
                        key={type}
                        className="flex items-center justify-between rounded bg-white px-2 py-1 text-sm"
                      >
                        <span className="text-slate-600">{label}</span>
                        <span className="font-medium text-slate-900">
                          {originalData?.[type].current ?? "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="grid grid-cols-[1fr_1.5fr_auto] gap-3 px-3 pb-2 text-xs font-medium text-slate-400">
                  <span>属性</span>
                  <span className="text-center">原值 → 新值</span>
                  <span className="min-w-12 text-right">变化</span>
                </div>
                <div className="space-y-2">
                  {ATTRIBUTE_FIELDS.map(({ type, label }) => {
                  const change =
                    result[type].current - (attributes[type].current ?? 0);

                  return (
                    <div
                      key={type}
                      className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-3 rounded-lg bg-slate-50 px-3 py-3"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {label}
                      </span>
                      <div className="flex min-w-0 items-center justify-center gap-2 text-sm">
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
                      <span
                        className={`min-w-12 rounded-full bg-white px-2 py-1 text-right text-xs font-semibold ${getChangeClassName(
                          change
                        )}`}
                      >
                        {change > 0 ? "+" : ""}
                        {change}
                      </span>
                    </div>
                  );
                  })}
                </div>
              </div>

            {allChangesZero && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-amber-800">
                      <strong>转换变化较小：</strong>
                      当前武器的属性比例接近，转换后数值变化不明显。这是正常现象，转换确实已生效。
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-center text-xs leading-5 text-slate-500">
                温馨提示：转换结果可能与游戏实际数值存在轻微差异，仅供参考
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
