import { useState } from "react";
import type { Sect } from "../types";
import { SECTS_BY_PROFESSION } from "../types/constants";
import {
  convertRingSecondaryAttribute,
  getRingSecondaryAttributeConfig,
  RING_RULE_VERIFICATION,
} from "../utils/ringConverter";
import { loadPreferences, updatePreferences } from "../utils/preferences";

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
  health: { before: number; after: number };
  secondary: { before: number; after: number };
};

const getChangeClassName = (change: number) => {
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
  return "text-slate-500";
};

const RingConverter = () => {
  const [initialPreferences] = useState(loadPreferences);
  const [currentSect, setCurrentSect] = useState<Sect>(
    initialPreferences.ringCurrentSect,
  );
  const [targetSect, setTargetSect] = useState<Sect>(
    initialPreferences.ringTargetSect,
  );
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
    setter: (value: number | null) => void,
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
      health: { before: health, after: health },
      secondary: {
        before: secondary,
        after: convertRingSecondaryAttribute(
          secondary,
          currentSect,
          targetSect,
        ),
      },
    });
  };

  const handleReset = () => {
    setHealth(null);
    setSecondary(null);
    resetFeedback();
  };

  const handleCurrentSectChange = (sect: Sect) => {
    setCurrentSect(sect);
    resetFeedback();
    updatePreferences({ ringCurrentSect: sect });
  };

  const handleTargetSectChange = (sect: Sect) => {
    setTargetSect(sect);
    resetFeedback();
    updatePreferences({ ringTargetSect: sect });
  };

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-5 p-4 sm:p-6">
        <section className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-inset ring-slate-200/70">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            转换设置
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="ring-current-sect"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                当前门派
              </label>
              <select
                id="ring-current-sect"
                className="block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={currentSect}
                onChange={(event) => {
                  handleCurrentSectChange(event.target.value as Sect);
                }}
              >
                <SectOptions />
              </select>
            </div>

            <div>
              <label
                htmlFor="ring-target-sect"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                目标门派
              </label>
              <select
                id="ring-target-sect"
                className="block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                value={targetSect}
                onChange={(event) => {
                  handleTargetSectChange(event.target.value as Sect);
                }}
              >
                <SectOptions />
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-slate-50/80 p-4 ring-1 ring-inset ring-slate-200/70">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">戒指主属性</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              戒指为全等级装备，属性值会随角色等级自动成长。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 px-2 text-center text-xs font-medium text-slate-500 sm:gap-4 sm:px-3 sm:text-sm">
            <div>属性</div>
            <div>当前值</div>
          </div>

          <div className="mt-2 grid grid-cols-2 items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-inset ring-slate-200/70 sm:gap-4 sm:p-3">
            <label
              htmlFor="ring-health"
              className="text-center text-sm font-medium text-slate-700"
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
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={health ?? ""}
              onChange={(event) =>
                handleNumberChange(event.target.value, setHealth)
              }
            />
          </div>

          <div className="mt-2 grid grid-cols-2 items-center gap-2 rounded-lg bg-white p-2 ring-1 ring-inset ring-slate-200/70 sm:gap-4 sm:p-3">
            <label
              htmlFor="ring-secondary"
              className="text-center text-sm font-medium text-slate-700"
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
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              value={secondary ?? ""}
              onChange={(event) =>
                handleNumberChange(event.target.value, setSecondary)
              }
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            数据依据：{RING_RULE_VERIFICATION.sourceNote} · 最近核验：
            {RING_RULE_VERIFICATION.verifiedAt ?? "待复核"}
          </p>
        </section>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            className="min-h-11 flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={handleConvert}
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

        {result ? (
          <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-blue-50/70 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-900">
                转换结果
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {currentSect} → {targetSect}
              </p>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <div className="grid grid-cols-[1fr_1.5fr_auto] gap-3 px-3 pb-2 text-xs font-medium text-slate-400">
                  <span>属性</span>
                  <span className="text-center">原值 → 新值</span>
                  <span className="min-w-12 text-right">变化</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-3 rounded-lg bg-slate-50 px-3 py-3">
                    <span className="text-sm font-medium text-slate-700">
                      气血
                    </span>
                    <div className="flex min-w-0 items-center justify-center gap-2 text-sm">
                      <span className="text-slate-500">
                        {result.health.before}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        →
                      </span>
                      <span className="text-base font-semibold text-slate-900">
                        {result.health.after}
                      </span>
                    </div>
                    <span className="min-w-12 rounded-full bg-white px-2 py-1 text-right text-xs font-semibold text-slate-500">
                      0
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_1.5fr_auto] items-center gap-3 rounded-lg bg-slate-50 px-3 py-3">
                    <span className="text-sm font-medium text-slate-700">
                      {targetAttribute.label}
                    </span>
                    <div className="flex min-w-0 items-center justify-center gap-2 text-sm">
                      <span className="text-slate-500">
                        {result.secondary.before}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">
                        →
                      </span>
                      <span className="text-base font-semibold text-slate-900">
                        {result.secondary.after}
                      </span>
                    </div>
                    <span
                      className={`min-w-12 rounded-full bg-white px-2 py-1 text-right text-xs font-semibold ${getChangeClassName(
                        result.secondary.after - result.secondary.before,
                      )}`}
                    >
                      {result.secondary.after - result.secondary.before > 0
                        ? "+"
                        : ""}
                      {result.secondary.after - result.secondary.before}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="text-left text-xs leading-5 text-slate-500">
                  温馨提示：转换结果可能与游戏实际数值存在轻微差异，仅供参考
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default RingConverter;
