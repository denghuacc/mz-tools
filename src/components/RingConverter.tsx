import { useState } from "react";
import type { Sect } from "../types";
import { SECTS_BY_PROFESSION } from "../types/constants";
import {
  convertRingSecondaryAttribute,
  getRingSecondaryAttributeConfig,
} from "../utils/ringConverter";

const SectOptions = () =>
  Object.entries(SECTS_BY_PROFESSION).map(([profession, sects]) => (
    <optgroup key={profession} label={profession}>
      {sects.map((sect) => (
        <option key={sect} value={sect}>
          {sect}
        </option>
      ))}
    </optgroup>
  ));

type RingConversionResult = {
  health: number;
  secondary: number;
};

const RingConverter = () => {
  const [currentSect, setCurrentSect] = useState<Sect>("鬼王宗");
  const [targetSect, setTargetSect] = useState<Sect>("青云门");
  const [health, setHealth] = useState<number | null>(null);
  const [secondary, setSecondary] = useState<number | null>(null);
  const [result, setResult] = useState<RingConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentAttribute = getRingSecondaryAttributeConfig(currentSect);
  const targetAttribute = getRingSecondaryAttributeConfig(targetSect);

  const resetFeedback = () => {
    setResult(null);
    setError(null);
  };

  const handleNumberChange = (
    value: string,
    setter: (value: number | null) => void
  ) => {
    setter(value === "" ? null : Number(value));
    resetFeedback();
  };

  const handleConvert = () => {
    setError(null);

    if (health === null || secondary === null) {
      setResult(null);
      setError("请完整输入气血和第二主属性数值");
      return;
    }

    if (!Number.isFinite(health) || health < 0) {
      setResult(null);
      setError("气血值必须是大于或等于0的有效数字");
      return;
    }

    if (!Number.isFinite(secondary) || secondary < 0) {
      setResult(null);
      setError(`${currentAttribute.label}值必须是大于或等于0的有效数字`);
      return;
    }

    setResult({
      health,
      secondary: convertRingSecondaryAttribute(
        secondary,
        currentSect,
        targetSect
      ),
    });
  };

  const handleReset = () => {
    setHealth(null);
    setSecondary(null);
    resetFeedback();
  };

  return (
    <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h1 className="mb-1 text-center text-2xl font-bold sm:text-3xl">
        梦幻新诛仙
      </h1>
      <h2 className="mb-3 text-center text-lg font-semibold text-gray-600 sm:text-xl">
        戒指属性转换器
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ring-current-sect"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              转换前门派
            </label>
            <select
              id="ring-current-sect"
              className="mt-1 block w-full rounded-md border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={currentSect}
              onChange={(event) => {
                setCurrentSect(event.target.value as Sect);
                resetFeedback();
              }}
            >
              <SectOptions />
            </select>
          </div>

          <div>
            <label
              htmlFor="ring-target-sect"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              转换后门派
            </label>
            <select
              id="ring-target-sect"
              className="mt-1 block w-full rounded-md border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={targetSect}
              onChange={(event) => {
                setTargetSect(event.target.value as Sect);
                resetFeedback();
              }}
            >
              <SectOptions />
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">戒指主属性</p>
          <p className="text-sm text-gray-500">
            戒指为全等级装备，属性值会随角色等级自动成长。
          </p>

          <div className="grid grid-cols-2 gap-2 px-2 text-center text-sm font-medium text-gray-600 sm:gap-4 sm:px-4 sm:text-base">
            <div>属性</div>
            <div>当前值</div>
          </div>

          <div className="grid grid-cols-2 items-center gap-2 rounded-lg bg-gray-50 p-2 sm:gap-4 sm:p-3">
            <label
              htmlFor="ring-health"
              className="text-center text-sm font-medium text-gray-700"
            >
              气血
            </label>
            <input
              id="ring-health"
              aria-label="气血当前值"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="block w-full rounded-md border-gray-300 text-center text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={health ?? ""}
              onChange={(event) =>
                handleNumberChange(event.target.value, setHealth)
              }
            />
          </div>

          <div className="grid grid-cols-2 items-center gap-2 rounded-lg bg-gray-50 p-2 sm:gap-4 sm:p-3">
            <label
              htmlFor="ring-secondary"
              className="text-center text-sm font-medium text-gray-700"
            >
              {currentAttribute.label}
            </label>
            <input
              id="ring-secondary"
              aria-label={`${currentAttribute.label}当前值`}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              className="block w-full rounded-md border-gray-300 text-center text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={secondary ?? ""}
              onChange={(event) =>
                handleNumberChange(event.target.value, setSecondary)
              }
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            className="flex-1 rounded-md bg-indigo-600 px-4 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:py-2"
            onClick={handleConvert}
          >
            转换
          </button>
          <button
            type="button"
            className="rounded-md bg-gray-100 px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:py-2"
            onClick={handleReset}
          >
            重置
          </button>
        </div>

        {result ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="bg-green-600 px-4 py-3 text-white">
              <h3 className="text-center text-lg font-semibold">转换结果</h3>
            </div>
            <div className="space-y-3 p-4">
              <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center text-sm text-blue-700">
                {currentSect} → {targetSect}
              </p>
              <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                <span className="text-sm font-medium text-gray-700">气血</span>
                <span className="text-lg font-semibold text-gray-900">
                  {result.health}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                <span className="text-sm font-medium text-gray-700">
                  {targetAttribute.label}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {result.secondary}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RingConverter;
