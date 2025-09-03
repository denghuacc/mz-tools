import { useCallback, useEffect } from "react";
import {
  useWeaponConverter,
  type WeaponLevel,
  type Sect,
  SECTS_BY_PROFESSION,
  SECT_WEAPON_TYPES,
} from "../hooks/useWeaponConverter";

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
  } = useWeaponConverter();

  // 设置默认武器等级
  useEffect(() => {
    setWeaponLevelAndMaxValues(60);
  }, [setWeaponLevelAndMaxValues]);

  const handleAttributeChange = useCallback(
    (type: "physical" | "magic" | "healing", value: string) => {
      const numValue = value ? Number(value) : (undefined as unknown as number);
      setAttributes((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          current: numValue,
        },
      }));
    },
    [setAttributes]
  );

  const handleSectChange = useCallback(
    (setter: typeof setCurrentSect | typeof setTargetSect) =>
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setter(e.target.value as Sect);
      },
    []
  );

  const handleOriginalFormChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setOriginalForm(e.target.value === "无" ? null : e.target.value);
    },
    [setOriginalForm]
  );

  return (
    <div className="w-full max-w-2xl p-4 sm:p-6 bg-white rounded-lg shadow-lg h-screen overflow-y-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-center">
        梦幻新诛仙
      </h1>
      <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center text-gray-600">
        武器属性转换器
      </h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            武器等级
          </label>
          <div className="flex items-center gap-2">
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-100 text-base"
              value={weaponLevel}
              onChange={(e) =>
                setWeaponLevelAndMaxValues(
                  Number(e.target.value) as WeaponLevel
                )
              }
            >
              <option value={60}>60级</option>
              <option value={110}>110级</option>
            </select>
          </div>
        </div>

        {/* 原造型和武器选择在同一行 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              原造型
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
              value={originalForm || "无"}
              onChange={handleOriginalFormChange}
            >
              <option value="无">无</option>
              {Object.entries(SECTS_BY_PROFESSION).map(
                ([profession, sects]) => (
                  <optgroup key={profession} label={profession}>
                    {sects.map((sect) => (
                      <option key={sect} value={SECT_WEAPON_TYPES[sect]}>
                        {sect} - {SECT_WEAPON_TYPES[sect]}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              转换前
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
              value={currentSect}
              onChange={handleSectChange(setCurrentSect)}
            >
              {Object.entries(SECTS_BY_PROFESSION).map(
                ([profession, sects]) => (
                  <optgroup key={profession} label={profession}>
                    {sects.map((sect) => (
                      <option key={sect} value={sect}>
                        {sect} - {SECT_WEAPON_TYPES[sect]}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              转换后
            </label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
              value={targetSect}
              onChange={handleSectChange(setTargetSect)}
            >
              {Object.entries(SECTS_BY_PROFESSION).map(
                ([profession, sects]) => (
                  <optgroup key={profession} label={profession}>
                    {sects.map((sect) => (
                      <option key={sect} value={sect}>
                        {sect} - {SECT_WEAPON_TYPES[sect]}
                      </option>
                    ))}
                  </optgroup>
                )
              )}
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

          {/* 物攻 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center bg-gray-50 p-2 sm:p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-700 text-center">
              物攻
            </div>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base text-center"
              value={attributes.physical.current || ""}
              onChange={(e) =>
                handleAttributeChange("physical", e.target.value)
              }
            />
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 bg-gray-50 text-center text-base"
              value={attributes.physical.max || ""}
              disabled
            />
          </div>

          {/* 法攻 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center bg-gray-50 p-2 sm:p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-700 text-center">
              法攻
            </div>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base text-center"
              value={attributes.magic.current || ""}
              onChange={(e) => handleAttributeChange("magic", e.target.value)}
            />
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 bg-gray-50 text-center text-base"
              value={attributes.magic.max || ""}
              disabled
            />
          </div>

          {/* 治疗 */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center bg-gray-50 p-2 sm:p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-700 text-center">
              治疗
            </div>
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base text-center"
              value={attributes.healing.current || ""}
              onChange={(e) => handleAttributeChange("healing", e.target.value)}
            />
            <input
              type="number"
              className="block w-full rounded-md border-gray-300 bg-gray-50 text-center text-base"
              value={attributes.healing.max || ""}
              disabled
            />
          </div>
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
            onClick={resetAttributes}
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
                <div className="text-center">
                  <span className="text-sm text-blue-700">
                    {originalForm
                      ? `${SECT_WEAPON_TYPES[currentSect]} → ${originalForm} → ${SECT_WEAPON_TYPES[targetSect]}`
                      : `${SECT_WEAPON_TYPES[currentSect]} → ${SECT_WEAPON_TYPES[targetSect]}`}
                  </span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <span className="text-lg font-semibold text-green-700">
                    {targetSect} - {SECT_WEAPON_TYPES[targetSect]}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">
                    物攻
                  </span>
                  <span className="font-semibold text-lg text-gray-900">
                    {result.physical.current}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">
                    法攻
                  </span>
                  <span className="font-semibold text-lg text-gray-900">
                    {result.magic.current}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium text-gray-700">
                    治疗
                  </span>
                  <span className="font-semibold text-lg text-gray-900">
                    {result.healing.current}
                  </span>
                </div>
              </div>
            </div>
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
