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
  return "text-gray-500";
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
    <div className="w-full max-w-2xl p-4 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-center">
        梦幻新诛仙
      </h1>
      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-600">
        武器属性转换器
      </h2>

      <div className="space-y-3">
        <div>
          <label
            htmlFor="weapon-level"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            武器等级
          </label>
          <div className="flex items-center gap-2">
            <select
              id="weapon-level"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-base"
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
        </div>

        {/* 原造型和武器选择在同一行 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="original-form"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              原造型
            </label>
            <select
              id="original-form"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              转换前
            </label>
            <select
              id="current-sect"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
              value={currentSect}
              onChange={handleSectChange(setCurrentSect)}
            >
              <SectOptions valueType="sect" />
            </select>
          </div>

          <div>
            <label
              htmlFor="target-sect"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              转换后
            </label>
            <select
              id="target-sect"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
              value={targetSect}
              onChange={handleSectChange(setTargetSect)}
            >
              <SectOptions valueType="sect" />
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            武器属性
          </label>

          {/* 表头 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 px-2 sm:px-4">
            <div className="text-center font-medium text-gray-600 text-sm sm:text-base">
              属性
            </div>
            <div className="text-center font-medium text-gray-600 text-sm sm:text-base">
              当前值
            </div>
            <div className="text-center font-medium text-gray-600 text-sm sm:text-base">
              最高值
            </div>
          </div>

          {ATTRIBUTE_FIELDS.map(({ type, label }) => {
            const attribute = attributes[type];
            const inputId = `${type}-current`;

            return (
              <div
                key={type}
                className="grid grid-cols-3 gap-2 sm:gap-4 items-center bg-gray-50 p-2 sm:p-3 rounded-lg"
              >
                <label
                  htmlFor={inputId}
                  className="text-sm font-medium text-gray-700 text-center"
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base text-center"
                  value={attribute.current ?? ""}
                  onChange={(event) =>
                    handleAttributeChange(type, event.target.value)
                  }
                />
                <input
                  type="number"
                  aria-label={`${label}最高值`}
                  className="block w-full rounded-md border-gray-300 bg-gray-50 text-center text-base"
                  value={attribute.max}
                  disabled
                />
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
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

        {/* 转换按钮 */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            className="flex-1 bg-indigo-600 text-white py-3 sm:py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-base font-medium"
            onClick={convertAttributes}
          >
            转换
          </button>

          <button
            className="px-4 py-3 sm:py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-base font-medium"
            onClick={handleReset}
          >
            重置
          </button>
        </div>

        {result && (
          <div className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-600 text-white px-4 py-3">
              <h2 className="text-lg font-semibold text-center">转换结果</h2>
            </div>
            <div className="p-4">
              {/* 转换路径描述 */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-blue-700">
                    {originalForm
                      ? `${SECT_WEAPON_TYPES[currentSect]} → ${originalForm} → ${SECT_WEAPON_TYPES[targetSect]}`
                      : `${SECT_WEAPON_TYPES[currentSect]} → ${SECT_WEAPON_TYPES[targetSect]}`}
                  </span>
                  {originalForm && (
                    <button
                      onClick={() => setShowOriginalData(!showOriginalData)}
                      className="ml-2 p-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
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

              {/* 原造型数据展示 */}
              {originalForm && showOriginalData && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-yellow-800">
                      原造型属性 ({originalForm})
                    </h3>
                    <button
                      onClick={() => setShowOriginalData(false)}
                      className="text-yellow-600 hover:text-yellow-800"
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
                        className="flex justify-between items-center py-1 px-2 bg-white rounded text-sm"
                      >
                        <span className="text-yellow-700">{label}</span>
                        <span className="font-medium text-yellow-800">
                          {originalData?.[type].current ?? "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <span className="text-lg font-semibold text-green-700">
                    {targetSect} - {SECT_WEAPON_TYPES[targetSect]}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {ATTRIBUTE_FIELDS.map(({ type, label }) => {
                  const change =
                    result[type].current - (attributes[type].current ?? 0);

                  return (
                    <div
                      key={type}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {label}
                      </span>
                      <div className="flex items-center justify-end space-x-3 min-w-0">
                        <span className="font-semibold text-lg text-gray-900 text-right">
                          {result[type].current}
                        </span>
                        <span
                          className={`text-sm font-medium text-right min-w-[3rem] ${getChangeClassName(
                            change
                          )}`}
                        >
                          {change > 0 ? "+" : ""}
                          {change}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {allChangesZero && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
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
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700 text-center">
                温馨提示：转换结果可能与游戏实际数值存在轻微差异，仅供参考
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaponConverter;
